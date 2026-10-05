import { SOLAR_SYSTEM_CARD_ID } from '../data/content/cards';
import { NARRATION } from '../data/content/narration';
import type { CelestialObject } from '../data/types';
import { isShowpiece } from '../data/types';
import { bodyRadiusKm } from '../sim/layout';
import { mediaUrl } from './mediaUrl';

/** Every card that can be read aloud: the whole view (`null`) and each place a kid can go. */
export function narratedIds(catalogue: readonly CelestialObject[]): (string | null)[] {
  const places = catalogue.filter(
    (object) =>
      bodyRadiusKm(object) !== null ||
      object.kind === 'belt' ||
      object.kind === 'constellation' ||
      isShowpiece(object) ||
      object.media.some((media) => media.role === 'picture'),
  );
  return [null, ...places.map((object) => object.id)];
}

/**
 * A short fingerprint of what a recording says, so a recording made for older words is never
 * played over newer ones.
 */
export function linesFingerprint(lines: readonly string[]): string {
  // FNV-1a over the text: small, stable and the same in the browser, Node and Python.
  let hash = 0x811c9dc5;
  for (const char of new TextEncoder().encode(lines.join('\n'))) {
    hash ^= char;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** A recording of a card being read, and the second at which each of its lines starts. */
export interface Narration {
  readonly url: string;
  readonly starts: readonly number[];
}

/**
 * The recording for a card, or `null` when there is none or it was made for different words
 * than the card now shows.
 */
export function narrationFor(objectId: string | null, lines: readonly string[]): Narration | null {
  const entry = NARRATION[objectId ?? SOLAR_SYSTEM_CARD_ID];
  if (entry?.fingerprint !== linesFingerprint(lines)) return null;
  return { url: mediaUrl(entry.file), starts: entry.starts };
}

/** Where the recording for a card is, or `null` (see `narrationFor`). */
export function narrationUrl(objectId: string | null, lines: readonly string[]): string | null {
  return narrationFor(objectId, lines)?.url ?? null;
}

/** Which line is being read at a moment of a recording, given when each line starts. */
export function lineAt(starts: readonly number[], seconds: number): number {
  let line = 0;
  for (let index = 0; index < starts.length; index += 1) {
    if ((starts[index] ?? Infinity) <= seconds) line = index;
  }
  return line;
}
