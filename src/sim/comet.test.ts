import { describe, expect, it } from 'vitest';
import {
  TAIL_STARTS_AU,
  behindDirection,
  dustGrain,
  nucleusRelief,
  tailDirections,
  tailStrength,
} from './comet';
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

describe('behindDirection', () => {
  const sun = { x: 0, y: 0, z: 0 };
  const comet = { x: 2, y: 0, z: 0 };

  it('points against the motion, square to the line from the Sun', () => {
    const behind = behindDirection(comet, sun, { x: 3, y: 0, z: 5 });
    expect(behind?.x).toBeCloseTo(0, 12);
    expect(behind?.z).toBeCloseTo(-1, 12);
  });

  it('is not defined with no heading, or when heading straight away from the Sun', () => {
    expect(behindDirection(comet, sun, { x: 0, y: 0, z: 0 })).toBeNull();
    expect(behindDirection(comet, sun, { x: 4, y: 0, z: 0 })).toBeNull();
  });
});

describe('dustGrain', () => {
  it('starts at the comet and bends back more and more down the tail', () => {
    expect(dustGrain(0, 0.5)).toEqual({ away: 0, behind: 0 });
    const near = dustGrain(0.25, 0.5);
    const far = dustGrain(1, 0.5);
    expect(far.away).toBe(1);
    // Four times as far down the tail, the grain is more than four times as far behind.
    expect(far.behind / near.behind).toBeGreaterThan(far.away / near.away);
  });

  it('keeps a grain that does not fall behind in line with the gas tail', () => {
    expect(dustGrain(0.7, 0).behind).toBe(0);
    expect(dustGrain(0.7, 0.6).behind).toBeGreaterThan(dustGrain(0.7, 0.2).behind);
  });
});

describe('nucleusRelief', () => {
  it('is narrower at the waist than at either end', () => {
    const waist = nucleusRelief({ x: 0, y: 1, z: 0 }).width;
    const off = Math.SQRT1_2;
    expect(waist).toBeLessThan(nucleusRelief({ x: off, y: off, z: 0 }).width);
    expect(waist).toBeLessThan(nucleusRelief({ x: -off, y: off, z: 0 }).width);
  });

  it('keeps the lumps small next to the body, so its real length and width still show', () => {
    for (let n = 0; n < 200; n += 1) {
      const a = n * 2.399963;
      const z = 1 - (2 * n + 1) / 200;
      const r = Math.sqrt(1 - z * z);
      const { width, height } = nucleusRelief({ x: r * Math.cos(a), y: r * Math.sin(a), z });
      expect(height).toBeGreaterThan(0.84);
      expect(height).toBeLessThan(1.16);
      expect(width).toBeGreaterThan(0.6);
      expect(width).toBeLessThan(1.15);
    }
  });
});
