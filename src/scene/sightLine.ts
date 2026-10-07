import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three';
import type { Vec3 } from '../sim/vec3';

/** The colour of what the viewer does, as a path flown is. */
const COLOR = 0xffc53d;
const OPACITY = 0.75;

/** A straight line from where somebody stands to what they look at: a drawing of their line of sight. */
export interface SightLine {
  readonly line: Line;
  /** Draws it from one place to another, in scene units. */
  set(from: Vec3, to: Vec3): void;
  dispose(): void;
}

export function createSightLine(): SightLine {
  const positions = new BufferAttribute(new Float32Array(6), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  const material = new LineBasicMaterial({
    color: COLOR,
    opacity: OPACITY,
    transparent: true,
    depthTest: false,
  });
  const line = new Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 5;
  return {
    line,
    set(from, to) {
      positions.setXYZ(0, from.x, from.y, from.z);
      positions.setXYZ(1, to.x, to.y, to.z);
      positions.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
