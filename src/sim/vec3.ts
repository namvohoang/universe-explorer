/** A point or direction in a right-handed frame. Units are given by the name of what holds it. */
export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

export function scale(v: Vec3, factor: number): Vec3 {
  return { x: v.x * factor, y: v.y * factor, z: v.z * factor };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function normalize(v: Vec3): Vec3 {
  const size = length(v);
  if (size === 0) throw new RangeError('Cannot normalise a zero vector');
  return scale(v, 1 / size);
}

/** Angle between two directions, in radians, in [0, π]. */
export function angleBetween(a: Vec3, b: Vec3): number {
  return Math.atan2(length(cross(a, b)), dot(a, b));
}
