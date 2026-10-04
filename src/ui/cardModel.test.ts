import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { cards } from '../data/content/cards';
import { concepts } from '../data/content/concepts';
import { bodyRadiusKm } from '../sim/layout';
import { cardModel, isDeepSky } from './cardModel';
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

  it('gives a comet its everyday name, its closest approach and a note about the drawn tail', () => {
    const halley = cardModel('halley', catalogue);
    expect(halley.name).toBe("Halley's Comet");
    expect(halley.eyebrow).toBe('Comet · goes around the Sun');
    expect(halley.note).toBe(en.cometNote);
    expect(halley.stats.map((s) => s.label)).toEqual([
      'One trip around the Sun',
      'Closest to the Sun',
      'Width',
    ]);
    expect(halley.stats[1]?.value).toBe("0.57 times Earth's distance");
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

describe('deep-sky cards', () => {
  it('say how far the thing is and how old its light is', () => {
    const orion = cardModel('orion-nebula', catalogue);
    expect(orion.name).toBe('The Orion Nebula');
    expect(orion.eyebrow).toBe('Nebula · 1,500 light-years away');
    expect(orion.stats).toEqual([
      { label: 'How far away', value: '1,500 light-years' },
      { label: 'The light you see left it', value: '1,500 years ago' },
    ]);
    expect(cardModel('andromeda', catalogue).stats[0]?.value).toBe('2.5 million light-years');
    expect(cardModel('crab-nebula', catalogue).stats[2]).toEqual({
      label: 'Width',
      value: '6 light-years',
    });
  });

  it('show a picture with its credit and say what kind of picture it is', () => {
    const crab = cardModel('crab-nebula', catalogue);
    expect(crab.picture?.url).toMatch(/media\/deep\/crab-nebula\.webp$/);
    expect(crab.picture?.alt).toMatch(/\S/);
    expect(crab.picture?.credit).toBe(
      'Picture: NASA, ESA, J. Hester and A. Loll (Arizona State University)',
    );
    expect(crab.note).toBe(en.mediaKindFalseColour);
    expect(cardModel('saturn', catalogue).picture).toBeNull();
  });

  it('exist for every deep-sky object, each with three facts', () => {
    const deep = catalogue.filter(isDeepSky);
    expect(deep.length).toBeGreaterThanOrEqual(5);
    for (const object of deep) {
      const card = cardModel(object.id, catalogue);
      expect(card.facts).toHaveLength(3);
      expect(card.picture).not.toBeNull();
    }
  });
});

describe('concepts', () => {
  const strings: Readonly<Record<string, string>> = en;
  const places = catalogue.filter(
    (o) => bodyRadiusKm(o) !== null || o.kind === 'belt' || isDeepSky(o),
  );

  it('says what kind of thing every place is', () => {
    for (const place of places) {
      const { concept } = cardModel(place.id, catalogue);
      expect(concept?.title, place.id).toMatch(/^What is an? .+\?$/);
      expect(concept?.text, place.id).toMatch(/\S/);
    }
    expect(cardModel('titan', catalogue).concept?.title).toBe('What is a moon?');
    expect(cardModel(null, catalogue).concept).toBeNull();
  });

  it('backs every concept with a quote and has one per kind', () => {
    expect(new Set(concepts.map((c) => c.kind)).size).toBe(concepts.length);
    for (const concept of concepts) {
      expect(strings[concept.titleKey]).toMatch(/\S/);
      expect(strings[concept.text.key]).toMatch(/\S/);
      expect(concept.text.quote.length).toBeGreaterThan(10);
      expect(concept.text.sourceId).toBe(concept.source.id);
    }
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
