import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector3,
  type Material,
  type Texture,
} from 'three';
import type { CelestialObject, RingSystem, SpheroidShape } from '../data/types';
import { eclipticToScene, northPoleEcliptic, poleOf } from '../sim/frames';
import { sceneRadii } from '../sim/layout';
import type { Scale } from '../sim/scale';
import { spinAngleRad } from '../sim/spin';
import { createRingMap, createRings, type RingMap, type Rings } from './rings';

const SPHERE_SEGMENTS = { width: 64, height: 32 };
/** Plain colours for a body with no surface map, and while a map is still loading. */
const UNMAPPED_SURFACE = '#b9b4ab';
const UNMAPPED_STAR = '#fff1c9';
const ANISOTROPY = 4;

const SCENE_UP = new Vector3(0, 1, 0);
/** How much sunlight a fully opaque ring takes off the planet beneath it. */
const RING_SHADOW_STRENGTH = 0.85;

/**
 * Makes a planet's surface darken where its rings stand between it and the Sun. In the
 * planet's own space it is a unit sphere and the rings lie in the plane y = 0, so the shadow at
 * a point is the ring opacity where the line towards the Sun crosses that plane.
 */
function addRingShadow(material: MeshStandardMaterial, map: RingMap, sunDirection: Vector3): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.ringProfile = { value: map.texture };
    shader.uniforms.ringInner = { value: map.inner };
    shader.uniforms.ringOuter = { value: map.outer };
    shader.uniforms.ringSun = { value: sunDirection };
    shader.uniforms.ringShadowStrength = { value: RING_SHADOW_STRENGTH };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjectPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjectPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D ringProfile;
        uniform float ringInner;
        uniform float ringOuter;
        uniform vec3 ringSun;
        uniform float ringShadowStrength;
        varying vec3 vObjectPosition;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `if (abs(ringSun.y) > 1e-6) {
          float steps = -vObjectPosition.y / ringSun.y;
          if (steps > 0.0) {
            float radius = length(vObjectPosition.xz + steps * ringSun.xz);
            if (radius > ringInner && radius < ringOuter) {
              float cover = texture2D(ringProfile, vec2((radius - ringInner) / (ringOuter - ringInner), 0.5)).r;
              gl_FragColor.rgb *= 1.0 - ringShadowStrength * cover;
            }
          }
        }
        #include <dithering_fragment>`,
      );
  };
}

/** A round body: positioned by `group`, tilted to its real pole, flattened and spinning. */
export interface Body {
  readonly id: string;
  /** Add to the scene; set its position to move the body. */
  readonly group: Group;
  /** Drawn equatorial radius under the current scale. */
  radius(): number;
  setScale(scale: Scale): void;
  /** Turns the body to where it is at this date. */
  setDate(jd: number): void;
  /** Tells the body where the Sun is, so ring shadows fall the right way. */
  setSunPosition(sun: { x: number; y: number; z: number }): void;
  dispose(): void;
}

/** Where the app serves a catalogue media file from: `public/` is the site root. */
function mediaUrl(file: string): string {
  return import.meta.env.BASE_URL + file.replace(/^public\//, '');
}

interface Surface {
  readonly material: Material;
  /** Set when the surface is lit by the star and so can show a ring's shadow. */
  readonly lit: MeshStandardMaterial | null;
  readonly texture: Texture | null;
}

function createSurface(object: CelestialObject): Surface {
  // A star shines by itself; everything else is lit by it.
  if (object.kind === 'star') {
    return { material: new MeshBasicMaterial({ color: UNMAPPED_STAR }), lit: null, texture: null };
  }
  const material = new MeshStandardMaterial({
    color: UNMAPPED_SURFACE,
    roughness: 0.95,
    metalness: 0,
  });
  const map = object.media.find((media) => media.role === 'surface-map');
  if (!map) return { material, lit: material, texture: null };

  const texture = new TextureLoader().load(mediaUrl(map.file), () => {
    material.map = texture;
    material.color.set('#ffffff');
    material.needsUpdate = true;
  });
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = ANISOTROPY;
  return { material, lit: material, texture };
}

export function createBody(
  object: CelestialObject,
  shape: SpheroidShape,
  scale: Scale,
  ringSystem: RingSystem | null,
): Body {
  const group = new Group();
  group.name = object.id;

  // The tilt group's +y is the body's north pole. Where the catalogue has no pole, the body
  // stands upright on the ecliptic rather than leaning in a made-up direction.
  const tilt = new Group();
  const pole = poleOf(shape.orientation);
  if (pole) {
    const north = eclipticToScene(northPoleEcliptic(pole));
    tilt.quaternion.setFromUnitVectors(SCENE_UP, new Vector3(north.x, north.y, north.z));
  }
  group.add(tilt);

  const geometry = new SphereGeometry(1, SPHERE_SEGMENTS.width, SPHERE_SEGMENTS.height);
  const { material, lit, texture } = createSurface(object);
  // The flattening lives on a holder so the spinning mesh inside stays a unit sphere.
  const flattened = new Group();
  const mesh = new Mesh(geometry, material);
  flattened.add(mesh);
  tilt.add(flattened);

  // Rings sit in the flattened group, where one unit is one equatorial radius, so they keep
  // their real size against the planet in every scale mode.
  const sunInMesh = new Vector3(1, 0, 0);
  let ringMap: RingMap | null = null;
  let rings: Rings | null = null;
  if (ringSystem) {
    ringMap = createRingMap(ringSystem, shape.equatorialRadiusKm.value);
    rings = createRings(ringMap);
    flattened.add(rings.mesh);
    if (lit) addRingShadow(lit, ringMap, sunInMesh);
  }
  const toSun = new Vector3();
  const centre = new Vector3();
  const inverse = mesh.matrixWorld.clone();

  let equatorial = 0;
  const setScale = (next: Scale): void => {
    const radii = sceneRadii(shape, next);
    equatorial = radii.equatorial;
    flattened.scale.set(radii.equatorial, radii.polar, radii.equatorial);
  };
  setScale(scale);

  return {
    id: object.id,
    group,
    radius: () => equatorial,
    setScale,
    setDate(jd) {
      mesh.rotation.y = spinAngleRad(shape.orientation, jd);
    },
    setSunPosition(sun) {
      if (!rings) return;
      group.updateWorldMatrix(true, true);
      toSun.set(sun.x, sun.y, sun.z).sub(group.getWorldPosition(centre));
      if (toSun.lengthSq() === 0) return;
      toSun.normalize();
      rings.setSunDirection(toSun);
      inverse.copy(mesh.matrixWorld).invert();
      sunInMesh.copy(toSun).transformDirection(inverse);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture?.dispose();
      rings?.dispose();
      ringMap?.texture.dispose();
    },
  };
}
