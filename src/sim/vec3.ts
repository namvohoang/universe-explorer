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
