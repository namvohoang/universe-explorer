import { describe, expect, it } from 'vitest';
import { TAIL_STARTS_AU, tailStrength } from './comet';

describe('tailStrength', () => {
  it('is nothing far from the Sun and full near it', () => {
    expect(tailStrength(35)).toBe(0);
    expect(tailStrength(TAIL_STARTS_AU)).toBe(0);
    expect(tailStrength(1)).toBe(1);
    expect(tailStrength(0.6)).toBe(1);
  });

  it('grows steadily as the comet comes in', () => {
    let previous = 0;
    for (let r = TAIL_STARTS_AU; r >= 1; r -= 0.1) {
      const strength = tailStrength(r);
      expect(strength).toBeGreaterThanOrEqual(previous);
      previous = strength;
    }
    expect(tailStrength(2)).toBeGreaterThan(0.1);
    expect(tailStrength(2)).toBeLessThan(0.5);
  });

  it('rejects a distance that is not positive', () => {
    expect(() => tailStrength(0)).toThrow(RangeError);
  });
});
