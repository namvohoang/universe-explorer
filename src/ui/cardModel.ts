import { SOLAR_SYSTEM_CARD_ID, cards } from '../data/content/cards';
import type { CelestialObject, MediaKind } from '../data/types';
import { semiMajorAxisKm } from '../sim/elements';
import { fill } from './format';
import { objectStats, solarSystemStats, type Stat } from './stats';
import { en } from './strings/en';
import { mediaKindLabel } from './strings/media';

/** Everything an info card shows, as plain text ready for the page (and for reading aloud). */
export interface CardModel {
  readonly eyebrow: string;
  readonly name: string;
  readonly hello: string;
  readonly stats: readonly Stat[];
  readonly facts: readonly string[];
  /** What the globe's picture really is, when it is not a plain photo; otherwise `null`. */
  readonly globeNote: string | null;
}

const STRINGS: Readonly<Record<string, string>> = en;

function text(key: string): string {
  const value = STRINGS[key];
  if (value === undefined) throw new Error(`No string for key "${key}"`);
  return value;
}

/** The name a kid reads: "The Sun" and "The Moon", otherwise the object's own name. */
export function displayName(object: CelestialObject): string {
  if (object.id === 'sun') return en.nameSun;
  if (object.id === 'moon') return en.nameMoon;
  return object.name;
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
  return fill(en.eyebrowPlanet, { place: placeFromSun(object, catalogue) });
}

function globeNote(kind: MediaKind | undefined): string | null {
  return kind === undefined ? null : mediaKindLabel(kind);
}

/** The card for one object, or for the whole view when `objectId` is `null`. */
export function cardModel(
  objectId: string | null,
  catalogue: readonly CelestialObject[],
): CardModel {
  const content = cards.find((card) => card.id === (objectId ?? SOLAR_SYSTEM_CARD_ID));
  if (!content) throw new Error(`No card for "${objectId ?? SOLAR_SYSTEM_CARD_ID}"`);
  const facts = content.facts.map((fact) => text(fact.key));

  if (objectId === null) {
    return {
      eyebrow: en.eyebrowSolarSystem,
      name: en.nameSolarSystem,
      hello: text(content.hello.key),
      stats: solarSystemStats(catalogue),
      facts,
      globeNote: null,
    };
  }
  const object = catalogue.find((o) => o.id === objectId);
  if (!object) throw new Error(`No object "${objectId}" in the catalogue`);
  return {
    eyebrow: eyebrow(object, catalogue),
    name: displayName(object),
    hello: text(content.hello.key),
    stats: objectStats(object, catalogue, content),
    facts,
    globeNote: globeNote(object.media.find((media) => media.role === 'surface-map')?.kind),
  };
}
