import { describe, expect, it } from 'vitest';
import { TAIL_STARTS_AU, tailDirections, tailStrength } from './comet';
import { angleBetween, dot, length } from './vec3';

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

describe('tailDirections', () => {
  const sun = { x: 0, y: 0, z: 0 };
  const comet = { x: 2, y: 0, z: 0 };
  const heading = { x: 0, y: 0, z: 5 };

  it('points the gas tail straight away from the Sun', () => {
    const { gas } = tailDirections(comet, sun, heading);
    expect(gas).toEqual({ x: 1, y: 0, z: 0 });
  });

  it('swings the dust tail back, away from where the comet is heading', () => {
    const { gas, dust } = tailDirections(comet, sun, heading);
    expect(length(dust)).toBeCloseTo(1, 12);
    expect(dot(dust, gas)).toBeGreaterThan(0.8);
    expect(dust.z).toBeLessThan(0);
    expect(angleBetween(dust, gas)).toBeGreaterThan(0.2);
  });

  it('draws both tails together when the heading is not known', () => {
    const { gas, dust } = tailDirections(comet, sun, { x: 0, y: 0, z: 0 });
    expect(dust).toEqual(gas);
  });
});
