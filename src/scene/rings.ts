import {
  BufferGeometry,
  DataTexture,
  DoubleSide,
  LineBasicMaterial,
  LineLoop,
  LinearFilter,
  Mesh,
  RedFormat,
  RingGeometry,
  ShaderMaterial,
  UnsignedByteType,
  Vector3,
} from 'three';
import type { RingSystem } from '../data/types';
import { ringProfile, ringlets, type Ringlet } from '../sim/rings';

const PROFILE_SAMPLES = 2048;
const RING_SEGMENTS = 256;
/** Drawing choices: the catalogue has ring opacity but no colour, so one icy tone is used. */
const RING_COLOR = '#d6ccb4';
/** How much of its brightness a ring keeps inside the planet's shadow. */
const SHADOW_BRIGHTNESS = 0.06;

/** The opacity profile as a one-row texture, shared by the rings and the shadow they cast. */
export interface RingMap {
  readonly texture: DataTexture;
  /** Narrow rings, drawn as lines; radii in equatorial radii of the planet. */
  readonly ringlets: readonly Ringlet[];
  readonly kmPerUnit: number;
  /** Inner and outer radius, in equatorial radii of the planet. */
  readonly inner: number;
  readonly outer: number;
}

export function createRingMap(system: RingSystem, planetEquatorialRadiusKm: number): RingMap {
  const profile = ringProfile(system, PROFILE_SAMPLES);
  const data = new Uint8Array(PROFILE_SAMPLES);
  profile.opacity.forEach((value, i) => {
    data[i] = Math.round(value * 255);
  });
  const texture = new DataTexture(data, PROFILE_SAMPLES, 1, RedFormat, UnsignedByteType);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return {
    texture,
    ringlets: ringlets(system),
    kmPerUnit: planetEquatorialRadiusKm,
    inner: profile.innerRadiusKm / planetEquatorialRadiusKm,
    outer: profile.outerRadiusKm / planetEquatorialRadiusKm,
  };
}

// The logdepthbuf chunks keep the rings ordered correctly with the stage's logarithmic depth.
const VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

// The planet is a unit sphere at the origin of the space the ring is drawn in, so a point of
// the ring is in shadow when the line from it towards the Sun passes through that sphere.
const FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform sampler2D profile;
  uniform float inner;
  uniform float outer;
  uniform vec3 color;
  uniform vec3 sunDirection;
  uniform float shadowBrightness;
  varying vec3 vPosition;
  void main() {
    #include <logdepthbuf_fragment>
    float radius = length(vPosition.xy);
    float opacity = texture2D(profile, vec2((radius - inner) / (outer - inner), 0.5)).r;
    if (opacity <= 0.0) discard;
    float along = dot(vPosition, sunDirection);
    float miss = dot(vPosition, vPosition) - along * along - 1.0;
    float lit = along < 0.0 ? smoothstep(-0.02, 0.02, miss) : 1.0;
    gl_FragColor = vec4(color * mix(shadowBrightness, 1.0, lit), opacity);
    #include <colorspace_fragment>
  }
`;

export interface Rings {
  /** Add to the planet's flattened group: one unit there is one equatorial radius. */
  readonly mesh: Mesh;
  /** Tells the rings where the Sun is, as a direction in world space. */
  setSunDirection(worldDirection: Vector3): void;
  dispose(): void;
}

export function createRings(map: RingMap): Rings {
  const geometry = new RingGeometry(map.inner, map.outer, RING_SEGMENTS, 1);
  const sunDirection = new Vector3(1, 0, 0);
  const material = new ShaderMaterial({
    uniforms: {
      profile: { value: map.texture },
      inner: { value: map.inner },
      outer: { value: map.outer },
      color: { value: new Vector3(...hexToLinear(RING_COLOR)) },
      sunDirection: { value: sunDirection },
      shadowBrightness: { value: SHADOW_BRIGHTNESS },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  // RingGeometry lies in its xy plane; the planet's equator is the xz plane of its tilt group.
  mesh.rotation.x = -Math.PI / 2;

  // A ringlet is far too narrow to have a drawable width, so it is a thin line at its real
  // radius, as strong as its opacity. Lines sit in the ring's own plane, as children of it.
  const lines = map.ringlets.map((ringlet) => {
    const radius = ringlet.radiusKm / map.kmPerUnit;
    const points = Array.from({ length: RING_SEGMENTS }, (_, i) => {
      const angle = (i / RING_SEGMENTS) * 2 * Math.PI;
      return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    });
    const line = new LineLoop(
      new BufferGeometry().setFromPoints(points),
      new LineBasicMaterial({ color: RING_COLOR, transparent: true, opacity: ringlet.opacity }),
    );
    mesh.add(line);
    return line;
  });

  const inverse = mesh.matrixWorld.clone();
  return {
    mesh,
    setSunDirection(worldDirection) {
      mesh.updateWorldMatrix(true, false);
      inverse.copy(mesh.matrixWorld).invert();
      sunDirection.copy(worldDirection).transformDirection(inverse);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      for (const line of lines) {
        line.geometry.dispose();
        line.material.dispose();
      }
    },
  };
}

/** sRGB hex colour to linear RGB components, which is what the shader works in. */
function hexToLinear(hex: string): [number, number, number] {
  const channel = (offset: number): number => {
    const srgb = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5)];
}
