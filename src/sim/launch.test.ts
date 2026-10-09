import { describe, expect, it } from 'vitest';
import type { CelestialObject, StagedPath } from '../data/types';
import { catalogue } from '../data/catalogue';
import { noseAlong, shedShareAt, stagedSamples, turningOf, type Turning } from './launch';
import { drawnThrough, groundVelocityKmPerS } from './trajectory';

// Placeholder values for testing the maths, not astronomy: a globe turning about +z once in
// ten hours, and a path that starts on its equator.
const TURNING: Turning = { north: { x: 0, y: 0, z: 1 }, turnHours: 10 };
const PATH: StagedPath = {
  centreId: 'globe',
  points: {
    sourceId: 'test',
    value: [
      [0, 1000, 0, 0],
      [0.001, 1010, 20, 0],
      [0.002, 1030, 60, 0],
    ],
  },
};

describe('turningOf', () => {
  const find = (id: string): CelestialObject | undefined =>
    catalogue.find((object) => object.id === id);

  it('gives a body its pole and its day', () => {
    const earth = turningOf(find('earth'));
    expect(earth?.turnHours).toBeGreaterThan(23);
    expect(Math.hypot(earth?.north.x ?? 0, earth?.north.y ?? 0, earth?.north.z ?? 0)).toBeCloseTo(
      1,
      12,
    );
  });

  it('turns a body that spins backwards about the other end of its pole', () => {
    const venus = find('venus');
    const shape = venus?.shape;
    if (shape?.type !== 'spheroid') throw new Error('Venus is a spheroid');
    expect(shape.orientation.rotation).toBe('retrograde');
    // Its IAU north pole is on the north side of the ecliptic; it turns about the south end.
    expect(turningOf(venus)?.north.z).toBeLessThan(0);
  });

  it('is unknown for a body that keeps one face to its planet, and for nothing at all', () => {
    expect(turningOf(find('moon'))).toBeNull();
    expect(turningOf(undefined)).toBeNull();
  });
});

describe('stagedSamples', () => {
  it("leaves the ground at the ground's own speed", () => {
    const [first] = stagedSamples(PATH, true, TURNING);
    const ground = groundVelocityKmPerS({ x: 1000, y: 0, z: 0 }, TURNING.north, 10);
    expect(first?.slice(4)).toEqual([ground.x, ground.y, ground.z]);
  });

  it('is the plain curve for a craft that does not start on the ground', () => {
    expect(stagedSamples(PATH, false, TURNING)).toEqual(drawnThrough(PATH.points.value));
    expect(stagedSamples(PATH, true, null)).toEqual(drawnThrough(PATH.points.value));
  });
});

describe('noseAlong', () => {
  it('points straight up on the pad, then leans the way the craft goes over the ground', () => {
    const samples = stagedSamples(PATH, true, TURNING);
    const onPad = noseAlong(samples, TURNING, 0);
    expect(onPad.x).toBeCloseTo(1, 9);
    const later = noseAlong(samples, TURNING, 0.0015);
    expect(later.x).toBeGreaterThan(0);
    expect(later.y).toBeGreaterThan(0.1);
  });
});

describe('shedShareAt', () => {
  const sheds = [
    { atJd: { value: 10 }, belowShare: { value: 0.3 } },
    { atJd: { value: 20 }, belowShare: { value: 0.6 } },
  ];

  it('is nothing until the first part is let go, then the highest share so far', () => {
    expect(shedShareAt(sheds, 9.9)).toBe(0);
    expect(shedShareAt(sheds, 10)).toBe(0.3);
    expect(shedShareAt(sheds, 25)).toBe(0.6);
    expect(shedShareAt([], 25)).toBe(0);
  });
});
