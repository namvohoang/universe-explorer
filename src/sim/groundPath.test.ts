import { describe, expect, it } from 'vitest';
import type { GroundPoint } from '../data/types';
import {
  bodyFramePoint,
  groundHeading,
  groundPlaceAt,
  groundRoute,
  groundUp,
  leaningTop,
  routeInstants,
} from './groundPath';

// Placeholder values for testing the maths, not astronomy: a body 1000 km in radius, and a
// craft 100 km up going 1.1 km/s, so once round takes 2π × 1000 seconds.
const RADIUS_KM = 1000;
const ROUND_DAYS = (2 * Math.PI * 1000) / 86_400;
const up = (jd: number, lon: number): GroundPoint => [jd, lon, 0, 100, 1.1];

describe('groundRoute', () => {
  it('goes the way it is heading, the short way when there is no time for more', () => {
    const west = groundRoute([up(0, 30), up(ROUND_DAYS / 4, -60)], 'west', RADIUS_KM);
    expect(west.stops[1]?.travelDeg).toBeCloseTo(90, 9);
    const east = groundRoute([up(0, 30), up(ROUND_DAYS / 4, 120)], 'east', RADIUS_KM);
    expect(east.stops[1]?.travelDeg).toBeCloseTo(90, 9);
  });

  it('counts the whole turns the speed says there was time for', () => {
    const route = groundRoute([up(0, 30), up(ROUND_DAYS * 3.25, -60)], 'west', RADIUS_KM);
    expect(route.stops[1]?.travelDeg).toBeCloseTo(3 * 360 + 90, 9);
  });

  it('takes the long way round when half a turn is behind it', () => {
    // 179 degrees east of the start, reached going west: 181 degrees of travel.
    const route = groundRoute([up(0, 0), up(ROUND_DAYS / 2, 179)], 'west', RADIUS_KM);
    expect(route.stops[1]?.travelDeg).toBeCloseTo(181, 9);
  });

  it('keeps a craft that stands on the ground where it is, however long it stands', () => {
    const landed: GroundPoint[] = [
      [0, 20, 1, 0, 0],
      [5, 20, 1, 0, 0],
    ];
    expect(groundRoute(landed, 'west', RADIUS_KM).stops[1]?.travelDeg).toBe(0);
  });
});

describe('groundPlaceAt', () => {
  const route = groundRoute(
    [
      [0, 30, 0, 100, 1.1],
      [ROUND_DAYS / 4, -60, 2, 20, 1.1],
    ],
    'west',
    RADIUS_KM,
  );

  it('is at each known place at its instant', () => {
    expect(groundPlaceAt(route, 0)).toEqual({ lonDegEast: 30, latDeg: 0, altitudeKm: 100 });
    const end = groundPlaceAt(route, ROUND_DAYS / 4);
    expect(end.lonDegEast).toBeCloseTo(-60, 9);
    expect(end.altitudeKm).toBeCloseTo(20, 9);
  });

  it('is halfway in everything at half time', () => {
    const middle = groundPlaceAt(route, ROUND_DAYS / 8);
    expect(middle.lonDegEast).toBeCloseTo(-15, 9);
    expect(middle.latDeg).toBeCloseTo(1, 9);
    expect(middle.altitudeKm).toBeCloseTo(60, 9);
  });

  it('stays at the ends outside the time that is known', () => {
    expect(groundPlaceAt(route, -1).lonDegEast).toBe(30);
    expect(groundPlaceAt(route, 9).lonDegEast).toBeCloseTo(-60, 9);
  });
});

describe('bodyFramePoint', () => {
  it('puts longitude 0 on +x, the north pole on +y and east towards -z', () => {
    const ground = { lonDegEast: 0, latDeg: 0, altitudeKm: 0 };
    expect(bodyFramePoint(ground, RADIUS_KM).x).toBeCloseTo(1, 12);
    expect(bodyFramePoint({ ...ground, latDeg: 90 }, RADIUS_KM).y).toBeCloseTo(1, 12);
    expect(bodyFramePoint({ ...ground, lonDegEast: 90 }, RADIUS_KM).z).toBeCloseTo(-1, 12);
  });

  it('is farther out by the height, in radii of the body', () => {
    const point = bodyFramePoint({ lonDegEast: 0, latDeg: 0, altitudeKm: 100 }, RADIUS_KM);
    expect(point.x).toBeCloseTo(1.1, 12);
  });
});

describe('routeInstants', () => {
  it('holds every known instant and steps no wider than asked', () => {
    const route = groundRoute([up(0, 30), up(ROUND_DAYS / 4, -60)], 'west', RADIUS_KM);
    const instants = routeInstants(route, 10);
    expect(instants[0]).toBe(0);
    expect(instants[instants.length - 1]).toBeCloseTo(ROUND_DAYS / 4, 12);
    expect(instants).toHaveLength(10);
  });
});

describe('a craft that lands and lifts off again', () => {
  // Placeholder table: in flight, on the ground twice, and in flight again.
  const points: readonly GroundPoint[] = [
    [0, 10, 0, 12, 1.6],
    [0.01, 0, 0, 0, 0],
    [0.02, 0, 0, 0, 0],
    [0.03, -10, 0, 12, 1.6],
  ];
  const route = groundRoute(points, 'west', 1000);
  const heightAt = (jd: number): number => groundPlaceAt(route, jd).altitudeKm;
  const lonAt = (jd: number): number => groundPlaceAt(route, jd).lonDegEast;

  it('slows all the way down to the ground, and comes straight down at the last', () => {
    // Far slower over the ground in the last tenth of the way down than in the first.
    expect(Math.abs(lonAt(0.01) - lonAt(0.009))).toBeLessThan(
      Math.abs(lonAt(0.001) - lonAt(0)) / 5,
    );
    // In the last hundredth it has all but stopped going along, and still has some height.
    const nearlyDown = groundPlaceAt(route, 0.0099);
    expect(Math.abs(nearlyDown.lonDegEast)).toBeLessThan(0.002);
    expect(nearlyDown.altitudeKm).toBeGreaterThan(0.005);
    expect(heightAt(0.01)).toBe(0);
  });

  it('never rises on the way down, stands still on the ground, and rises from rest', () => {
    let before = Infinity;
    for (let jd = 0; jd <= 0.01; jd += 0.0001) {
      expect(heightAt(jd)).toBeLessThanOrEqual(before);
      before = heightAt(jd);
    }
    expect(groundPlaceAt(route, 0.015)).toEqual({ lonDegEast: 0, latDeg: 0, altitudeKm: 0 });
    expect(heightAt(0.0201)).toBeGreaterThan(0);
    expect(heightAt(0.0201)).toBeLessThan(0.02);
    expect(heightAt(0.03)).toBeCloseTo(12, 9);
  });
});

describe('groundHeading and groundUp', () => {
  it('heads due west or east, level with the ground, where the craft is', () => {
    const place = { lonDegEast: 30, latDeg: 0, altitudeKm: 5 };
    const up = groundUp(place);
    const west = groundHeading(place, 'west');
    expect(Math.hypot(up.x, up.y, up.z)).toBeCloseTo(1, 12);
    expect(west.x * up.x + west.y * up.y + west.z * up.z).toBeCloseTo(0, 12);
    // A little further west is the way it points.
    const further = bodyFramePoint({ ...place, lonDegEast: 29.9, altitudeKm: 0 }, 1);
    expect((further.x - up.x) * west.x + (further.z - up.z) * west.z).toBeGreaterThan(0);
    const east = groundHeading(place, 'east');
    expect(east.x).toBeCloseTo(-west.x, 12);
    expect(east.z).toBeCloseTo(-west.z, 12);
  });
});

describe('leaningTop', () => {
  const up = { x: 0, y: 1, z: 0 };
  const ahead = { x: 1, y: 0, z: 0 };
  const leans = [
    { fromJd: 10, untilJd: 20, kind: 'braking' as const },
    { fromJd: 30, untilJd: 40, kind: 'climbing' as const },
  ];

  it('is straight up outside a lean, and at the instant a braking craft lands', () => {
    expect(leaningTop(leans, 5, up, ahead)).toEqual(up);
    expect(leaningTop(leans, 25, up, ahead)).toEqual(up);
    const landed = leaningTop(leans, 20, up, ahead);
    expect(landed.y).toBeCloseTo(1, 12);
  });

  it('lies back, engine first, early in the braking, and comes upright little by little', () => {
    const early = leaningTop(leans, 11, up, ahead);
    expect(early.x).toBeLessThan(-0.9);
    const late = leaningTop(leans, 18, up, ahead);
    expect(late.x).toBeLessThan(0);
    expect(late.y).toBeGreaterThan(early.y);
  });

  it('leans half a right angle the way it goes while climbing, and never jumps', () => {
    const middle = leaningTop(leans, 35, up, ahead);
    expect(middle.x).toBeCloseTo(Math.SQRT1_2, 9);
    expect(leaningTop(leans, 30.001, up, ahead).x).toBeLessThan(0.001);
    expect(leaningTop(leans, 39.999, up, ahead).x).toBeLessThan(0.001);
  });
});
