import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from 'three';
import type { ObjectOfKind } from '../data/types';
import { beltScenePositions } from '../sim/belt';
import type { Scale } from '../sim/scale';

/** Dot size in pixels. The dots mark where real objects are; they are not their real size. */
const DOT_PIXELS = 1.6;
const DOT_OPACITY = 0.8;

/** A belt as one dot per real member, each moving on its own real orbit. */
export interface BeltPoints {
  readonly id: string;
  readonly parentId: string;
  /** Position this at the parent: the dots are placed around it. */
  readonly points: Points;
  update(jd: number, scale: Scale): void;
  dispose(): void;
}

export function createBeltPoints(
  belt: ObjectOfKind<'belt'>,
  parentRadiusKm: number,
  color: number,
): BeltPoints {
  const members = belt.members.value;
  const positions = new BufferAttribute(new Float32Array(members.length * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  const material = new PointsMaterial({
    color,
    size: DOT_PIXELS,
    sizeAttenuation: false,
    transparent: true,
    opacity: DOT_OPACITY,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  points.name = belt.id;
  points.frustumCulled = false;

  return {
    id: belt.id,
    parentId: belt.parentId,
    points,
    update(jd, scale) {
      beltScenePositions(members, parentRadiusKm, jd, scale, positions.array as Float32Array);
      positions.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
