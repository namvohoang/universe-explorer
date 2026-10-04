import { describe, expect, it } from 'vitest';
import { TAU, degToRad, radToDeg, wrapTau } from './angles';

describe('angles', () => {
  it('converts degrees to radians and back', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 12);
    expect(radToDeg(degToRad(23.5))).toBeCloseTo(23.5, 12);
  });

  it('wraps angles into [0, 2π)', () => {
    expect(wrapTau(0)).toBe(0);
    expect(wrapTau(TAU + 1)).toBeCloseTo(1, 12);
    expect(wrapTau(-1)).toBeCloseTo(TAU - 1, 12);
    expect(wrapTau(-3 * TAU + 0.25)).toBeCloseTo(0.25, 12);
  });
});
