import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import { MEDIA_KINDS } from '../src/data/types';
import { SCALE_MODES, createScale } from '../src/sim/scale';
import { en } from '../src/ui/strings/en';
import { mediaKindLabel } from '../src/ui/strings/media';
import { vi } from '../src/ui/strings/vi';
import { cards } from '../src/data/content/cards';

describe('strings', () => {
  it('has the on-screen scale sentence for every scale mode', () => {
    for (const mode of SCALE_MODES) {
      expect(en[createScale(mode).labelKey]).toMatch(/\S/);
    }
  });

  it('has alt text for every picture in the catalogue', () => {
    const strings: Record<string, string> = en;
    for (const object of catalogue) {
      for (const media of object.media) {
        expect(strings[media.altKey], `${object.id}: ${media.altKey}`).toMatch(/\S/);
      }
    }
  });

  it('labels every kind of picture that is not a plain photo', () => {
    for (const kind of MEDIA_KINDS) {
      if (kind === 'photo') expect(mediaKindLabel(kind)).toBeNull();
      else expect(mediaKindLabel(kind)).toMatch(/\S/);
    }
  });
});

describe('Vietnamese', () => {
  const english: Readonly<Record<string, string>> = en;
  const vietnamese: Readonly<Record<string, string>> = vi;
  const blanks = (text: string): string[] =>
    [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[0]).sort();

  it('has every string the English has, with the same blanks to fill', () => {
    for (const [key, text] of Object.entries(english)) {
      expect(vietnamese[key], key).toMatch(/\S/);
      expect(blanks(vietnamese[key] ?? ''), key).toEqual(blanks(text));
    }
  });

  it('adds nothing of its own but names of places', () => {
    const places = new Set(
      catalogue.map(
        (object) =>
          `name${object.id
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')}`,
      ),
    );
    for (const key of Object.keys(vietnamese)) {
      if (key in english) continue;
      expect(places.has(key), key).toBe(true);
    }
  });

  it('keeps every number a card states', () => {
    // A translation must not change a fact: each number in the English is there in the
    // Vietnamese. (It may have more: Vietnamese writes the months as numbers. And it writes
    // 4.6 as 4,6 and 5,500 as 5.500, so the marks inside a number are left out of the check.)
    const numbers = (text: string): string[] =>
      (text.match(/\d[\d.,]*/g) ?? []).map((number) => number.replace(/[.,]/g, ''));
    for (const card of cards) {
      for (const sentence of [card.hello, ...card.facts]) {
        const translated = numbers(vietnamese[sentence.key] ?? '');
        for (const number of numbers(english[sentence.key] ?? '')) {
          expect(translated, `${sentence.key}: ${number}`).toContain(number);
        }
      }
    }
  });

  it('keeps card sentences short enough for a young reader', () => {
    for (const card of cards) {
      for (const sentence of [card.hello, ...card.facts]) {
        expect(vietnamese[sentence.key]?.length ?? 0, sentence.key).toBeLessThanOrEqual(130);
      }
    }
  });

  it('counts the planets out from the Sun, one word for each', () => {
    expect(vi.ordinals.split(' ')).toHaveLength(en.ordinals.split(' ').length);
  });
});
