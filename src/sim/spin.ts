import type { Orientation } from '../data/types';
import { isKnown } from '../data/types';
import { TAU } from './angles';
import { J2000_JD } from './constants';

const HOURS_PER_DAY = 24;

/**
 * How far a body has turned about its IAU north pole since J2000, in radians. Positive is
 * anticlockwise seen from above that pole; a retrograde body turns the other way.
 *
 * The catalogue does not yet hold where each body's prime meridian pointed at J2000, so the
 * angle starts from zero: the rate and direction are real, which side faces us is not.
 * Returns 0 when the rotation period is unknown.
 */
export function spinAngleRad(orientation: Orientation, jd: number): number {
  const period = orientation.rotationPeriodHours;
  if (!isKnown(period)) return 0;
  const turns = ((jd - J2000_JD) * HOURS_PER_DAY) / period.value;
  return (orientation.rotation === 'retrograde' ? -1 : 1) * TAU * turns;
}
