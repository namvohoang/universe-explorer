import { BufferAttribute, BufferGeometry, Mesh, type Material } from 'three';
import { aroundPlace, mapPlaceOf, ringAngles } from '../sim/groundPatch';

/** The patch reaches this far from its middle, in radians of the globe: about 640 km on Earth. */
const REACH_RAD = 0.1;
/** Its first ring is this far out: about 6 metres on Earth, far finer than a rocket is tall. */
const FINEST_RAD = 1e-6;
const RINGS = 72;
const ROUND = 64;

/**
 * A piece of a body's ground drawn finely round one place. The body's own sphere is made of
 * flat faces many kilometres across, good from space but not from beside a rocket on its pad;
 * this is the same ground with the same map, curved truly down to a few metres.
 *
 * `place` is in the space of the body's unit sphere: its length says how high the place is
 * (1 is the sphere itself). The mesh goes into that space; it holds its points measured from
 * the place, so they stay exact when the camera stands a few hundred metres away.
 * The map must not have its left and right edges inside the patch.
 */
export function createGroundPatch(
  place: { readonly x: number; readonly y: number; readonly z: number },
  material: Material,
): { readonly mesh: Mesh; dispose(): void } {
  const height = Math.hypot(place.x, place.y, place.z);
  const centre = { x: place.x / height, y: place.y / height, z: place.z / height };
  const count = 1 + RINGS * ROUND;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const put = (index: number, awayRad: number, roundRad: number): void => {
    const point = aroundPlace(centre, awayRad, roundRad);
    positions.set(
      [(point.x - centre.x) * height, (point.y - centre.y) * height, (point.z - centre.z) * height],
      index * 3,
    );
    normals.set([point.x, point.y, point.z], index * 3);
    uvs.set(mapPlaceOf(point), index * 2);
  };
  put(0, 0, 0);
  const angles = ringAngles(FINEST_RAD, REACH_RAD, RINGS);
  for (const [ring, away] of angles.entries()) {
    for (let step = 0; step < ROUND; step++) {
      put(1 + ring * ROUND + step, away, (2 * Math.PI * step) / ROUND);
    }
  }
  const index: number[] = [];
  for (let step = 0; step < ROUND; step++) {
    const next = (step + 1) % ROUND;
    index.push(0, 1 + step, 1 + next);
    for (let ring = 0; ring + 1 < RINGS; ring++) {
      const inner = 1 + ring * ROUND;
      const outer = inner + ROUND;
      index.push(
        inner + step,
        outer + step,
        outer + next,
        inner + step,
        outer + next,
        inner + next,
      );
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  const mesh = new Mesh(geometry, material);
  mesh.position.set(place.x, place.y, place.z);
  return {
    mesh,
    dispose() {
      mesh.removeFromParent();
      geometry.dispose();
    },
  };
}
