import { describe, expect, it } from 'vitest';
import { shadowCones } from './shadowCone';

describe('shadowCones', () => {
  const cones = shadowCones(5, 1, 20);

  it('leaves the ball where a line touching both balls touches it', () => {
    // On the ball, a point `along` the line and `radius` off it is one ball radius from the middle.
    const umbra = Math.hypot(cones.umbraFrom, cones.umbraRadius(cones.umbraFrom));
    const penumbra = Math.hypot(cones.penumbraFrom, cones.penumbraRadius(cones.penumbraFrom));
    expect(umbra).toBeCloseTo(1, 12);
    expect(penumbra).toBeCloseTo(1, 12);
  });

  it('narrows the umbra to a point and widens the penumbra for ever', () => {
    expect(cones.umbraTo).toBeCloseTo(5, 12);
    expect(cones.umbraRadius(cones.umbraTo)).toBe(0);
    expect(cones.umbraRadius(cones.umbraTo + 1)).toBe(0);
    expect(cones.penumbraRadius(10)).toBeGreaterThan(cones.penumbraRadius(5));
    expect(cones.penumbraRadius(3)).toBeGreaterThan(cones.umbraRadius(3));
  });

  it('gives the real length of Earth’s umbra from the real sizes', () => {
    // Similar triangles: the umbra ends where a ball of Earth's size just covers the Sun.
    const sunKm = 695_700;
    const earthKm = 6378.137;
    const apartKm = 149_597_870.7;
    const real = shadowCones(sunKm, earthKm, apartKm);
    expect(real.umbraTo).toBeCloseTo((apartKm * earthKm) / (sunKm - earthKm), 3);
  });

  it('refuses a light no bigger than the ball, or balls that touch', () => {
    expect(() => shadowCones(1, 1, 20)).toThrow(RangeError);
    expect(() => shadowCones(5, 1, 6)).toThrow(RangeError);
  });
});
