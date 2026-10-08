import { describe, expect, it } from 'vitest';
import { farSkyRadius, onFarSky } from './farSky';
import { length, normalize, subtract, type Vec3 } from './vec3';

const SUN: Vec3 = { x: 1, y: 2, z: 3 };

describe('onFarSky', () => {
  it('ends a line of sight on the ball, the way the viewer looks', () => {
    const from: Vec3 = { x: 2, y: 2, z: 3 };
    for (const towards of [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      normalize({ x: 0.3, y: -0.8, z: 0.5 }),
    ]) {
      const end = onFarSky(from, towards, SUN, 5);
      expect(length(subtract(end, SUN))).toBeCloseTo(5, 12);
      const seen = normalize(subtract(end, from));
      expect(seen.x).toBeCloseTo(towards.x, 12);
      expect(seen.y).toBeCloseTo(towards.y, 12);
      expect(seen.z).toBeCloseTo(towards.z, 12);
    }
  });

  it('from the middle ends straight out', () => {
    expect(onFarSky(SUN, { x: 0, y: 1, z: 0 }, SUN, 4)).toEqual({ x: 1, y: 6, z: 3 });
  });

  it('refuses a viewer outside the ball', () => {
    expect(() => onFarSky({ x: 9, y: 2, z: 3 }, { x: 1, y: 0, z: 0 }, SUN, 5)).toThrow(RangeError);
  });
});

describe('farSkyRadius', () => {
  it('grows evenly from the start of the story to its end, and no further', () => {
    expect(farSkyRadius(10, 0.2, 100, 200, 100)).toBe(10);
    expect(farSkyRadius(10, 0.2, 100, 200, 150)).toBeCloseTo(11, 12);
    expect(farSkyRadius(10, 0.2, 100, 200, 200)).toBeCloseTo(12, 12);
    expect(farSkyRadius(10, 0.2, 100, 200, 50)).toBe(10);
    expect(farSkyRadius(10, 0.2, 100, 200, 999)).toBeCloseTo(12, 12);
  });
});
