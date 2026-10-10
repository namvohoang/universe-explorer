import { describe, expect, it } from 'vitest';
import type { CelestialObject, StagedPath } from '../data/types';
import { catalogue } from '../data/catalogue';
import {
  droppedPartAt,
  flameAt,
  groundExposure,
  joinedGapKm,
  letGoPartAt,
  type LetGo,
  noseAlong,
  partsGoneAt,
  settlingShedShareAt,
  shedShareAt,
  skyShare,
  stagedSamples,
  standingPartAt,
  topShareAt,
  turningOf,
  type Turning,
} from './launch';
import { drawnThrough, groundVelocityKmPerS, pathPositionKm } from './trajectory';

// Placeholder values for testing the maths, not astronomy: a globe turning about +z once in
// ten hours, and a path that starts on its equator.
const TURNING: Turning = { north: { x: 0, y: 0, z: 1 }, turnHours: 10 };
const TURNING_RADIANS_PER_DAY = (2 * Math.PI * 24) / 10;
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

  it('passes through the known places, and draws its first stretch rising before it goes over', () => {
    const samples = stagedSamples(PATH, true, TURNING);
    for (const point of PATH.points.value) {
      const place = pathPositionKm(samples, point[0]);
      expect(place.x).toBeCloseTo(point[1], 9);
      expect(place.y).toBeCloseTo(point[2], 9);
      expect(place.z).toBeCloseTo(point[3], 9);
    }
    // A tenth of the way through the first stretch: a hundredth of the climb, a thousandth of
    // the way across (after the turning ground's own move is taken off).
    const jd = 0.0001;
    const place = pathPositionKm(samples, jd);
    const turned = TURNING_RADIANS_PER_DAY * jd;
    const groundY = 1000 * Math.sin(turned);
    expect(Math.hypot(place.x, place.y) - 1000).toBeCloseTo((Math.hypot(1010, 20) - 1000) / 100, 2);
    expect(Math.abs(place.y - groundY)).toBeLessThan(0.1);
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
    expect(free.y / free.x).toBeGreaterThan(0.3);
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

describe('droppedPartAt', () => {
  const sheds = [
    { atJd: { value: 10 }, belowShare: { value: 0.3 } },
    { atJd: { value: 20 }, belowShare: { value: 0.6 } },
  ];
  const second = 1 / 86_400;

  it('is nothing before a part is let go, and nothing once it is far behind', () => {
    expect(droppedPartAt(sheds, 10 - second)).toBeNull();
    expect(droppedPartAt(sheds, 10 + 60 * second)).toBeNull();
  });

  it('is the stretch just let go, touching the craft at first and then dropping behind faster and faster', () => {
    expect(droppedPartAt(sheds, 10)).toEqual({ fromShare: 0, toShare: 0.3, behindKm: 0 });
    const early = droppedPartAt(sheds, 10 + 2 * second);
    const later = droppedPartAt(sheds, 10 + 4 * second);
    expect(later?.behindKm).toBeCloseTo(4 * (early?.behindKm ?? 0), 6);
    // The second part is the stretch above the first.
    expect(droppedPartAt(sheds, 20 + second)).toMatchObject({ fromShare: 0.3, toShare: 0.6 });
  });
});

describe('parts let go from the sides and the nose', () => {
  const second = 1 / 86_400;
  const letsGo: LetGo[] = [
    { atJd: { value: 10 }, part: 'boosters' },
    { atJd: { value: 20 }, aboveShare: { value: 0.9 } },
  ];

  it('names the parts gone by a date', () => {
    expect(partsGoneAt(letsGo, 10 - second)).toEqual([]);
    expect(partsGoneAt(letsGo, 10)).toEqual(['boosters']);
    expect(partsGoneAt(letsGo, 30)).toEqual(['boosters']);
  });

  it('draws all of the craft up to its nose until the top is let go', () => {
    expect(topShareAt(letsGo, 15)).toBe(1);
    expect(topShareAt(letsGo, 20)).toBe(0.9);
  });

  it('draws a part from the sides falling behind, and one from the nose pulling ahead', () => {
    expect(letGoPartAt(letsGo, 10 - second)).toBeNull();
    const side = letGoPartAt(letsGo, 10 + 4 * second);
    expect(side).toMatchObject({ part: 'boosters', fromShare: 0, toShare: 1, ahead: false });
    expect(side?.behindKm).toBeGreaterThan(0);
    const top = letGoPartAt(letsGo, 20 + 4 * second);
    expect(top).toMatchObject({ part: null, fromShare: 0.9, toShare: 1, ahead: true });
    expect(top?.behindKm).toBeCloseTo(side?.behindKm ?? 0, 12);
    expect(letGoPartAt(letsGo, 20 + 60 * second)).toBeNull();
  });
});

describe('settlingShedShareAt', () => {
  const sheds = [
    { atJd: { value: 10 }, belowShare: { value: 0.3 } },
    { atJd: { value: 20 }, belowShare: { value: 0.6 } },
  ];
  const second = 1 / 86_400;

  it('does not jump when a part is let go, and ends up where the plain share is', () => {
    expect(settlingShedShareAt(sheds, 10)).toBe(0);
    const soon = settlingShedShareAt(sheds, 10 + 0.1 * second);
    expect(soon).toBeGreaterThan(0);
    expect(soon).toBeLessThan(0.001);
    expect(settlingShedShareAt(sheds, 10 + 5 * second)).toBeCloseTo(0.15, 9);
    expect(settlingShedShareAt(sheds, 15)).toBeCloseTo(shedShareAt(sheds, 15), 12);
    expect(settlingShedShareAt(sheds, 25)).toBeCloseTo(0.6, 12);
  });
});

describe('standingPartAt', () => {
  const sheds = [{ atJd: { value: 10 }, belowShare: { value: 0.4 }, stays: true as const }];

  it('is the part left on the ground from the instant it is left, for good', () => {
    expect(standingPartAt(sheds, 9)).toBeNull();
    expect(standingPartAt(sheds, 10)).toEqual({ fromShare: 0, toShare: 0.4, atJd: 10 });
    expect(standingPartAt(sheds, 1000)).toEqual({ fromShare: 0, toShare: 0.4, atJd: 10 });
  });

  it('is not also drawn dropping behind, and a part that drops is not left standing', () => {
    expect(droppedPartAt(sheds, 10)).toBeNull();
    const falls = [{ atJd: { value: 10 }, belowShare: { value: 0.4 } }];
    expect(standingPartAt(falls, 11)).toBeNull();
  });
});

describe('groundExposure', () => {
  it('leaves a look under a high star as it is, and brightens one under a low star', () => {
    expect(groundExposure(1)).toBe(1);
    expect(groundExposure(0.5)).toBeCloseTo(2, 12);
  });

  it('brightens no more than its limit, even at night', () => {
    expect(groundExposure(0.01)).toBeCloseTo(3.5, 12);
    expect(groundExposure(-0.5)).toBeCloseTo(3.5, 12);
  });
});

describe('joinedGapKm', () => {
  const second = 1 / 86_400;

  it('is nothing while the two are joined, at either end', () => {
    expect(joinedGapKm(10, 20, 9)).toBe(0);
    expect(joinedGapKm(10, 20, 10)).toBe(0);
    expect(joinedGapKm(10, 20, 20)).toBe(0);
    expect(joinedGapKm(10, 20, 21)).toBe(0);
  });

  it('opens steadily after they part and closes the same way before they join', () => {
    const after = joinedGapKm(10, 20, 10 + 100 * second);
    expect(after).toBeGreaterThan(0);
    expect(joinedGapKm(10, 20, 10 + 200 * second)).toBeCloseTo(2 * after, 9);
    expect(joinedGapKm(10, 20, 20 - 100 * second)).toBeCloseTo(after, 9);
  });

  it('is never wider than its limit', () => {
    expect(joinedGapKm(10, 20, 15)).toBeCloseTo(0.03, 12);
  });
});
