import { describe, expect, it } from 'vitest';
import { SETTLE_HALF_SECONDS, settleToward, settling } from './settle';

describe('settleToward', () => {
  it('goes half the way in the half time', () => {
    expect(settleToward(0, 1, SETTLE_HALF_SECONDS)).toBeCloseTo(0.5, 12);
    expect(settleToward(1, 0, 2 * SETTLE_HALF_SECONDS)).toBeCloseTo(0.25, 12);
  });

  it('is there at once with no time, as with reduced motion', () => {
    expect(settleToward(0, 1, 0)).toBe(1);
  });

  it('arrives exactly, never creeping for ever', () => {
    let value = 0;
    for (let frame = 0; frame < 180; frame++) value = settleToward(value, 1, 1 / 60);
    expect(value).toBe(1);
  });

  it('never overshoots, however long a frame', () => {
    for (const seconds of [0.01, 0.3, 5]) {
      const value = settleToward(0.2, 0.8, seconds);
      expect(value).toBeGreaterThan(0.2);
      expect(value).toBeLessThanOrEqual(0.8);
    }
  });
});

describe('settling', () => {
  it('starts where it is first aimed, then follows', () => {
    const blend = settling();
    blend.aim(1);
    expect(blend.value).toBe(1);
    expect(blend.step(0.1)).toBe(false);
    blend.aim(0);
    expect(blend.step(SETTLE_HALF_SECONDS)).toBe(true);
    expect(blend.value).toBeCloseTo(0.5, 12);
    expect(blend.target).toBe(0);
  });
});
