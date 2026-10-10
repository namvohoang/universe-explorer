import type { PathPoint, PathSample } from '../data/types';
import { SECONDS_PER_DAY } from './constants';
import { add, cross, length, scale, subtract, type Vec3 } from './vec3';

const positionOf = (sample: PathSample): Vec3 => ({ x: sample[1], y: sample[2], z: sample[3] });

/**
 * The position between two samples, in km: the cubic curve that leaves the first and reaches
 * the second at the positions and velocities measured there (a Hermite spline).
 */
export function positionBetweenKm(from: PathSample, to: PathSample, jd: number): Vec3 {
  const spanDays = to[0] - from[0];
  if (!(spanDays > 0)) return positionOf(from);
  const t = (jd - from[0]) / spanDays;
  const spanSeconds = spanDays * SECONDS_PER_DAY;
  const t2 = t * t;
  const t3 = t2 * t;
  const p0 = 2 * t3 - 3 * t2 + 1;
  const v0 = (t3 - 2 * t2 + t) * spanSeconds;
  const p1 = -2 * t3 + 3 * t2;
  const v1 = (t3 - t2) * spanSeconds;
  const [, x0, y0, z0, vx0, vy0, vz0] = from;
  const [, x1, y1, z1, vx1, vy1, vz1] = to;
  const axis = (a: number, va: number, b: number, vb: number): number =>
    p0 * a + v0 * va + p1 * b + v1 * vb;
  return { x: axis(x0, vx0, x1, vx1), y: axis(y0, vy0, y1, vy1), z: axis(z0, vz0, z1, vz1) };
}

/**
 * Where a sampled path is at a date, in km from its centre. Before the first sample it stays
 * at the first, and after the last at the last: nothing is made up beyond what was tracked.
 */
export function pathPositionKm(samples: readonly PathSample[], jd: number): Vec3 {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last) throw new RangeError('A path needs at least one sample');
  if (jd <= first[0]) return positionOf(first);
  if (jd >= last[0]) return positionOf(last);
  // The last sample at or before the date.
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if ((samples[middle]?.[0] ?? Infinity) <= jd) low = middle;
    else high = middle;
  }
  const from = samples[low];
  const to = samples[high];
  return from && to ? positionBetweenKm(from, to, jd) : positionOf(first);
}

/**
 * How fast a path is moving at a date, in km/s: the slope of the curve `pathPositionKm` draws.
 * Before the first sample it is the first one's speed, and after the last the last one's, so
 * a craft held at an end of its path keeps the heading it had there.
 */
export function pathVelocityKmPerS(samples: readonly PathSample[], jd: number): Vec3 {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (!first || !last) throw new RangeError('A path needs at least one sample');
  const velocityOf = (sample: PathSample): Vec3 => ({ x: sample[4], y: sample[5], z: sample[6] });
  if (jd <= first[0]) return velocityOf(first);
  if (jd >= last[0]) return velocityOf(last);
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if ((samples[middle]?.[0] ?? Infinity) <= jd) low = middle;
    else high = middle;
  }
  const from = samples[low];
  const to = samples[high];
  if (!from || !to) return velocityOf(first);
  const spanSeconds = (to[0] - from[0]) * SECONDS_PER_DAY;
  const t = (jd - from[0]) / (to[0] - from[0]);
  const t2 = t * t;
  // The slopes of the four Hermite weights of `positionBetweenKm`.
  const p0 = (6 * t2 - 6 * t) / spanSeconds;
  const v0 = 3 * t2 - 4 * t + 1;
  const p1 = (-6 * t2 + 6 * t) / spanSeconds;
  const v1 = 3 * t2 - 2 * t;
  const [, x0, y0, z0, vx0, vy0, vz0] = from;
  const [, x1, y1, z1, vx1, vy1, vz1] = to;
  const axis = (a: number, va: number, b: number, vb: number): number =>
    p0 * a + v0 * va + p1 * b + v1 * vb;
  return { x: axis(x0, vx0, x1, vx1), y: axis(y0, vy0, y1, vy1), z: axis(z0, vz0, z1, vz1) };
}

/**
 * How fast the ground of a turning body moves at a place, in km/s: `placeKm` is measured from
 * the body's centre, `north` is the unit vector along its north pole in the same frame, and
 * the body turns once against the stars in `turnHours`.
 */
export function groundVelocityKmPerS(placeKm: Vec3, north: Vec3, turnHours: number): Vec3 {
  const radiansPerSecond = (2 * Math.PI) / (turnHours * 3600);
  return scale(cross(north, placeKm), radiansPerSecond);
}

/**
 * A craft climbing slower than this over the ground, in km/s, is drawn standing nearly
 * upright: on the pad it has no heading at all. A drawing choice.
 */
const UPRIGHT_BELOW_KM_PER_S = 0.002;

/**
 * Which way a rocket's nose is drawn pointing: the way it is moving over the ground, and
 * straight up while it stands still on it. `placeKm` is from the centre of the body it leaves.
 * A unit vector. A real rocket steers a little off this line; that is not known here.
 */
export function noseDirection(placeKm: Vec3, velocityKmPerS: Vec3, groundKmPerS: Vec3): Vec3 {
  const height = length(placeKm);
  const up = height > 0 ? scale(placeKm, 1 / height) : { x: 0, y: 1, z: 0 };
  const heading = add(subtract(velocityKmPerS, groundKmPerS), scale(up, UPRIGHT_BELOW_KM_PER_S));
  const speed = length(heading);
  return speed > 0 ? scale(heading, 1 / speed) : up;
}

/**
 * Samples to draw a smooth curve through a few known places: each place is given the speed
 * of a straight run from the place before it to the place after it (or to its one neighbour,
 * at an end). The speeds are a way of drawing, not measurements. A craft that stands on the
 * ground at the first place is given the ground's own speed there (`startKmPerS`), so it is
 * drawn leaving the ground from rest; it then speeds up evenly over its first stretch, so the
 * second place is given the speed that brings it there (with a straight run's speed, a long
 * first stretch drew the craft drifting back the way it came before setting off).
 */
export function drawnThrough(points: readonly PathPoint[], startKmPerS?: Vec3): PathSample[] {
  return points.map((point, index) => {
    if (index === 0 && startKmPerS) {
      return [point[0], point[1], point[2], point[3], startKmPerS.x, startKmPerS.y, startKmPerS.z];
    }
    const first = points[0];
    if (index === 1 && startKmPerS && first) {
      // From the ground's speed, evenly faster: it arrives at twice its mean speed less the start.
      const seconds = (point[0] - first[0]) * SECONDS_PER_DAY;
      const start = { 1: startKmPerS.x, 2: startKmPerS.y, 3: startKmPerS.z } as const;
      const speed = (i: 1 | 2 | 3): number =>
        seconds > 0 ? (2 * (point[i] - first[i])) / seconds - start[i] : 0;
      return [point[0], point[1], point[2], point[3], speed(1), speed(2), speed(3)];
    }
    const before = points[index - 1] ?? point;
    const after = points[index + 1] ?? point;
    const seconds = (after[0] - before[0]) * SECONDS_PER_DAY;
    const speed = (i: 1 | 2 | 3): number => (seconds > 0 ? (after[i] - before[i]) / seconds : 0);
    return [point[0], point[1], point[2], point[3], speed(1), speed(2), speed(3)];
  });
}

/**
 * The instants to draw a sampled path at: every sample, and even steps between each pair, so
 * the curve between them shows as a curve.
 */
export function sampleInstants(samples: readonly PathSample[], stepsPerSample: number): number[] {
  const instants: number[] = [];
  for (const [index, from] of samples.entries()) {
    const to = samples[index + 1];
    if (!to) {
      instants.push(from[0]);
      break;
    }
    for (let step = 0; step < stepsPerSample; step++) {
      instants.push(from[0] + ((to[0] - from[0]) * step) / stepsPerSample);
    }
  }
  return instants;
}

/**
 * How fast one craft is drawn catching another up: for every second until they join, it is
 * this many seconds behind along the same path, while they are still far apart. A drawing
 * choice: three hours before joining the chaser is drawn about a minute behind, some 500 km
 * for a craft in low orbit.
 */
export const CHASE_GAIN = 1 / 120;
/**
 * In the last stretch the gap closes ever more gently, so the two are drawn coming together
 * slowly: an hour before joining it is half what `CHASE_GAIN` alone would give, a minute
 * before a sixtieth. A drawing choice.
 */
export const CHASE_SOFTENS_SECONDS = 3600;

/**
 * Where a craft catching another up is drawn at a date: where the one ahead was a little
 * earlier, by a gap that closes when they join to `standsOffKm` behind it (zero, or the room
 * the two need side by side when they are drawn as models). From then on they stay so.
 */
export function chasePositionKm(
  ahead: readonly PathSample[],
  joinsAtJd: number,
  jd: number,
  standsOffKm = 0,
): Vec3 {
  const left = Math.max(0, joinsAtJd - jd) * SECONDS_PER_DAY;
  const behindSeconds = (CHASE_GAIN * left * left) / (left + CHASE_SOFTENS_SECONDS);
  const speed = length(pathVelocityKmPerS(ahead, jd));
  const standsOffSeconds = standsOffKm > 0 && speed > 0 ? standsOffKm / speed : 0;
  return pathPositionKm(ahead, jd - (behindSeconds + standsOffSeconds) / SECONDS_PER_DAY);
}

/**
 * Which way a craft catching another up is moving at a date: the way the one ahead moved
 * where the chaser is drawn. A unit vector.
 */
export function chaseHeading(
  ahead: readonly PathSample[],
  joinsAtJd: number,
  jd: number,
  standsOffKm = 0,
): Vec3 {
  const here = chasePositionKm(ahead, joinsAtJd, jd, standsOffKm);
  const step = 1 / SECONDS_PER_DAY;
  const next = chasePositionKm(ahead, joinsAtJd, jd + step, standsOffKm);
  const moved = subtract(next, here);
  const size = length(moved);
  if (size > 0) return scale(moved, 1 / size);
  const velocity = pathVelocityKmPerS(ahead, jd);
  const speed = length(velocity);
  return speed > 0 ? scale(velocity, 1 / speed) : { x: 0, y: 0, z: 1 };
}

/** The farthest a path gets from its centre, in km. */
export function pathReachKm(samples: readonly PathSample[]): number {
  return Math.max(0, ...samples.map((sample) => length(positionOf(sample))));
}

/**
 * The fewest samples that still give every sample left out to within `toleranceKm` when the
 * curve is drawn between the ones kept. Samples are kept close together where the path bends
 * sharply (a pass round the Moon) and far apart where it coasts.
 */
export function thinPath(samples: readonly PathSample[], toleranceKm: number): PathSample[] {
  const kept: PathSample[] = [];
  let from = 0;
  while (from < samples.length) {
    const start = samples[from];
    if (!start) break;
    kept.push(start);
    if (from === samples.length - 1) break;
    let to = from + 1;
    for (let candidate = from + 2; candidate < samples.length; candidate++) {
      const end = samples[candidate];
      if (!end) break;
      const fits = samples
        .slice(from + 1, candidate)
        .every(
          (between) =>
            length(subtract(positionBetweenKm(start, end, between[0]), positionOf(between))) <=
            toleranceKm,
        );
      if (!fits) break;
      to = candidate;
    }
    from = to;
  }
  return kept;
}
