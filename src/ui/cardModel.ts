import { SOLAR_SYSTEM_CARD_ID, cards } from '../data/content/cards';
import { concepts } from '../data/content/concepts';
import type { CelestialObject, MediaKind } from '../data/types';
import { semiMajorAxisKm } from '../sim/elements';
import { fill } from './format';
import { displayName } from './names';
import { beltStats, objectStats, solarSystemStats, type Stat } from './stats';
import { en } from './strings/en';
import { mediaKindLabel } from './strings/media';

/** Everything an info card shows, as plain text ready for the page (and for reading aloud). */
export interface CardModel {
  readonly eyebrow: string;
  readonly name: string;
  readonly hello: string;
  readonly stats: readonly Stat[];
  readonly facts: readonly string[];
  /** What kind of thing this is, as a question and its answer; `null` for the whole view. */
  readonly concept: { readonly title: string; readonly text: string } | null;
  /** A line about how the thing is drawn: what the globe's picture really is, or what a belt's dots are. */
  readonly note: string | null;
}

const STRINGS: Readonly<Record<string, string>> = en;

function text(key: string): string {
  const value = STRINGS[key];
  if (value === undefined) throw new Error(`No string for key "${key}"`);
  return value;
}

/** Which planet this is counting out from the Sun, e.g. "3rd". */
function placeFromSun(object: CelestialObject, catalogue: readonly CelestialObject[]): string {
  const planets = catalogue
    .filter((o) => o.kind === 'planet' && o.orbit)
    .sort((a, b) => (a.orbit && b.orbit ? semiMajorAxisKm(a.orbit) - semiMajorAxisKm(b.orbit) : 0));
  const place = en.ordinals.split(' ')[planets.findIndex((o) => o.id === object.id)];
  if (place === undefined) throw new Error(`${object.id} has no place among the planets`);
  return place;
}

function eyebrow(object: CelestialObject, catalogue: readonly CelestialObject[]): string {
  if (object.kind === 'star') return en.eyebrowStar;
  if (object.kind === 'moon') {
    const parent = catalogue.find((o) => o.id === object.parentId);
    return fill(en.eyebrowMoon, { parent: parent ? displayName(parent) : '' });
  }
  if (object.kind === 'dwarf-planet') return en.eyebrowDwarfPlanet;
  if (object.kind === 'asteroid') return en.eyebrowAsteroid;
  if (object.kind === 'belt') return en.eyebrowBelt;
  if (object.kind === 'comet') return en.eyebrowComet;
  return fill(en.eyebrowPlanet, { place: placeFromSun(object, catalogue) });
}

function conceptOf(object: CelestialObject): CardModel['concept'] {
  const concept = concepts.find((c) => c.kind === object.kind);
  return concept ? { title: text(concept.titleKey), text: text(concept.text.key) } : null;
}

function globeNote(kind: MediaKind | undefined): string | null {
  const label = kind === undefined ? null : mediaKindLabel(kind);
  return label === null ? null : `${en.aboutTheGlobe}: ${label}`;
}

/** The card for one object, or for the whole view when `objectId` is `null`. */
export function cardModel(
  objectId: string | null,
  catalogue: readonly CelestialObject[],
): CardModel {
  const content = cards.find((card) => card.id === (objectId ?? SOLAR_SYSTEM_CARD_ID));
  const facts = content ? content.facts.map((fact) => text(fact.key)) : [];

  if (objectId === null) {
    if (!content) throw new Error('There is no card for the whole view');
    return {
      eyebrow: en.eyebrowSolarSystem,
      name: en.nameSolarSystem,
      hello: text(content.hello.key),
      stats: solarSystemStats(catalogue),
      facts,
      concept: null,
      note: null,
    };
  }
  const object = catalogue.find((o) => o.id === objectId);
  if (!object) throw new Error(`No object "${objectId}" in the catalogue`);
  return {
    eyebrow: eyebrow(object, catalogue),
    name: displayName(object),
    hello: content ? text(content.hello.key) : plainHello(object, catalogue),
    stats: object.kind === 'belt' ? beltStats(object) : objectStats(object, catalogue, content),
    facts,
    concept: conceptOf(object),
    note:
      object.kind === 'belt'
        ? en.beltNote
        : object.kind === 'comet'
          ? en.cometNote
          : globeNote(object.media.find((media) => media.role === 'surface-map')?.kind),
  };
}

/**
 * The hello for an object nobody has written a card for yet: one sentence that is true from
 * the catalogue alone.
 */
function plainHello(object: CelestialObject, catalogue: readonly CelestialObject[]): string {
  if (object.kind === 'dwarf-planet') {
    return fill(en.helloDwarfPlanet, { name: displayName(object) });
  }
  if (object.kind === 'asteroid') return fill(en.helloAsteroid, { name: displayName(object) });
  if (object.kind !== 'moon') throw new Error(`No card for "${object.id}"`);
  const parent = catalogue.find((o) => o.id === object.parentId);
  return fill(en.helloMoon, {
    name: displayName(object),
    parent: parent ? displayName(parent) : '',
  });
}
