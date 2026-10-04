import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { cards } from '../data/content/cards';
import { bodyRadiusKm } from '../sim/layout';
import { cardModel } from './cardModel';
import { displayName } from './names';
import { en } from './strings/en';

const drawn = catalogue.filter((o) => bodyRadiusKm(o) !== null);
const written = new Set(cards.map((card) => card.id));

describe('cardModel', () => {
  it('has a card for the whole view and for every drawn body', () => {
    for (const id of [null, ...drawn.map((o) => o.id)]) {
      const card = cardModel(id, catalogue);
      expect(card.name).toMatch(/\S/);
      expect(card.eyebrow).toMatch(/\S/);
      expect(card.hello).toMatch(/\S/);
      expect(card.stats.length).toBeGreaterThanOrEqual(3);
      expect(card.stats.length).toBeLessThanOrEqual(4);
    }
  });

  it('describes a belt by its dots and its span, and says the dots are not to size', () => {
    const belt = cardModel('asteroid-belt', catalogue);
    expect(belt.eyebrow).toBe(en.eyebrowBelt);
    expect(belt.facts).toHaveLength(3);
    expect(belt.note).toBe(en.beltNote);
    expect(belt.stats).toEqual([
      { label: 'Dots drawn here', value: '1,500' },
      { label: 'From the Sun', value: "2.2 to 3.2 times Earth's distance" },
    ]);
    expect(cardModel('kuiper-belt', catalogue).stats[1]?.value).toBe(
      "30 to 50 times Earth's distance",
    );
  });

  it('introduces an asteroid as one', () => {
    const eros = cardModel('eros', catalogue);
    expect(eros.eyebrow).toBe('Asteroid · goes around the Sun');
    expect(eros.hello).toBe('Eros is an asteroid.');
  });

  it('introduces a dwarf planet as one', () => {
    const pluto = cardModel('pluto', catalogue);
    expect(pluto.eyebrow).toBe('Dwarf planet · goes around the Sun');
    expect(pluto.hello).toBe('Pluto is a dwarf planet.');
    expect(pluto.stats.map((s) => s.label)).toEqual([
      'One spin',
      'One trip around the Sun',
      'Width',
    ]);
  });

  it('has three facts wherever a card has been written', () => {
    expect(cardModel(null, catalogue).facts).toHaveLength(3);
    for (const object of drawn) {
      expect(cardModel(object.id, catalogue).facts).toHaveLength(written.has(object.id) ? 3 : 0);
    }
  });

  it('says only what the catalogue knows about a moon with no written card', () => {
    const titan = cardModel('titan', catalogue);
    expect(titan.eyebrow).toBe('Moon · goes around Saturn');
    expect(titan.hello).toBe('Titan is a moon of Saturn.');
    expect(titan.stats.map((s) => s.label)).toEqual([
      'One trip around Saturn',
      'One spin',
      'From Saturn',
      'Width',
    ]);
    // Locked to its planet, it spins once per trip around it.
    expect(titan.stats[0]?.value).toBe(titan.stats[1]?.value);
  });

  it('numbers the planets out from the Sun', () => {
    expect(cardModel('mercury', catalogue).eyebrow).toBe('Planet · 1st from the Sun');
    expect(cardModel('earth', catalogue).eyebrow).toBe('Planet · 3rd from the Sun');
    expect(cardModel('neptune', catalogue).eyebrow).toBe('Planet · 8th from the Sun');
    expect(cardModel('moon', catalogue).eyebrow).toBe('Moon · goes around Earth');
  });

  it('says what the globe is when it is not a plain photo', () => {
    expect(cardModel('saturn', catalogue).note).toBe(
      `About this globe: ${en.mediaKindArtistConcept}`,
    );
    expect(cardModel('venus', catalogue).note).toContain(en.mediaKindFalseColour);
    expect(cardModel('earth', catalogue).note).toContain(en.mediaKindComposite);
    expect(cardModel('sun', catalogue).note).toBeNull();
  });

  it('calls the Sun and the Moon by the names kids use', () => {
    expect(cardModel('sun', catalogue).name).toBe('The Sun');
    const mars = catalogue.find((o) => o.id === 'mars');
    if (!mars) throw new Error('no Mars');
    expect(displayName(mars)).toBe('Mars');
  });

  it('refuses an id with no card', () => {
    expect(() => cardModel('saturn-rings', catalogue)).toThrow();
  });
});

describe('card content', () => {
  const strings: Readonly<Record<string, string>> = en;

  it('backs every sentence with a quote from one of the card’s sources', () => {
    for (const card of cards) {
      const ids = new Set(card.sources.map((s) => s.id));
      const used = new Set<string>();
      for (const sentence of [card.hello, ...card.facts]) {
        expect(strings[sentence.key], sentence.key).toMatch(/\S/);
        expect(sentence.quote.length, sentence.key).toBeGreaterThan(10);
        expect(ids.has(sentence.sourceId), sentence.key).toBe(true);
        used.add(sentence.sourceId);
      }
      if (card.moons) {
        expect(ids.has(card.moons.sourceId)).toBe(true);
        used.add(card.moons.sourceId);
      }
      expect([...ids].sort()).toEqual([...used].sort());
    }
  });

  it('keeps sentences short enough for a young reader', () => {
    for (const card of cards) {
      for (const sentence of [card.hello, ...card.facts]) {
        expect(strings[sentence.key]?.length ?? 0, sentence.key).toBeLessThanOrEqual(130);
      }
    }
  });
});
