import { describe, expect, it } from 'vitest';
import { groundDirection, groundUnder, type Turned } from './turn';

// A placeholder body for testing the maths, not astronomy: pole along z, turning once in 24 hours.
const BODY: Turned = {
  pole: { x: 0, y: 0, z: 1 },
  atJd: 100,
  primeMeridian: { x: 1, y: 0, z: 0 },
  rotationPeriodHours: 24,
};

describe('groundUnder', () => {
  it('finds latitude 0, longitude 0 under the meridian at its date', () => {
    const under = groundUnder({ x: 5, y: 0, z: 0 }, BODY, 100);
    expect(under.lonDegEast).toBeCloseTo(0, 9);
    expect(under.latDeg).toBeCloseTo(0, 9);
  });

  it('counts longitude eastwards, the way the body turns', () => {
    expect(groundUnder({ x: 0, y: 1, z: 0 }, BODY, 100).lonDegEast).toBeCloseTo(90, 9);
    expect(groundUnder({ x: 0, y: -1, z: 0 }, BODY, 100).lonDegEast).toBeCloseTo(-90, 9);
  });

  it('gives latitude from the pole', () => {
    expect(groundUnder({ x: 1, y: 0, z: 1 }, BODY, 100).latDeg).toBeCloseTo(45, 9);
    expect(groundUnder({ x: 0, y: 0, z: -3 }, BODY, 100).latDeg).toBeCloseTo(-90, 9);
  });

  it('moves west under a fixed direction as the body turns east', () => {
    // A quarter of a day later the ground has turned 90 degrees east.
    expect(groundUnder({ x: 1, y: 0, z: 0 }, BODY, 100.25).lonDegEast).toBeCloseTo(-90, 9);
    expect(groundUnder({ x: 1, y: 0, z: 0 }, BODY, 101).lonDegEast).toBeCloseTo(0, 9);
  });

  it('squares a meridian that is not quite at right angles to the pole', () => {
    const leaning: Turned = { ...BODY, primeMeridian: { x: 1, y: 0, z: 0.2 } };
    expect(groundUnder({ x: 1, y: 0, z: 0 }, leaning, 100).lonDegEast).toBeCloseTo(0, 9);
  });
});

describe('groundDirection', () => {
  it('points out through latitude 0, longitude 0 along the meridian at its date', () => {
    const out = groundDirection({ lonDegEast: 0, latDeg: 0 }, BODY, 100);
    expect(out.x).toBeCloseTo(1, 12);
    expect(out.y).toBeCloseTo(0, 12);
    expect(out.z).toBeCloseTo(0, 12);
  });

  it('is undone by groundUnder, at any place and date', () => {
    for (const [lonDegEast, latDeg, jd] of [
      [33.1, 25.5, 100.3],
      [-120, -40, 99.2],
      [179, 80, 107.77],
    ] as const) {
      const under = groundUnder(groundDirection({ lonDegEast, latDeg }, BODY, jd), BODY, jd);
      expect(under.lonDegEast).toBeCloseTo(lonDegEast, 9);
      expect(under.latDeg).toBeCloseTo(latDeg, 9);
    }
  });
});
