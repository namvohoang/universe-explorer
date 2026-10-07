import { add, cross, length, normalize, scale, subtract, type Vec3 } from '../sim/vec3';

/** How long a fly-to takes, in seconds (as in the prototype). */
export const FLIGHT_SECONDS = 1.6;

/** The prototype's ease: slow start, slow finish. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * On a tall, narrow screen the view is narrower, so the camera stands further back to keep
 * the same things in frame (the prototype's rule).
 */
export function distanceForAspect(distance: number, aspect: number): number {
  return distance * Math.max(1, 1.25 / aspect);
}

/**
 * How far back a camera stands to see a box this far across and this tall (both measured from
 * its middle), through a view of this shape and field of view.
 */
export function distanceToFit(
  halfWide: number,
  halfTall: number,
  aspect: number,
  fieldOfViewDeg: number,
): number {
  const half = Math.tan((fieldOfViewDeg * Math.PI) / 360);
  return Math.max(halfWide / (half * aspect), halfTall / half);
}

function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return add(a, scale(subtract(b, a), t));
}

/** Where the camera is and what it looks at. */
export interface View {
  readonly camera: Vec3;
  readonly target: Vec3;
}

/** A camera move towards a target that may itself be moving. */
export interface Flight {
  readonly from: View;
  /** Unit vector from the target to where the camera should end up. */
  readonly direction: Vec3;
  readonly distance: number;
  readonly seconds: number;
  readonly elapsed: number;
}

/**
 * Plans a move that ends `distance` from the target. With no `direction` the camera keeps
 * its present bearing, lifted so it never ends up looking from below or flat along the plane.
 */
export function startFlight(
  from: View,
  target: Vec3,
  distance: number,
  direction: Vec3 | null,
  reducedMotion: boolean,
  seconds: number = FLIGHT_SECONDS,
): Flight {
  let bearing = direction;
  if (!bearing) {
    const offset = subtract(from.camera, target);
    const reach = length(offset);
    bearing =
      reach > 0 ? { ...offset, y: Math.max(offset.y, reach * 0.3) } : { x: 0, y: 0.4, z: 1 };
  }
  return {
    from,
    direction: normalize(bearing),
    distance,
    seconds: reducedMotion ? 0 : seconds,
    elapsed: 0,
  };
}

export interface FlightStep {
  readonly view: View;
  /** The flight to continue next frame, or `null` once it has arrived. */
  readonly flight: Flight | null;
}

/** Advances a flight by `dt` seconds towards wherever the target is now. */
export function stepFlight(flight: Flight, dt: number, target: Vec3): FlightStep {
  const elapsed = flight.elapsed + dt;
  const progress = flight.seconds === 0 ? 1 : Math.min(1, elapsed / flight.seconds);
  const eased = easeInOutCubic(progress);
  const destination = add(target, scale(flight.direction, flight.distance));
  return {
    view: {
      camera: lerp(flight.from.camera, destination, eased),
      target: lerp(flight.from.target, target, eased),
    },
    flight: progress >= 1 ? null : { ...flight, elapsed },
  };
}

/** Once arrived, the camera rides along with a moving target: both shift by what it moved. */
export function followTarget(view: View, previousTarget: Vec3, target: Vec3): View {
  const moved = subtract(target, previousTarget);
  return { camera: add(view.camera, moved), target: add(view.target, moved) };
}

/**
 * The camera put on a bearing from its target, as far away as it already is: for a view held
 * on a line that turns, such as the Moon seen from Earth as the Moon goes round.
 */
export function heldOnBearing(view: View, bearing: Vec3): View {
  const size = length(bearing);
  if (size === 0) return view;
  const distance = length(subtract(view.camera, view.target));
  return { camera: add(view.target, scale(bearing, distance / size)), target: view.target };
}

/**
 * The camera moved along its line of sight to stand a given distance from its target: for a
 * view that has to back away as what it looks at grows, such as a comet's cloud near the Sun.
 */
export function heldAtDistance(view: View, distance: number): View {
  const offset = subtract(view.camera, view.target);
  const size = length(offset);
  if (size === 0 || !(distance > 0)) return view;
  return { camera: add(view.target, scale(offset, distance / size)), target: view.target };
}

/** How far round to the side, and how far above, the camera stands when it looks at a lit body. */
const SIDE_SHARE = 0.6;
const UP_SHARE = 0.35;
const SCENE_UP: Vec3 = { x: 0, y: 1, z: 0 };

/**
 * A bearing from which a body lit by `light` shows mostly its day side, with some of the night
 * side for shape: towards the light, swung a little to one side and lifted above the plane.
 * Returns `null` when the body is at the light itself.
 */
export function litSideBearing(body: Vec3, light: Vec3): Vec3 | null {
  const offset = subtract(light, body);
  if (length(offset) === 0) return null;
  const towards = normalize(offset);
  const sideways = cross(SCENE_UP, towards);
  const side = length(sideways) === 0 ? { x: 1, y: 0, z: 0 } : normalize(sideways);
  return normalize(add(add(towards, scale(side, SIDE_SHARE)), scale(SCENE_UP, UP_SHARE)));
}

/** How long one press of a zoom button takes, in seconds. */
export const ZOOM_SECONDS = 0.35;

/**
 * The distance to move to for one press of a zoom button: the present distance times `factor`
 * (below 1 zooms in), kept within the nearest and farthest the view allows.
 */
export function zoomedDistance(
  distance: number,
  factor: number,
  nearest: number,
  farthest: number,
): number {
  return Math.min(farthest, Math.max(nearest, distance * factor));
}
