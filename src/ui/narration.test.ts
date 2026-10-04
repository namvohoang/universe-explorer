import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { SOLAR_SYSTEM_CARD_ID } from '../data/content/cards';
import { NARRATION } from '../data/content/narration';
import { cardModel } from './cardModel';
import { linesFingerprint, narratedIds, narrationUrl } from './narration';
import { speechLines } from './speech';

const ROOT = join(import.meta.dirname, '../..');

describe('linesFingerprint', () => {
  it('is FNV-1a over the lines joined by newlines, as the recording script computes it', () => {
    expect(linesFingerprint(['a'])).toBe('e40c292c');
    expect(linesFingerprint(['a', 'b'])).toBe(linesFingerprint(['a\nb']));
    expect(linesFingerprint(['é'])).not.toBe(linesFingerprint(['e']));
  });
});

describe('narration', () => {
  it('has a recording for every card, made for the words the card shows now', () => {
    // If this fails after a text change, re-run tools/narrate/kokoro_narrate.py.
    for (const id of narratedIds(catalogue)) {
      const key = id ?? SOLAR_SYSTEM_CARD_ID;
      const lines = speechLines(cardModel(id, catalogue));
      expect(NARRATION[key]?.fingerprint, key).toBe(linesFingerprint(lines));
      expect(narrationUrl(id, lines), key).toMatch(/voice\/.+\.mp3$/);
    }
  });

  it('points only at files that exist', () => {
    for (const entry of Object.values(NARRATION)) {
      expect(existsSync(join(ROOT, entry.file)), entry.file).toBe(true);
    }
  });

  it('plays nothing when the words have changed since the recording', () => {
    expect(narrationUrl('saturn', ['Different words.'])).toBeNull();
    expect(narrationUrl('no-such-card', ['Anything.'])).toBeNull();
  });
});
