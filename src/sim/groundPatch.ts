import { add, cross, dot, normalize, scale, type Vec3 } from './vec3';

/**
 * Where a point of a globe falls on its map, as shares of the map's width and height. The
 * globe is the unit sphere a body is drawn on: +y is its north pole and the map's left and
 * right edges meet along -x (the mapping of three.js's `SphereGeometry`).
 */
export function mapPlaceOf(point: Vec3): readonly [across: number, up: number] {
  const size = Math.hypot(point.x, point.y, point.z) || 1;
  const round = Math.atan2(point.z, -point.x);
  const across = (round < 0 ? round + 2 * Math.PI : round) / (2 * Math.PI);
  const down = Math.acos(Math.min(1, Math.max(-1, point.y / size))) / Math.PI;
  return [across, 1 - down];
}

/**
 * The point of the unit sphere that lies `awayRad` from `centre` (a unit vector), measured
 * along the ground, in the direction `roundRad` round it.
 */
export function aroundPlace(centre: Vec3, awayRad: number, roundRad: number): Vec3 {
  const aside = Math.abs(centre.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  const first = normalize(cross(aside, centre));
  const second = cross(centre, first);
  const along = add(scale(first, Math.cos(roundRad)), scale(second, Math.sin(roundRad)));
  return add(scale(centre, Math.cos(awayRad)), scale(along, Math.sin(awayRad)));
}

/**
 * How far out each ring of a patch of ground lies, nearest first: close together near the
 * middle and wider apart further out, each as many times the one before as the last.
 */
export function ringAngles(nearestRad: number, farthestRad: number, rings: number): number[] {
  if (rings < 2) return [farthestRad];
  const step = (farthestRad / nearestRad) ** (1 / (rings - 1));
  return Array.from({ length: rings }, (_, ring) => nearestRad * step ** ring);
}

/** How far apart two places of the unit sphere are along the ground, in radians. */
export function groundAngle(a: Vec3, b: Vec3): number {
  return Math.acos(Math.min(1, Math.max(-1, dot(normalize(a), normalize(b)))));
}
