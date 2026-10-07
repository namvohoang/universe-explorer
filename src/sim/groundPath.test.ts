import { describe, expect, it } from 'vitest';
import type { GroundPoint } from '../data/types';
import { bodyFramePoint, groundPlaceAt, groundRoute, routeInstants } from './groundPath';

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
