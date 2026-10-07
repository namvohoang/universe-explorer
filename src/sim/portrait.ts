import { degToRad } from './angles';
import { add, cross, dot, length, normalize, scale, type Vec3 } from './vec3';

/**
 * How a body is looked at for a picture of it standing alone: three unit vectors in scene axes,
 * at right angles to each other.
 */
export interface PortraitView {
  /** From the body towards the eye. */
  readonly toEye: Vec3;
  /** The directions that run to the right and up the picture. */
  readonly right: Vec3;
  readonly up: Vec3;
}

/**
 * How far above the plane of the planets' orbits the eye sits. From inside that plane a ring is
 * seen edge-on, as a line; a little above it the ring opens up. A drawing choice.
 */
const EYE_ABOVE_ECLIPTIC_DEG = 20;
const SCENE_UP: Vec3 = { x: 0, y: 1, z: 0 };
/** A pole this close to straight up leans no way in particular. */
const NO_LEAN = 1e-6;

/**
 * The view that shows a body's real tilt in full: the eye is turned about the body until its
 * north pole leans to the right of the picture, neither towards the eye nor away. `north` is
 * the pole as a unit vector in scene axes, or `null` when it is not known.
 */
export function portraitView(north: Vec3 | null): PortraitView {
  const flat = north ? { x: north.x, y: 0, z: north.z } : { x: 0, y: 0, z: 0 };
  const right = length(flat) > NO_LEAN ? normalize(flat) : { x: 1, y: 0, z: 0 };
  const level = cross(right, SCENE_UP);
  const lift = degToRad(EYE_ABOVE_ECLIPTIC_DEG);
  return {
    toEye: add(scale(level, Math.cos(lift)), scale(SCENE_UP, Math.sin(lift))),
    right,
    up: add(scale(SCENE_UP, Math.cos(lift)), scale(level, -Math.sin(lift))),
  };
}

/**
 * How far a flat ring reaches across a picture, as a share of its radius: 1 when the ring is
 * seen stretched full along `across`, 0 when `across` is the ring's own axis. Both are unit
 * vectors.
 */
export function ringReach(axis: Vec3, across: Vec3): number {
  const along = dot(axis, across);
  return Math.sqrt(Math.max(0, 1 - along * along));
}

/** Half the width and half the height of the picture that just holds a body and its rings. */
export interface PortraitFrame {
  readonly halfWidth: number;
  readonly halfHeight: number;
}

/**
 * The frame for a body of longest radius `radius` whose rings (if any) reach out to
 * `ringOuterRadius`, in the same unit, about the pole `north`. A body with no rings, or with
 * no known pole to put them round, gets a square that just holds it.
 */
export function portraitFrame(
  view: PortraitView,
  radius: number,
  north: Vec3 | null,
  ringOuterRadius: number | null,
): PortraitFrame {
  if (north === null || ringOuterRadius === null) return { halfWidth: radius, halfHeight: radius };
  return {
    halfWidth: Math.max(radius, ringOuterRadius * ringReach(north, view.right)),
    halfHeight: Math.max(radius, ringOuterRadius * ringReach(north, view.up)),
  };
}
