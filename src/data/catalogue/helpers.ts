import type { Orientation, Sourced, Unknown } from '../types';

/** A value read from the source with this id. */
export function s<T>(value: T, sourceId: string, note?: string): Sourced<T> {
  return note === undefined ? { value, sourceId } : { value, sourceId, note };
}

/** A value the sources do not give. Always say why. */
export function unknown(reason: string): Unknown {
  return { value: null, reason };
}

/**
 * Orientation of a moon the NASA satellite fact sheets mark "S": it turns once per orbit and
 * keeps one face to its planet. Those sheets give no pole or tilt for it.
 */
export const SYNCHRONOUS: Orientation = {
  axialTiltDeg: unknown('The source used gives no tilt for this body.'),
  poleRaDeg: unknown('The source used gives no pole direction for this body.'),
  poleDecDeg: unknown('The source used gives no pole direction for this body.'),
  rotationPeriodHours: unknown(
    'Synchronous: it turns once per orbit, so its rotation period is its orbital period.',
  ),
  rotation: 'synchronous',
};
