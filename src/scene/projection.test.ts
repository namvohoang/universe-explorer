import { describe, expect, it } from 'vitest';
import { FARTHEST, USUAL_NEAR, depthOf, nearPlaneFor, pixelsFor } from './projection';

describe('pixelsFor', () => {
  it('fills the view when the size spans the field of view', () => {
    // With a 90° field of view, something 2 units tall at distance 1 spans the whole height.
    expect(pixelsFor(2, 1, 90, 800)).toBeCloseTo(800, 9);
  });

  it('shrinks in proportion to distance and grows with size', () => {
    expect(pixelsFor(1, 10, 50, 800)).toBeCloseTo(pixelsFor(1, 5, 50, 800) / 2, 9);
    expect(pixelsFor(3, 10, 50, 800)).toBeCloseTo(3 * pixelsFor(1, 10, 50, 800), 9);
  });

  it('is unbounded at the camera itself', () => {
    expect(pixelsFor(1, 0, 50, 800)).toBe(Infinity);
  });
});

describe('nearPlaneFor', () => {
  it('keeps the usual limit when the subject is far off', () => {
    expect(nearPlaneFor(60)).toBe(USUAL_NEAR);
    expect(nearPlaneFor(USUAL_NEAR * 100)).toBe(USUAL_NEAR);
  });

  it('shrinks when the camera is closer to its subject than the usual limit allows', () => {
    // A space station at true scale is looked at from a few hundred-thousandths of a unit.
    const distance = 6.5e-5;
    expect(nearPlaneFor(distance)).toBeLessThan(distance);
    expect(nearPlaneFor(distance)).toBeCloseTo(distance / 100, 12);
  });

  it('falls back to the usual limit when there is no distance to go by', () => {
    expect(nearPlaneFor(0)).toBe(USUAL_NEAR);
    expect(nearPlaneFor(Number.NaN)).toBe(USUAL_NEAR);
  });
});

describe('depthOf', () => {
  /** Steps a 24-bit depth buffer can tell apart. */
  const STEPS = 2 ** 24;
  // True scale: 1 AU is 1000 scene units, so one kilometre is this many.
  const KM = 1000 / 149_597_870.7;

  it('runs from 0 at the camera to 1 at the farthest thing drawn', () => {
    expect(depthOf(0)).toBe(0);
    expect(depthOf(FARTHEST)).toBeCloseTo(1, 12);
  });

  it('tells apart two sides of a rocket 10 m across from 250 m away', () => {
    const near = depthOf(0.245 * KM);
    const far = depthOf(0.255 * KM);
    expect((far - near) * STEPS).toBeGreaterThan(1000);
  });

  it('still tells a moon from the planet behind it across the solar system', () => {
    // Placeholder distances: two things 0.01 scene units apart, 1000 units away.
    expect((depthOf(1000.01) - depthOf(1000)) * STEPS).toBeGreaterThan(1);
  });
});
