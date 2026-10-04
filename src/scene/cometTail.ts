import {
  AdditiveBlending,
  ConeGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { TAIL_LENGTH_AU, tailStrength } from '../sim/comet';
import type { Vec3 } from '../sim/vec3';

/** Drawing choices: a pale, see-through cone that widens away from the comet. */
const TAIL_COLOR = 0xcfe6ff;
const TAIL_OPACITY = 0.28;
const TAIL_WIDTH_SHARE = 0.12;
const TOWARDS_TIP = new Vector3(0, -1, 0);

/** A comet's tail: a cone from the comet pointing straight away from the Sun. */
export interface CometTail {
  readonly mesh: Mesh;
  /**
   * @param comet where the comet is, in scene units
   * @param sun where the Sun is, in scene units
   * @param distanceAu the comet's real distance from the Sun
   */
  update(comet: Vec3, sun: Vec3, distanceAu: number): void;
  dispose(): void;
}

export function createCometTail(): CometTail {
  // Unit cone with its point at the origin, opening along −y.
  const geometry = new ConeGeometry(1, 1, 32, 1, true);
  geometry.translate(0, -0.5, 0);
  const material = new MeshBasicMaterial({
    color: TAIL_COLOR,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const away = new Vector3();

  return {
    mesh,
    update(comet, sun, distanceAu) {
      const strength = tailStrength(distanceAu);
      mesh.visible = strength > 0;
      if (strength === 0) return;
      away.set(comet.x - sun.x, comet.y - sun.y, comet.z - sun.z);
      const sceneDistance = away.length();
      if (sceneDistance === 0) return;
      // The same stretch the scale gives the comet's distance is given to its tail.
      const length = strength * TAIL_LENGTH_AU * (sceneDistance / distanceAu);
      mesh.position.set(comet.x, comet.y, comet.z);
      mesh.quaternion.setFromUnitVectors(TOWARDS_TIP, away.normalize());
      mesh.scale.set(length * TAIL_WIDTH_SHARE, length, length * TAIL_WIDTH_SHARE);
      material.opacity = TAIL_OPACITY * strength;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
