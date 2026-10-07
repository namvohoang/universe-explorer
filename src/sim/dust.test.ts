import { describe, expect, it } from 'vitest';
import { nearestOnPath, strewnAlong } from './dust';
import { length, subtract, type Vec3 } from './vec3';

// A placeholder path for testing the maths, not astronomy.
const PATH: readonly Vec3[] = [
  { x: 0, y: 0, z: 0 },
  { x: 10, y: 0, z: 0 },
  { x: 20, y: 0, z: 0 },
];

describe('strewnAlong', () => {
  it('puts so many specks by each point, none farther off than the radius', () => {
    const specks = strewnAlong(PATH, 2, 50);
    expect(specks).toHaveLength(150);
    for (const [index, speck] of specks.entries()) {
      const point = PATH[Math.floor(index / 50)] ?? { x: NaN, y: NaN, z: NaN };
      expect(length(subtract(speck, point))).toBeLessThanOrEqual(2);
    }
  });

  it('strews them all ways round, not to one side', () => {
    const specks = strewnAlong([{ x: 0, y: 0, z: 0 }], 1, 2000);
    for (const axis of ['x', 'y', 'z'] as const) {
      const mean = specks.reduce((sum, speck) => sum + speck[axis], 0) / specks.length;
      expect(Math.abs(mean)).toBeLessThan(0.03);
      expect(specks.some((speck) => speck[axis] > 0.3)).toBe(true);
      expect(specks.some((speck) => speck[axis] < -0.3)).toBe(true);
    }
  });

  it('gives the same specks every time, and others for another seed', () => {
    expect(strewnAlong(PATH, 2, 5)).toEqual(strewnAlong(PATH, 2, 5));
    expect(strewnAlong(PATH, 2, 5, 7)).not.toEqual(strewnAlong(PATH, 2, 5));
  });
});

describe('nearestOnPath', () => {
  it('is the distance to the nearest point of the path', () => {
    expect(nearestOnPath(PATH, { x: 11, y: 3, z: 0 })).toBeCloseTo(Math.hypot(1, 3), 12);
    expect(nearestOnPath([], { x: 0, y: 0, z: 0 })).toBe(Infinity);
  });
});
