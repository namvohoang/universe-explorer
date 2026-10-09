import { describe, expect, it } from 'vitest';
import { aroundPlace, groundAngle, mapPlaceOf, ringAngles } from './groundPatch';

describe('mapPlaceOf', () => {
  it('puts the poles at the top and bottom of the map', () => {
    expect(mapPlaceOf({ x: 0, y: 1, z: 0 })[1]).toBeCloseTo(1, 12);
    expect(mapPlaceOf({ x: 0, y: -1, z: 0 })[1]).toBeCloseTo(0, 12);
  });

  it('puts +x in the middle of the map and goes round through +z and -z', () => {
    expect(mapPlaceOf({ x: 1, y: 0, z: 0 })).toEqual([0.5, 0.5]);
    expect(mapPlaceOf({ x: 0, y: 0, z: 1 })[0]).toBeCloseTo(0.25, 12);
    expect(mapPlaceOf({ x: 0, y: 0, z: -1 })[0]).toBeCloseTo(0.75, 12);
  });

  it('does not mind how far from the middle the point is', () => {
    const near = mapPlaceOf({ x: 0.3, y: 0.4, z: -0.5 });
    const far = mapPlaceOf({ x: 3, y: 4, z: -5 });
    expect(far[0]).toBeCloseTo(near[0], 12);
    expect(far[1]).toBeCloseTo(near[1], 12);
  });
});

describe('aroundPlace', () => {
  const centre = { x: 0.6, y: 0.48, z: -0.64 };

  it('is the place itself at no distance', () => {
    const point = aroundPlace(centre, 0, 1.3);
    expect(point.x).toBeCloseTo(centre.x, 12);
    expect(point.y).toBeCloseTo(centre.y, 12);
    expect(point.z).toBeCloseTo(centre.z, 12);
  });

  it('stays on the globe, as far from the place as asked, whichever way round', () => {
    for (const round of [0, 1, 2.5, 4, 6]) {
      const point = aroundPlace(centre, 0.07, round);
      expect(Math.hypot(point.x, point.y, point.z)).toBeCloseTo(1, 12);
      expect(groundAngle(centre, point)).toBeCloseTo(0.07, 9);
    }
  });

  it('works at a pole', () => {
    const point = aroundPlace({ x: 0, y: 1, z: 0 }, 0.2, 0.4);
    expect(groundAngle({ x: 0, y: 1, z: 0 }, point)).toBeCloseTo(0.2, 9);
  });
});

describe('ringAngles', () => {
  it('runs from the nearest to the farthest in even multiples', () => {
    const angles = ringAngles(0.001, 0.008, 4);
    expect(angles).toHaveLength(4);
    expect(angles[0]).toBeCloseTo(0.001, 12);
    expect(angles[1]).toBeCloseTo(0.002, 12);
    expect(angles[3]).toBeCloseTo(0.008, 12);
  });
});
