import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three';
import type { Vec3 } from '../sim/vec3';

/** Fainter than the line of sight of the moment, in the same colour. */
const COLOR = 0xffc53d;
const OPACITY = 0.38;

/**
 * Lines of sight kept from earlier moments of a story: where the viewer stood then and which
 * way they looked. Side by side they show the look swinging one way and then back.
 */
export interface SightMarks {
  readonly lines: LineSegments;
  /** Draws these lines, each from one place to another in scene units. */
  set(lines: readonly { readonly from: Vec3; readonly to: Vec3 }[]): void;
  dispose(): void;
}

export function createSightMarks(most: number): SightMarks {
  const positions = new BufferAttribute(new Float32Array(most * 6), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setDrawRange(0, 0);
  const material = new LineBasicMaterial({
    color: COLOR,
    opacity: OPACITY,
    transparent: true,
    depthTest: false,
  });
  const lines = new LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.renderOrder = 4;
  return {
    lines,
    set(wanted) {
      const shown = wanted.slice(0, most);
      for (const [index, { from, to }] of shown.entries()) {
        positions.setXYZ(index * 2, from.x, from.y, from.z);
        positions.setXYZ(index * 2 + 1, to.x, to.y, to.z);
      }
      positions.needsUpdate = true;
      geometry.setDrawRange(0, shown.length * 2);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
