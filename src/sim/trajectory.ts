import type { PathPoint, PathSample } from '../data/types';
import { SECONDS_PER_DAY } from './constants';
import { length, subtract, type Vec3 } from './vec3';

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
 * Samples to draw a smooth curve through a few known places: each place is given the speed
 * of a straight run from the place before it to the place after it (or to its one neighbour,
 * at an end). The speeds are a way of drawing, not measurements.
 */
export function drawnThrough(points: readonly PathPoint[]): PathSample[] {
  return points.map((point, index) => {
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
