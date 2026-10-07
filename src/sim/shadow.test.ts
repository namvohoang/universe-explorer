import { describe, expect, it } from 'vitest';
import { shadowAt, shadowCentreOn, sunCover } from './shadow';

// Placeholder sizes for testing the maths, not astronomy: a Sun of radius 10 at the origin, and
// a caster of radius 1 at x = 100. The caster's dark shadow comes to a point 11.1 behind it.
const SUN = { x: 0, y: 0, z: 0 };
const CASTER = { x: 100, y: 0, z: 0 };
const cover = (x: number, y: number): number => sunCover({ x, y, z: 0 }, SUN, 10, CASTER, 1);

describe('sunCover', () => {
  it('is nothing in full sunlight, off to the side or in front of the caster', () => {
    expect(cover(105, 5)).toBe(0);
    expect(cover(50, 0)).toBe(0);
  });

  it('is everything in the dark middle just behind the caster', () => {
    expect(cover(102, 0)).toBe(1);
  });

  it('is the share of the disc covered where the caster looks smaller than the Sun', () => {
    // Far behind, the caster is a small dark disc on the Sun: its area over the Sun's.
    const far = cover(200, 0);
    const sunAngle = Math.asin(10 / 200);
    const casterAngle = Math.asin(1 / 100);
    expect(far).toBeCloseTo((casterAngle / sunAngle) ** 2, 12);
    expect(far).toBeLessThan(1);
  });

  it('grows steadily from the pale edge in to the dark middle', () => {
    let before = 0;
    for (let y = 1.6; y >= 0; y -= 0.05) {
      const now = cover(105, y);
      expect(now).toBeGreaterThanOrEqual(before);
      before = now;
    }
    expect(before).toBe(1);
  });
});

describe('shadowAt', () => {
  it('measures both cones where the shadow passes a body', () => {
    const at = shadowAt(SUN, 10, CASTER, 1, { x: 105, y: 3, z: 0 });
    expect(at.axisDistance).toBeCloseTo(3, 12);
    expect(at.axisPoint.x).toBeCloseTo(105, 12);
    // Five behind the caster: the pale edge has widened and the dark middle narrowed.
    expect(at.penumbraRadius).toBeCloseTo(1 + (11 * 5) / 100, 12);
    expect(at.umbraRadius).toBeCloseTo(1 - (9 * 5) / 100, 12);
  });

  it('agrees with sunCover about where each cone ends', () => {
    const at = shadowAt(SUN, 10, CASTER, 1, { x: 105, y: 0, z: 0 });
    expect(cover(105, at.umbraRadius * 0.98)).toBe(1);
    expect(cover(105, at.umbraRadius * 1.05)).toBeLessThan(1);
    expect(cover(105, at.penumbraRadius * 0.98)).toBeGreaterThan(0);
    expect(cover(105, at.penumbraRadius * 1.02)).toBe(0);
  });

  it('gives a dark middle below zero beyond the shadow’s tip', () => {
    expect(shadowAt(SUN, 10, CASTER, 1, { x: 120, y: 0, z: 0 }).umbraRadius).toBeLessThan(0);
  });
});

describe('shadowCentreOn', () => {
  it('lands on the near side of a body on the line', () => {
    const hit = shadowCentreOn(SUN, CASTER, { x: 110, y: 0, z: 0 }, 2);
    expect(hit?.x).toBeCloseTo(108, 12);
  });

  it('misses a body off the line, or one in front of the caster', () => {
    expect(shadowCentreOn(SUN, CASTER, { x: 110, y: 5, z: 0 }, 2)).toBeNull();
    expect(shadowCentreOn(SUN, CASTER, { x: 90, y: 0, z: 0 }, 2)).toBeNull();
  });
});
