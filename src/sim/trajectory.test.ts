import { describe, expect, it } from 'vitest';
import type { PathPoint, PathSample } from '../data/types';
import { SECONDS_PER_DAY } from './constants';
import {
  CHASE_GAIN,
  chasePositionKm,
  drawnThrough,
  groundVelocityKmPerS,
  noseDirection,
  pathPositionKm,
  pathVelocityKmPerS,
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

  it('leaves the first place at the speed it is told to, and the rest as before', () => {
    const samples = drawnThrough(points, { x: 0.25, y: -0.5, z: 0.125 });
    expect(samples[0]).toEqual([0, 0, 0, 0, 0.25, -0.5, 0.125]);
    expect(samples.slice(1)).toEqual(drawnThrough(points).slice(1));
  });
});

describe('pathVelocityKmPerS', () => {
  it('is the slope of the curve that is drawn', () => {
    const samples = [0, 0.25, 0.5, 0.75, 1].map(circleAt);
    const step = 1e-6;
    for (const jd of [0.03, 0.2, 0.31, 0.5, 0.64, 0.99]) {
      const before = pathPositionKm(samples, jd - step);
      const after = pathPositionKm(samples, jd + step);
      const seconds = 2 * step * SECONDS_PER_DAY;
      const velocity = pathVelocityKmPerS(samples, jd);
      expect(velocity.x).toBeCloseTo((after.x - before.x) / seconds, 6);
      expect(velocity.y).toBeCloseTo((after.y - before.y) / seconds, 6);
      expect(velocity.z).toBeCloseTo((after.z - before.z) / seconds, 6);
    }
  });

  it('keeps the speed of the nearest end outside the path', () => {
    expect(pathVelocityKmPerS(STRAIGHT, -5)).toEqual({ x: 1, y: 0, z: 0 });
    expect(pathVelocityKmPerS(STRAIGHT, 99)).toEqual({ x: 1, y: 0, z: 0 });
  });
});

describe('groundVelocityKmPerS', () => {
  const north = { x: 0, y: 0, z: 1 };

  it('carries a place on the equator eastwards, once round in one turn', () => {
    // Placeholder globe: 1000 km in radius, turning once in 10 hours.
    const velocity = groundVelocityKmPerS({ x: 1000, y: 0, z: 0 }, north, 10);
    expect(velocity.x).toBeCloseTo(0, 12);
    expect(velocity.y).toBeCloseTo((2 * Math.PI * 1000) / 36_000, 12);
    expect(velocity.z).toBeCloseTo(0, 12);
  });

  it('leaves a pole where it is', () => {
    const velocity = groundVelocityKmPerS({ x: 0, y: 0, z: 1000 }, north, 10);
    expect(Math.hypot(velocity.x, velocity.y, velocity.z)).toBeCloseTo(0, 12);
  });
});

describe('noseDirection', () => {
  const place = { x: 1000, y: 0, z: 0 };
  const ground = { x: 0, y: 0.2, z: 0 };

  it('points straight up while the craft moves with the ground', () => {
    const nose = noseDirection(place, ground, ground);
    expect(nose.x).toBeCloseTo(1, 12);
    expect(nose.y).toBeCloseTo(0, 12);
  });

  it('points the way the craft moves over the ground once it is moving fast', () => {
    const nose = noseDirection(place, { x: 0, y: 0.2, z: 5 }, ground);
    expect(nose.z).toBeGreaterThan(0.9999);
    expect(Math.hypot(nose.x, nose.y, nose.z)).toBeCloseTo(1, 12);
  });
});

describe('chasePositionKm', () => {
  it('is where the craft ahead was a little earlier, by a gap that closes steadily', () => {
    // STRAIGHT runs along x at 1 km/s. A day before joining, the gap is a day times the gain.
    const chaser = chasePositionKm(STRAIGHT, 2, 1);
    const ahead = pathPositionKm(STRAIGHT, 1);
    expect(ahead.x - chaser.x).toBeCloseTo(SECONDS_PER_DAY * CHASE_GAIN, 6);
    const later = chasePositionKm(STRAIGHT, 2, 1.5);
    expect(pathPositionKm(STRAIGHT, 1.5).x - later.x).toBeCloseTo(
      (SECONDS_PER_DAY / 2) * CHASE_GAIN,
      6,
    );
  });

  it('is with the craft ahead when they join, and stays with it', () => {
    expect(chasePositionKm(STRAIGHT, 2, 2)).toEqual(pathPositionKm(STRAIGHT, 2));
    expect(chasePositionKm(STRAIGHT, 2, 2.5)).toEqual(pathPositionKm(STRAIGHT, 2.5));
  });
});
