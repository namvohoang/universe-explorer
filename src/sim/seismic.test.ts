import { describe, expect, it } from 'vitest';
import { FIJI_2018_QUAKE } from '../data/paths/fiji2018Quake';
import type { QuakeArrival } from '../data/types';
import { bodyFramePoint } from './groundPath';
import { cameStraight, placeAlong, waveFront } from './seismic';
import { angleBetween } from './vec3';

const DEG = Math.PI / 180;
const at = (lonDegEast: number, latDeg: number) =>
  bodyFramePoint({ lonDegEast, latDeg, altitudeKm: 0 }, 1);

describe('placeAlong', () => {
  it('goes north, east, south and west as asked', () => {
    expect(angleBetween(placeAlong(20, 10, 30, 0), at(20, 40))).toBeCloseTo(0, 9);
    expect(angleBetween(placeAlong(20, 10, 30, 180), at(20, -20))).toBeCloseTo(0, 9);
    expect(angleBetween(placeAlong(20, 0, 30, 90), at(50, 0))).toBeCloseTo(0, 9);
    expect(angleBetween(placeAlong(20, 0, 30, 270), at(-10, 0))).toBeCloseTo(0, 9);
  });

  it('is as far from where it set off as it was asked to go', () => {
    for (const [far, way] of [
      [3.6, 275],
      [96.9, 53],
      [175, 300],
    ] as const) {
      const reached = placeAlong(-178.153, -18.1125, far, way);
      expect(angleBetween(reached, at(-178.153, -18.1125)) / DEG).toBeCloseTo(far, 9);
    }
  });

  it('comes to the far side of the world half way round, whichever way it set off', () => {
    expect(angleBetween(placeAlong(30, 20, 180, 77), at(-150, -20))).toBeCloseTo(0, 6);
  });
});

describe('waveFront', () => {
  const arrivals: QuakeArrival[] = [
    [10, 0, 100, 'P'],
    [20, 90, 200, 'P'],
    [30, 180, 190, 'P'],
    [40, 270, 400, 'P'],
    [150, 0, 1100, 'PKPdf'],
  ];
  const front = waveFront(arrivals);

  it('is at each station at the instant the station felt the wave', () => {
    expect(front.reachDeg(100)).toBeCloseTo(10, 12);
    expect(front.reachDeg(400)).toBeCloseTo(40, 12);
  });

  it('goes evenly from one station to the next', () => {
    expect(front.reachDeg(150)).toBeCloseTo(15, 12);
  });

  it('never goes back, though a farther station felt the wave a little sooner', () => {
    expect(front.reachDeg(200)).toBeCloseTo(30, 12);
    let before = 0;
    for (let seconds = 100; seconds <= 400; seconds += 5) {
      const reach = front.reachDeg(seconds) ?? 0;
      expect(reach).toBeGreaterThanOrEqual(before);
      before = reach;
    }
  });

  it('says nothing before the first station felt it, nor beyond the last it reached straight', () => {
    expect(front.reachDeg(99)).toBeNull();
    expect(front.reachDeg(401)).toBeNull();
    expect(front.farthestDeg).toBe(40);
    expect(waveFront([]).reachDeg(10)).toBeNull();
  });

  it('leaves a wave that went through the core out of the front', () => {
    expect(arrivals.filter(cameStraight)).toHaveLength(4);
  });
});

describe('the Fiji earthquake of 2018, from the USGS record', () => {
  const arrivals = FIJI_2018_QUAKE.arrivals.value;
  const front = waveFront(arrivals);
  /**
   * How long before the drawn front reaches it a station may have felt the wave, in seconds.
   * The front never goes back, so a station that felt the wave a little sooner than one
   * nearer in is lit a little before the front gets to it. A pick is read off a recording to
   * about a second and the rock under each station is different; USGS's own table for this
   * earthquake counts picks up to a few seconds from their expected times as good.
   */
  const EARLY_TOLERANCE_SECONDS = 4;

  it('lights no station more than a few seconds before the front reaches it', () => {
    let latest = -Infinity;
    for (const arrival of arrivals.filter(cameStraight)) {
      latest = Math.max(latest, arrival[2]);
      expect(latest - arrival[2]).toBeLessThanOrEqual(EARLY_TOLERANCE_SECONDS);
    }
  });

  it('has a gap round the world where no station felt the wave straight, with the core beyond', () => {
    const throughCore = arrivals.filter((arrival) => arrival[3].startsWith('PKP'));
    const nearestThroughCore = Math.min(...throughCore.map((arrival) => arrival[0]));
    // The record holds no station at all between the two, bar one picked as bent round the core.
    expect(front.farthestDeg).toBeLessThan(100);
    expect(nearestThroughCore).toBeGreaterThan(110);
    // What goes through the core comes later than anything that came straight.
    const lastStraight = Math.max(...arrivals.filter(cameStraight).map((arrival) => arrival[2]));
    expect(Math.min(...throughCore.map((arrival) => arrival[2]))).toBeGreaterThan(lastStraight);
  });
});
