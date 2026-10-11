import { describe, expect, it } from 'vitest';
import { SAM_2021_TRACK } from '../data/paths/sam2021Track';
import type { StormPoint } from '../data/types';
import {
  GALE_KM_PER_H,
  galeReachKm,
  stormAt,
  stormPlace,
  stormTurnRad,
  turnsAnticlockwise,
} from './storm';
import { angleBetween, cross, dot, length, normalize } from './vec3';

const from: StormPoint = [100, -40, 10, 100, 990, 80, 60, 40, 20, 'HU'];
const to: StormPoint = [100.25, -42, 12, 140, 970, 120, 100, 80, 60, 'HU'];
const track = [from, to];

describe('galeReachKm', () => {
  it('is the mean of the four quarters', () => {
    expect(galeReachKm(from)).toBeCloseTo(50, 12);
  });

  it('counts a quarter the record leaves out as none', () => {
    expect(galeReachKm([100, 0, 0, 50, null, 40, null, null, 40, 'TS'])).toBeCloseTo(20, 12);
  });
});

describe('stormAt', () => {
  it('is where the record says at the instant of a record', () => {
    const now = stormAt(track, from[0]);
    expect(now).not.toBeNull();
    expect(angleBetween(now?.place ?? { x: 0, y: 0, z: 0 }, stormPlace(from))).toBeCloseTo(0, 9);
    expect(now?.windKmPerH).toBeCloseTo(100, 12);
    expect(now?.reachKm).toBeCloseTo(50, 12);
  });

  it('is half way along the ground, on the ground, half way between two records', () => {
    const now = stormAt(track, 100.125);
    const place = now?.place ?? { x: 0, y: 0, z: 0 };
    const a = stormPlace(from);
    const b = stormPlace(to);
    expect(length(place)).toBeCloseTo(1, 12);
    expect(angleBetween(a, place)).toBeCloseTo(angleBetween(a, b) / 2, 9);
    expect(angleBetween(place, b)).toBeCloseTo(angleBetween(a, b) / 2, 9);
    // On the shortest way between the two: square to the axis that way turns about.
    expect(dot(place, normalize(cross(a, b)))).toBeCloseTo(0, 12);
    expect(now?.windKmPerH).toBeCloseTo(120, 12);
    expect(now?.reachKm).toBeCloseTo(70, 12);
    expect(now?.latDegNorth).toBeCloseTo(11, 12);
  });

  it('knows nothing of the storm before its first record or after its last', () => {
    expect(stormAt(track, 99.99)).toBeNull();
    expect(stormAt(track, 100.26)).toBeNull();
    expect(stormAt([], 100)).toBeNull();
  });

  it('does not mind two records at one place', () => {
    const still: StormPoint = [100.5, -42, 12, 140, 970, 120, 100, 80, 60, 'HU'];
    const now = stormAt([to, still], 100.4);
    expect(angleBetween(now?.place ?? { x: 0, y: 0, z: 0 }, stormPlace(to))).toBeCloseTo(0, 9);
  });
});

describe('Hurricane Sam, from the hurricane centre’s record', () => {
  const points = SAM_2021_TRACK.points.value;

  it('has a record every six hours, earliest first', () => {
    for (const [index, point] of points.entries()) {
      const before = points[index - 1];
      if (before) expect(point[0] - before[0]).toBeCloseTo(0.25, 9);
    }
  });

  it('is at every instant between where the records before and after put it', () => {
    for (const [index, point] of points.entries()) {
      const after = points[index + 1];
      if (!after) continue;
      const now = stormAt(points, (point[0] + after[0]) / 2);
      const whole = angleBetween(stormPlace(point), stormPlace(after));
      expect(angleBetween(stormPlace(point), now?.place ?? { x: 0, y: 0, z: 0 })).toBeCloseTo(
        whole / 2,
        9,
      );
    }
  });
});

describe('stormTurnRad', () => {
  it('has not turned at the first record', () => {
    expect(stormTurnRad(track, from[0])).toBe(0);
  });

  it('turns as fast as a gale goes round at the edge of the cloud', () => {
    // Six hours with gales reaching from 50 km to 90 km: 70 km at the middle of the stretch.
    expect(stormTurnRad(track, to[0])).toBeCloseTo((GALE_KM_PER_H / 70) * 6, 9);
  });

  it('goes on turning the same way, never back', () => {
    const points = SAM_2021_TRACK.points.value;
    let before = 0;
    for (const point of points) {
      const turned = stormTurnRad(points, point[0]);
      expect(turned).toBeGreaterThanOrEqual(before);
      before = turned;
    }
  });

  it('does not turn while there are no gales', () => {
    const calm: StormPoint = [100, -40, 10, 40, 1008, 0, 0, 0, 0, 'TD'];
    const stillCalm: StormPoint = [100.25, -41, 10, 40, 1008, 0, 0, 0, 0, 'TD'];
    expect(stormTurnRad([calm, stillCalm], 100.25)).toBe(0);
  });
});

describe('turnsAnticlockwise', () => {
  it('is anticlockwise north of the equator and clockwise south of it', () => {
    expect(turnsAnticlockwise(14)).toBe(true);
    expect(turnsAnticlockwise(-14)).toBe(false);
  });
});
