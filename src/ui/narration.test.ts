import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { SOLAR_SYSTEM_CARD_ID } from '../data/content/cards';
import { NARRATION } from '../data/content/narration';
import { cardModel } from './cardModel';
import { lineAt, linesFingerprint, narratedIds, narrationFor, narrationUrl } from './narration';
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
      // One start time for each line, beginning at nought and always later than the last.
      const starts = narrationFor(id, lines)?.starts ?? [];
      expect(starts.length, key).toBe(lines.length);
      expect(starts[0], key).toBe(0);
      expect(
        [...starts].sort((a, b) => a - b),
        key,
      ).toEqual(starts);
      expect(new Set(starts).size, key).toBe(starts.length);
    }
  });

  it('tells which line is being read at a moment of the recording', () => {
    const starts = [0, 1.5, 4.25];
    expect(lineAt(starts, 0)).toBe(0);
    expect(lineAt(starts, 1.49)).toBe(0);
    expect(lineAt(starts, 1.5)).toBe(1);
    expect(lineAt(starts, 99)).toBe(2);
    expect(lineAt([], 3)).toBe(0);
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
