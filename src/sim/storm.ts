import type { StormPoint } from '../data/types';
import { bodyFramePoint } from './groundPath';
import { add, angleBetween, normalize, scale, type Vec3 } from './vec3';

/** A storm at one instant, between the records on either side of it. */
export interface StormNow {
  /** Where its middle is over the ground: a unit vector in the frame of the world it is on. */
  readonly place: Vec3;
  readonly latDegNorth: number;
  /** The strongest steady wind, in km/h. */
  readonly windKmPerH: number;
  /** How far out from the middle gales reach, in km: 0 while there are none. */
  readonly reachKm: number;
}

/** Where a record puts the storm's middle: a unit vector in the frame of the world it is on. */
export function stormPlace(point: StormPoint): Vec3 {
  return bodyFramePoint({ lonDegEast: point[1], latDeg: point[2], altitudeKm: 0 }, 1);
}

/**
 * How far out gales reach in one record, in km: the mean of the four quarters the record
 * gives, since the storm is drawn round. A quarter the record leaves out counts as none.
 */
export function galeReachKm(point: StormPoint): number {
  const quarters = [point[5], point[6], point[7], point[8]];
  return quarters.reduce<number>((sum, quarter) => sum + (quarter ?? 0), 0) / quarters.length;
}

/** The point of the unit sphere a share `through` of the way from `a` to `b` along the ground. */
function alongGround(a: Vec3, b: Vec3, through: number): Vec3 {
  const angle = angleBetween(a, b);
  const sine = Math.sin(angle);
  // Two places as good as the same: nothing to go along.
  if (!(sine > 1e-12)) return a;
  return normalize(
    add(
      scale(a, Math.sin((1 - through) * angle) / sine),
      scale(b, Math.sin(through * angle) / sine),
    ),
  );
}

/**
 * The storm at a date: its middle moved along the ground between the two records on either
 * side, and its wind and reach changed evenly between them. `null` before the first record and
 * after the last: where the storm was then is not on record.
 */
export function stormAt(points: readonly StormPoint[], jd: number): StormNow | null {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || jd < first[0] || jd > last[0]) return null;
  const next = points.findIndex((point) => point[0] >= jd);
  const to = points[next] ?? last;
  const from = points[Math.max(0, next - 1)] ?? first;
  const span = to[0] - from[0];
  const through = span > 0 ? (jd - from[0]) / span : 0;
  const between = (a: number, b: number): number => a + (b - a) * through;
  return {
    place: alongGround(stormPlace(from), stormPlace(to), through),
    latDegNorth: between(from[2], to[2]),
    windKmPerH: between(from[3], to[3]),
    reachKm: between(galeReachKm(from), galeReachKm(to)),
  };
}

/**
 * The wind the record measures a storm's reach by: gales of 34 knots, in km/h (a knot is
 * 1.852 km/h by definition).
 */
export const GALE_KM_PER_H = 34 * 1.852;
const HOURS_PER_DAY = 24;

/**
 * How far round the drawn cloud has turned by a date, in radians, since its first record: at
 * every instant it turns as fast as a gale at its edge goes round its middle (the gale's speed
 * over how far out gales reach). A real storm does not turn in one piece, faster near its
 * middle and slower outside, so this is a drawing; it rests on the record's own numbers so
 * that a wider storm is drawn turning more slowly. While there are no gales it does not turn.
 */
export function stormTurnRad(points: readonly StormPoint[], jd: number): number {
  let turned = 0;
  for (const [index, from] of points.entries()) {
    const to = points[index + 1];
    if (!to || jd <= from[0]) break;
    const until = Math.min(jd, to[0]);
    const through = (until - from[0]) / (to[0] - from[0]);
    const reachFrom = galeReachKm(from);
    // The reach at the middle of the stretch gone through stands for the whole of it.
    const reachKm = reachFrom + ((galeReachKm(to) - reachFrom) * through) / 2;
    if (reachKm > 0) turned += (GALE_KM_PER_H / reachKm) * (until - from[0]) * HOURS_PER_DAY;
  }
  return turned;
}

/**
 * Which way a storm turns, seen from above: anticlockwise north of the equator and clockwise
 * south of it, because of the way the world under it turns.
 */
export function turnsAnticlockwise(latDegNorth: number): boolean {
  return latDegNorth >= 0;
}
