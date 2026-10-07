import type { Sourced } from '../types';

/**
 * A value read from the source with this id. The same as the catalogue's helper, written again
 * here so that the stories, which load only when the Watch screen opens, pull in none of the
 * catalogue's code with them.
 */
export function s<T>(value: T, sourceId: string, note?: string): Sourced<T> {
  return note === undefined ? { value, sourceId } : { value, sourceId, note };
}
