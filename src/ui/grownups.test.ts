import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { cards } from '../data/content/cards';
import { allPictureCredits, allSources } from './grownups';

describe('grown-ups page', () => {
  it('lists every source once, including the pages card sentences quote', () => {
    const sources = allSources(catalogue);
    expect(new Set(sources.map((s) => s.id)).size).toBe(sources.length);
    for (const object of catalogue) {
      for (const source of object.sources) expect(sources).toContainEqual(source);
    }
    for (const card of cards) {
      for (const source of card.sources) expect(sources).toContainEqual(source);
    }
    for (const source of sources) expect(source.url).toMatch(/^https:\/\//);
  });

  it('credits every picture and map in the app', () => {
    const credits = allPictureCredits(catalogue);
    const mediaCount = catalogue.reduce((n, object) => n + object.media.length, 0);
    expect(credits).toHaveLength(mediaCount);
    for (const credit of credits) {
      expect(credit.name).toMatch(/\S/);
      expect(credit.credit, credit.name).toMatch(/\S/);
    }
  });

  it('says so when a picture is an artist’s drawing', () => {
    const saturn = allPictureCredits(catalogue).find((c) => c.name === 'Saturn');
    expect(saturn?.kind).toMatch(/artist/i);
  });
});
