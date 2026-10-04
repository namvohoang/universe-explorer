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

/**
 * Where the recording for a card is, or `null` when there is none or it was made for
 * different words than the card now shows.
 */
export function narrationUrl(objectId: string | null, lines: readonly string[]): string | null {
  const entry = NARRATION[objectId ?? SOLAR_SYSTEM_CARD_ID];
  if (entry?.fingerprint !== linesFingerprint(lines)) return null;
  return mediaUrl(entry.file);
}
