import { describe, expect, it } from 'vitest';
import { groundUnder, type Turned } from './turn';

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
