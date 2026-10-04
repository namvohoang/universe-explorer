import type { Sourced, Unknown } from '../types';

/** A value read from the source with this id. */
export function s<T>(value: T, sourceId: string, note?: string): Sourced<T> {
  return note === undefined ? { value, sourceId } : { value, sourceId, note };
}

/** A value the sources do not give. Always say why. */
export function unknown(reason: string): Unknown {
  return { value: null, reason };
}
