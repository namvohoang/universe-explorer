import { describe, expect, it } from 'vitest';
import { nearestPass, radiant, velocityKmS } from './radiant';

// A placeholder path for testing the maths, not astronomy: a straight line at 10 km/s along x.
const line = (jd: number) => ({ x: (jd - 100) * 86_400 * 10, y: 5, z: 0 });

describe('velocityKmS', () => {
  it('tells the speed and the way of something on a straight path', () => {
    const v = velocityKmS(line, 103.3);
    expect(v.x).toBeCloseTo(10, 6);
    expect(v.y).toBeCloseTo(0, 9);
  });
});

describe('nearestPass', () => {
  it('finds when a path comes nearest a place, and how near', () => {
    const place = { x: 2.5 * 86_400 * 10, y: 105, z: 0 };
    const pass = nearestPass(line, place, 90, 110, 1);
    expect(pass.jd).toBeCloseTo(102.5, 5);
    expect(pass.distanceKm).toBeCloseTo(100, 3);
  });
});

describe('radiant', () => {
  it('is straight ahead for dust that stands still in a world’s way', () => {
    const met = radiant({ x: 0, y: 0, z: 0 }, { x: 30, y: 0, z: 0 });
    expect(met.towards.x).toBeCloseTo(1, 12);
    expect(met.speedKmS).toBeCloseTo(30, 12);
  });

  it('adds the speeds of dust and world that meet head on', () => {
    const met = radiant({ x: -40, y: 0, z: 0 }, { x: 30, y: 0, z: 0 });
    expect(met.towards.x).toBeCloseTo(1, 12);
    expect(met.speedKmS).toBeCloseTo(70, 12);
  });

  it('is off to the side the dust comes from', () => {
    const met = radiant({ x: 0, y: -30, z: 0 }, { x: 30, y: 0, z: 0 });
    expect(met.towards.x).toBeCloseTo(Math.SQRT1_2, 12);
    expect(met.towards.y).toBeCloseTo(Math.SQRT1_2, 12);
  });

  it('refuses dust that keeps pace with the world', () => {
    expect(() => radiant({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toThrow(RangeError);
  });
});
