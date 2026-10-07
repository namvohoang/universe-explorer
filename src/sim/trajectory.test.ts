import { describe, expect, it } from 'vitest';
import type { PathPoint, PathSample } from '../data/types';
import { SECONDS_PER_DAY } from './constants';
import {
  drawnThrough,
  pathPositionKm,
  pathReachKm,
  positionBetweenKm,
  thinPath,
} from './trajectory';

// Placeholder paths for testing the maths, not astronomy.
/** A straight run along x at 1 km/s, sampled once a day. */
const STRAIGHT: readonly PathSample[] = [0, 1, 2, 3].map(
  (day) => [day, day * SECONDS_PER_DAY, 0, 0, 1, 0, 0] as const,
);
/** A circle of radius 1000 km gone round once a day. */
const circleAt = (day: number): PathSample => {
  const angle = 2 * Math.PI * day;
  const speed = (2 * Math.PI * 1000) / SECONDS_PER_DAY;
  return [
    day,
    1000 * Math.cos(angle),
    1000 * Math.sin(angle),
    0,
    -speed * Math.sin(angle),
    speed * Math.cos(angle),
    0,
  ];
};
const CIRCLE: readonly PathSample[] = Array.from({ length: 97 }, (_, i) => circleAt(i / 96));

describe('positionBetweenKm', () => {
  it('passes through both samples', () => {
    const [from, to] = [circleAt(0), circleAt(0.1)];
    const start = positionBetweenKm(from, to, 0);
    const end = positionBetweenKm(from, to, 0.1);
    expect(start.x).toBeCloseTo(from[1], 9);
    expect(end.x).toBeCloseTo(to[1], 9);
    expect(end.y).toBeCloseTo(to[2], 9);
  });

  it('follows the bend between samples, which a straight line would cut', () => {
    const [from, to] = [circleAt(0), circleAt(0.05)];
    const middle = positionBetweenKm(from, to, 0.025);
    // A chord would pass 12 km inside the circle here.
    expect(Math.hypot(middle.x, middle.y)).toBeCloseTo(1000, 0);
  });
});

describe('pathPositionKm', () => {
  it('is exact on a straight run at a steady speed', () => {
    expect(pathPositionKm(STRAIGHT, 1.5).x).toBeCloseTo(1.5 * SECONDS_PER_DAY, 6);
    expect(pathPositionKm(STRAIGHT, 2).x).toBeCloseTo(2 * SECONDS_PER_DAY, 6);
  });

  it('stays at the ends outside the time that was tracked', () => {
    expect(pathPositionKm(STRAIGHT, -5).x).toBe(0);
    expect(pathPositionKm(STRAIGHT, 99).x).toBe(3 * SECONDS_PER_DAY);
  });

  it('refuses a path with nothing in it', () => {
    expect(() => pathPositionKm([], 0)).toThrow(RangeError);
  });
});

describe('pathReachKm', () => {
  it('is the farthest sample from the centre', () => {
    expect(pathReachKm(STRAIGHT)).toBe(3 * SECONDS_PER_DAY);
    expect(pathReachKm(CIRCLE)).toBeCloseTo(1000, 9);
  });
});

describe('thinPath', () => {
  it('keeps only the ends of a straight run', () => {
    expect(thinPath(STRAIGHT, 0.001)).toEqual([STRAIGHT[0], STRAIGHT[3]]);
  });

  it('keeps fewer samples of a curve, and still draws every one left out within the tolerance', () => {
    const tolerance = 0.5;
    const kept = thinPath(CIRCLE, tolerance);
    expect(kept.length).toBeLessThan(CIRCLE.length / 2);
    expect(kept[0]).toBe(CIRCLE[0]);
    expect(kept[kept.length - 1]).toBe(CIRCLE[CIRCLE.length - 1]);
    for (const sample of CIRCLE) {
      const drawn = pathPositionKm(kept, sample[0]);
      expect(Math.hypot(drawn.x - sample[1], drawn.y - sample[2])).toBeLessThanOrEqual(tolerance);
    }
  });
});

describe('drawnThrough', () => {
  const points: readonly PathPoint[] = [
    [0, 0, 0, 0],
    [1, 100, 50, 0],
    [3, 400, 50, 0],
  ];

  it('passes through every place at its instant', () => {
    const samples = drawnThrough(points);
    for (const [jd, x, y] of points) {
      const drawn = pathPositionKm(samples, jd);
      expect(drawn.x).toBeCloseTo(x, 9);
      expect(drawn.y).toBeCloseTo(y, 9);
    }
  });

  it('gives a middle place the speed of a straight run between its neighbours', () => {
    const [, middle] = drawnThrough(points);
    expect(middle?.[4]).toBeCloseTo(400 / (3 * SECONDS_PER_DAY), 12);
    expect(middle?.[5]).toBeCloseTo(50 / (3 * SECONDS_PER_DAY), 12);
  });

  it('stands still when it is given one place only', () => {
    expect(drawnThrough([[5, 1, 2, 3]])).toEqual([[5, 1, 2, 3, 0, 0, 0]]);
  });
});
