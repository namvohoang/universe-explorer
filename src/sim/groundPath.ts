import type { GroundPoint } from '../data/types';
import { SECONDS_PER_DAY } from './constants';
import type { Vec3 } from './vec3';

const DEG = Math.PI / 180;
const TURN_DEG = 360;

/** A known place with its longitude counted on from the first, so that turns round the body add up. */
export interface GroundStop {
  readonly jd: number;
  /** Degrees travelled round the body since the first stop, always forwards. */
  readonly travelDeg: number;
  readonly latDeg: number;
  readonly altitudeKm: number;
  /** The craft stands still on the ground here: no height and no speed. */
  readonly atRest: boolean;
}

export interface GroundRoute {
  readonly heading: 'east' | 'west';
  readonly startLonDegEast: number;
  readonly stops: readonly GroundStop[];
}

/**
 * Works out how far round the body the craft went between each known place and the next. The
 * table gives only where it was each time, not how many times it had gone right round in
 * between; that count is the one that best fits the speed and height the table gives at the
 * two places. A craft standing on the ground at both does not move.
 */
export function groundRoute(
  points: readonly GroundPoint[],
  heading: 'east' | 'west',
  bodyRadiusKm: number,
): GroundRoute {
  const forwards = heading === 'east' ? 1 : -1;
  const stops: GroundStop[] = [];
  let travelDeg = 0;
  for (const [index, point] of points.entries()) {
    const before = points[index - 1];
    if (before) {
      const [jd0, lon0, , altitude0, speed0] = before;
      const [jd1, lon1, , altitude1, speed1] = point;
      const seconds = (jd1 - jd0) * SECONDS_PER_DAY;
      // Degrees a second round the body at each end: speed over distance from the centre.
      const rate0 = speed0 / (bodyRadiusKm + altitude0) / DEG;
      const rate1 = speed1 / (bodyRadiusKm + altitude1) / DEG;
      const expectedDeg = ((rate0 + rate1) / 2) * seconds;
      const leastDeg = ((((lon1 - lon0) * forwards) % TURN_DEG) + TURN_DEG) % TURN_DEG;
      const turns = Math.max(0, Math.round((expectedDeg - leastDeg) / TURN_DEG));
      travelDeg += leastDeg + turns * TURN_DEG;
    }
    stops.push({
      jd: point[0],
      travelDeg,
      latDeg: point[2],
      altitudeKm: point[3],
      atRest: point[3] === 0 && point[4] === 0,
    });
  }
  return { heading, startLonDegEast: points[0]?.[1] ?? 0, stops };
}

/** Where on a route the craft is drawn at a date: over which point of the ground, and how high. */
export interface GroundPlace {
  readonly lonDegEast: number;
  readonly latDeg: number;
  readonly altitudeKm: number;
}

/**
 * The place at a date: between two known places everything changes at a steady rate. Before
 * the first it stays at the first, and after the last at the last.
 *
 * A craft coming to rest on the ground is drawn slowing all the way down to it, and one
 * leaving the ground speeding up from rest: its way along the ground slows (or grows) evenly,
 * and its height a little less sharply, so it comes straight down at the last and goes
 * straight up at the first. How it really slowed between the two places is not known here.
 */
export function groundPlaceAt(route: GroundRoute, jd: number): GroundPlace {
  const { stops } = route;
  const first = stops[0];
  if (!first) throw new RangeError('A route needs at least one place');
  let from = first;
  let to = first;
  for (const stop of stops) {
    to = stop;
    if (stop.jd >= jd) break;
    from = stop;
  }
  const span = to.jd - from.jd;
  const share = span > 0 ? Math.min(Math.max((jd - from.jd) / span, 0), 1) : 0;
  const landing = to.atRest && !from.atRest;
  const leaving = from.atRest && !to.atRest;
  const along = landing ? 1 - (1 - share) ** 2 : leaving ? share ** 2 : share;
  const up = landing ? 1 - (1 - share) ** 1.5 : leaving ? share ** 1.5 : share;
  const mix = (a: number, b: number, by: number): number => a + (b - a) * by;
  const forwards = route.heading === 'east' ? 1 : -1;
  return {
    lonDegEast: route.startLonDegEast + forwards * mix(from.travelDeg, to.travelDeg, along),
    latDeg: mix(from.latDeg, to.latDeg, along),
    altitudeKm: mix(from.altitudeKm, to.altitudeKm, up),
  };
}

/**
 * A place over the ground as a point in the body's own frame, in units of the body's radius:
 * x runs out through latitude 0, longitude 0, y through the north pole, and east is towards -z.
 */
export function bodyFramePoint(place: GroundPlace, bodyRadiusKm: number): Vec3 {
  const radius = (bodyRadiusKm + place.altitudeKm) / bodyRadiusKm;
  const lat = place.latDeg * DEG;
  const lon = place.lonDegEast * DEG;
  return {
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: -radius * Math.cos(lat) * Math.sin(lon),
  };
}

/** The instants to draw a route at: every known place, and steps of a few degrees between. */
export function routeInstants(route: GroundRoute, stepDeg: number): number[] {
  const instants: number[] = [];
  for (const [index, from] of route.stops.entries()) {
    const to = route.stops[index + 1];
    if (!to) {
      instants.push(from.jd);
      break;
    }
    const steps = Math.max(1, Math.ceil((to.travelDeg - from.travelDeg) / stepDeg));
    for (let step = 0; step < steps; step++) {
      instants.push(from.jd + ((to.jd - from.jd) * step) / steps);
    }
  }
  return instants;
}

/**
 * Which way a craft on a route is heading over a place, level with the ground: a unit vector
 * in the body's own frame (as `bodyFramePoint`), due east or due west. Routes here run close
 * to the equator, so the little they drift north or south is left out.
 */
export function groundHeading(place: GroundPlace, heading: 'east' | 'west'): Vec3 {
  const lon = place.lonDegEast * DEG;
  const forwards = heading === 'east' ? 1 : -1;
  return { x: -forwards * Math.sin(lon), y: 0, z: -forwards * Math.cos(lon) };
}

/** Straight up from a place, in the body's own frame: a unit vector. */
export function groundUp(place: GroundPlace): Vec3 {
  return bodyFramePoint({ ...place, altitudeKm: 0 }, 1);
}

/**
 * A stretch of a flight in which a craft with one engine under it is drawn leaning:
 * `braking`, it flies engine first to slow down, lying right back at the start and coming
 * upright as it lands; `climbing`, it rises upright and then leans the way it is going.
 */
export interface Lean {
  readonly fromJd: number;
  readonly untilJd: number;
  readonly kind: 'braking' | 'climbing';
}

/** A lean is come into, and a climbing one left, over this share of its stretch. */
const LEAN_EASE_SHARE = 0.08;
/** How far a climbing craft is drawn leaning the way it goes, in radians: half a right angle. */
const CLIMB_LEAN_RAD = Math.PI / 4;

const smoothStep = (through: number): number => {
  const held = Math.min(1, Math.max(0, through));
  return held * held * (3 - 2 * held);
};

/**
 * Which way the top of such a craft points at a date: straight up (`up`) outside its leans,
 * and within one tipped towards or away from the way it is heading (`ahead`). A unit vector
 * in whatever frame the two are given in. How far it leans at each instant is a drawing.
 */
export function leaningTop(leans: readonly Lean[], jd: number, up: Vec3, ahead: Vec3): Vec3 {
  const lean = leans.find((one) => jd >= one.fromJd && jd <= one.untilJd);
  if (!lean) return up;
  const through = (jd - lean.fromJd) / (lean.untilJd - lean.fromJd);
  const easeIn = smoothStep(through / LEAN_EASE_SHARE);
  // Braking: its top points back along its path, less and less. Climbing: forwards.
  const angle =
    lean.kind === 'braking'
      ? -(Math.PI / 2) * easeIn * (1 - through * through)
      : CLIMB_LEAN_RAD * easeIn * smoothStep((1 - through) / LEAN_EASE_SHARE);
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  return { x: c * up.x + s * ahead.x, y: c * up.y + s * ahead.y, z: c * up.z + s * ahead.z };
}
