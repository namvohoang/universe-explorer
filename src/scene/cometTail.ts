import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  SRGBColorSpace,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { COMA_RADIUS_KM, TAIL_LENGTH_AU, tailDirections, tailStrength } from '../sim/comet';
import { KM_PER_AU } from '../sim/constants';
import type { Vec3 } from '../sim/vec3';

/** Drawing choices: a bluish gas tail, a wider cream dust tail and a pale glow round the nucleus. */
const GAS = { color: '#7fb6ff', width: 0.05, opacity: 0.55 };
const DUST = { color: '#f3e3c2', width: 0.16, opacity: 0.4 };
const COMA_COLOR = '214, 236, 255';
const TOWARDS_TIP = new Vector3(0, -1, 0);
/** From this many glow radii away the comet is seen at full strength; closer, it thins out. */
export const VIEW_FROM_RADII = 4;
/** How much of the glow is left when the camera is right at the nucleus. */
const INSIDE_HAZE = 0.06;

// A cone that is brightest at the comet and fades to nothing at its far end.
const VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying float vAlong;
  void main() {
    vAlong = -position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;
const FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform vec3 color;
  uniform float opacity;
  varying float vAlong;
  void main() {
    #include <logdepthbuf_fragment>
    float fade = pow(1.0 - clamp(vAlong, 0.0, 1.0), 1.6);
    gl_FragColor = vec4(color, opacity * fade);
    #include <colorspace_fragment>
  }
`;

function createTail(color: string): Mesh<ConeGeometry, ShaderMaterial> {
  // Unit cone with its point at the origin, opening along −y.
  const geometry = new ConeGeometry(1, 1, 48, 8, true);
  geometry.translate(0, -0.5, 0);
  const material = new ShaderMaterial({
    uniforms: { color: { value: new Color(color) }, opacity: { value: 0 } },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
}

function createComa(): Sprite {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, `rgba(${COMA_COLOR}, 0.95)`);
    gradient.addColorStop(0.25, `rgba(${COMA_COLOR}, 0.4)`);
    gradient.addColorStop(1, `rgba(${COMA_COLOR}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return new Sprite(
    new SpriteMaterial({ map, blending: AdditiveBlending, depthWrite: false, transparent: true }),
  );
}

/**
 * What makes a comet look like one near the Sun: a glowing coma round the nucleus, a gas tail
 * pointing straight away from the Sun and a dust tail trailing behind it.
 */
export interface CometTail {
  readonly group: Group;
  /**
   * @param comet where the comet is, in scene units
   * @param sun where the Sun is, in scene units
   * @param heading which way the comet is moving, in scene units (any length)
   * @param distanceAu the comet's real distance from the Sun
   */
  update(comet: Vec3, sun: Vec3, heading: Vec3, distanceAu: number): void;
  /** Drawn radius of the glow right now, in scene units; 0 when the comet is bare. */
  glowRadius(): number;
  /** Dims the glow and tails as the camera comes inside them, so the nucleus can be seen. */
  setViewer(camera: Vec3): void;
  dispose(): void;
}

export function createCometTail(): CometTail {
  const group = new Group();
  const gas = createTail(GAS.color);
  const dust = createTail(DUST.color);
  const coma = createComa();
  group.add(dust, gas, coma);
  const direction = new Vector3();
  let comaRadius = 0;
  let strengthNow = 0;
  const centre = { x: 0, y: 0, z: 0 };

  const place = (
    mesh: Mesh<ConeGeometry, ShaderMaterial>,
    towards: Vec3,
    length: number,
    style: { width: number; opacity: number },
    strength: number,
  ): void => {
    mesh.quaternion.setFromUnitVectors(TOWARDS_TIP, direction.set(towards.x, towards.y, towards.z));
    mesh.scale.set(length * style.width, length, length * style.width);
    const { opacity } = mesh.material.uniforms;
    if (opacity) opacity.value = style.opacity * strength;
  };

  return {
    group,
    update(comet, sun, heading, distanceAu) {
      const strength = tailStrength(distanceAu);
      group.visible = strength > 0;
      strengthNow = strength;
      comaRadius = 0;
      if (strength === 0) return;
      const sceneDistance = Math.hypot(comet.x - sun.x, comet.y - sun.y, comet.z - sun.z);
      if (sceneDistance === 0) return;
      // The same stretch the scale gives the comet's distance is given to its glow and tails.
      const unitsPerAu = sceneDistance / distanceAu;
      const length = strength * TAIL_LENGTH_AU * unitsPerAu;
      const directions = tailDirections(comet, sun, heading);
      group.position.set(comet.x, comet.y, comet.z);
      place(gas, directions.gas, length, GAS, strength);
      place(dust, directions.dust, length * 0.8, DUST, strength);
      comaRadius = strength * (COMA_RADIUS_KM / KM_PER_AU) * unitsPerAu;
      coma.scale.setScalar(2 * comaRadius);
      coma.material.opacity = strength;
      centre.x = comet.x;
      centre.y = comet.y;
      centre.z = comet.z;
    },
    glowRadius: () => comaRadius,
    setViewer(camera) {
      if (comaRadius === 0) return;
      const away = Math.hypot(camera.x - centre.x, camera.y - centre.y, camera.z - centre.z);
      // Outside the glow everything is at full strength; deep inside it is only a faint haze.
      const outside = Math.min(1, away / (comaRadius * VIEW_FROM_RADII));
      const dim = INSIDE_HAZE + (1 - INSIDE_HAZE) * outside * outside;
      coma.material.opacity = strengthNow * dim;
      for (const [mesh, style] of [
        [gas, GAS],
        [dust, DUST],
      ] as const) {
        const { opacity } = mesh.material.uniforms;
        if (opacity) opacity.value = style.opacity * strengthNow * dim;
      }
    },
    dispose() {
      for (const mesh of [gas, dust]) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      coma.material.map?.dispose();
      coma.material.dispose();
    },
  };
}
