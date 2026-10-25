import type { BufferAttribute } from 'three';
import { type Group, type Material, Mesh, PlaneGeometry, Vector3 } from 'three';
import type { PictureBoard } from './pictureBoard';
import { FIELD_OF_VIEW_DEG } from './stage';

/**
 * Pieces shared by the 3D close-ups drawn as a block of ground cut open like a model (the
 * avalanche's valley, the flooded river, the monsoon's coast).
 */

/** 0 below `from`, 1 above `to`, and a smooth step between; `to` may be below `from`. */
export function smooth(from: number, to: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** A fixed scatter of points in the unit square, the same every time for the same seed. */
export function scatter(count: number, seed: number): (readonly [number, number])[] {
  let state = seed;
  const next = (): number => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  return Array.from({ length: count }, () => [next(), next()] as const);
}

/**
 * The four sides of a block of ground, from the ground at its edges down to `base`, added to
 * `group`. Returns the geometries made, to be disposed of with the scene.
 */
export function addBlockSides(
  group: Group,
  heightAt: (x: number, z: number) => number,
  bounds: {
    readonly west: number;
    readonly east: number;
    readonly north: number;
    readonly south: number;
  },
  base: number,
  material: Material,
): PlaneGeometry[] {
  const { west, east, north, south } = bounds;
  const edges: readonly (readonly [number, number, number, number])[] = [
    [west, south, east, south],
    [east, south, east, north],
    [east, north, west, north],
    [west, north, west, south],
  ];
  return edges.map(([x0, z0, x1, z1]) => {
    const side = new PlaneGeometry(1, 1, 120, 1);
    const positions = side.getAttribute('position') as BufferAttribute;
    for (let index = 0; index < positions.count; index++) {
      const share = positions.getX(index) + 0.5;
      const top = positions.getY(index) > 0;
      const x = x0 + (x1 - x0) * share;
      const z = z0 + (z1 - z0) * share;
      positions.setXYZ(index, x, top ? heightAt(x, z) : base, z);
    }
    side.computeVertexNormals();
    group.add(new Mesh(side, material));
    return side;
  });
}

/**
 * Stands a board of real pictures where the close look aims, facing the eye and filling most
 * of the view, for a close-up whose button swaps its drawing for the real picture.
 */
export function placeBoard(
  board: PictureBoard,
  target: { readonly x: number; readonly y: number; readonly z: number },
  direction: Vector3,
  distance: number,
): void {
  const eye = new Vector3(target.x, target.y, target.z).addScaledVector(direction, distance);
  board.group.position.set(target.x, target.y, target.z);
  board.group.lookAt(eye);
  board.group.scale.setScalar(
    (0.85 * 2 * distance * Math.tan((FIELD_OF_VIEW_DEG * Math.PI) / 360)) / board.height,
  );
}
