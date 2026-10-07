import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three';
import type { Vec3 } from '../sim/vec3';

/** Speck size in pixels. The specks stand for dust far too fine to see; they are not its size. */
const SPECK_PIXELS = 1.4;
const SPECK_OPACITY = 0.55;
/** The pale colour of sunlit dust. A drawing choice. */
const SPECK_COLOR = 0xd9c9a8;

/** Dust strewn along a comet's path: a drawing of where it lies, in specks of one size. */
export interface DustTrail {
  /** Position this at the body the path goes round. */
  readonly points: Points;
  dispose(): void;
}

export function createDustTrail(specks: readonly Vec3[]): DustTrail {
  const positions = new BufferAttribute(new Float32Array(specks.length * 3), 3);
  for (const [index, speck] of specks.entries()) positions.setXYZ(index, speck.x, speck.y, speck.z);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  const material = new PointsMaterial({
    color: SPECK_COLOR,
    size: SPECK_PIXELS,
    sizeAttenuation: false,
    transparent: true,
    opacity: SPECK_OPACITY,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return {
    points,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
