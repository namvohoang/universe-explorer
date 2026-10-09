import { describe, expect, it } from 'vitest';
import type { CelestialObject, StagedPath } from '../data/types';
import { catalogue } from '../data/catalogue';
import {
  flameAt,
  noseAlong,
  shedShareAt,
  skyShare,
  stagedSamples,
  turningOf,
  type Turning,
} from './launch';
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

describe('noseAlong, held upright at first', () => {
  const samples = stagedSamples(PATH, true, TURNING);
  // Upright until 100 seconds in.
  const until = 100 / 86_400;
  const upAt = (jd: number): number => {
    const place = [1000, 0, 0];
    const nose = noseAlong(samples, TURNING, jd, until);
    return (nose.x * (place[0] ?? 0)) / 1000;
  };

  it('stands straight up until it is time to lean', () => {
    const nose = noseAlong(samples, TURNING, 0.001, until);
    const free = noseAlong(samples, TURNING, 0.001);
    // Straight out from the globe's middle through where the craft is, which the free heading is not.
    expect(Math.hypot(nose.x, nose.y, nose.z)).toBeCloseTo(1, 12);
    expect(nose.y / nose.x).toBeCloseTo(20 / 1010, 3);
    expect(free.y / free.x).toBeGreaterThan(0.5);
  });

  it('comes round to the way it moves little by little, and is there twenty seconds later', () => {
    const half = noseAlong(samples, TURNING, until + 10 / 86_400, until);
    const free = noseAlong(samples, TURNING, until + 10 / 86_400);
    expect(half.y).toBeGreaterThan(0.05);
    expect(half.y).toBeLessThan(free.y);
    const there = noseAlong(samples, TURNING, until + 21 / 86_400, until);
    expect(there).toEqual(noseAlong(samples, TURNING, until + 21 / 86_400));
    expect(upAt(until + 5 / 86_400)).toBeGreaterThan(upAt(until + 15 / 86_400));
  });
});

describe('flameAt', () => {
  const burns = [
    { fromJd: { value: 10 }, untilJd: { value: 20 }, flame: 'bright' as const },
    { fromJd: { value: 22 }, untilJd: { value: 30 }, flame: 'faint' as const },
  ];

  it('is the flame of the burn under way, and none between burns or after the last', () => {
    expect(flameAt(burns, 9)).toBeNull();
    expect(flameAt(burns, 10)).toBe('bright');
    expect(flameAt(burns, 21)).toBeNull();
    expect(flameAt(burns, 25)).toBe('faint');
    expect(flameAt(burns, 30)).toBeNull();
  });
});

describe('skyShare', () => {
  it('is whole on the ground and thins by the same share for every scale height', () => {
    expect(skyShare(0, 8, true)).toBe(1);
    expect(skyShare(8, 8, true)).toBeCloseTo(1 / Math.E, 12);
    expect(skyShare(16, 8, true)).toBeCloseTo(1 / Math.E ** 2, 12);
    expect(skyShare(-3, 8, true)).toBe(1);
  });

  it('is nothing at night', () => {
    expect(skyShare(0, 8, false)).toBe(0);
  });
});
