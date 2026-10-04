import { describe, expect, it } from 'vitest';
import type { Orientation } from '../data/types';
import { TAU } from './angles';
import { J2000_JD } from './constants';
import { spinAngleRad } from './spin';

const orientation = (hours: number | null, rotation: Orientation['rotation']): Orientation => ({
  axialTiltDeg: { value: null, reason: 'not needed here' },
  poleRaDeg: { value: null, reason: 'not needed here' },
  poleDecDeg: { value: null, reason: 'not needed here' },
  rotationPeriodHours:
    hours === null
      ? { value: null, reason: 'chaotic rotation' }
      : { value: hours, sourceId: 'test' },
  rotation,
});

describe('spinAngleRad', () => {
  it('is zero at J2000', () => {
    expect(spinAngleRad(orientation(10, 'prograde'), J2000_JD)).toBe(0);
  });

  it('turns once per rotation period', () => {
    expect(spinAngleRad(orientation(24, 'prograde'), J2000_JD + 1)).toBeCloseTo(TAU, 10);
    expect(spinAngleRad(orientation(12, 'prograde'), J2000_JD + 1)).toBeCloseTo(2 * TAU, 10);
  });

  it('turns the other way for a retrograde body', () => {
    expect(spinAngleRad(orientation(24, 'retrograde'), J2000_JD + 0.25)).toBeCloseTo(-TAU / 4, 10);
  });

  it('runs backwards before J2000', () => {
    expect(spinAngleRad(orientation(24, 'prograde'), J2000_JD - 0.5)).toBeCloseTo(-TAU / 2, 10);
  });

  it('does not turn when the period is unknown', () => {
    expect(spinAngleRad(orientation(null, 'prograde'), J2000_JD + 100)).toBe(0);
  });
});
