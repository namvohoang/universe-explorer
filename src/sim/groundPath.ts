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
    stops.push({ jd: point[0], travelDeg, latDeg: point[2], altitudeKm: point[3] });
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
  const mix = (a: number, b: number): number => a + (b - a) * share;
  const forwards = route.heading === 'east' ? 1 : -1;
  return {
    lonDegEast: route.startLonDegEast + forwards * mix(from.travelDeg, to.travelDeg),
    latDeg: mix(from.latDeg, to.latDeg),
    altitudeKm: mix(from.altitudeKm, to.altitudeKm),
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
