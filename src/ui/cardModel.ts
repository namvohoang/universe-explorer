import { SOLAR_SYSTEM_CARD_ID, cards } from '../data/content/cards';
import { concepts } from '../data/content/concepts';
import type { CelestialObject, MediaRef } from '../data/types';
import { isShowpiece } from '../data/types';
import { semiMajorAxisKm } from '../sim/elements';
import { fill } from './format';
import { mediaUrl } from './mediaUrl';
import { displayName } from './names';
import {
  beltStats,
  deepSkyStats,
  formatLightYears,
  objectStats,
  solarSystemStats,
  type Stat,
} from './stats';
import { words } from './strings';
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
  /** A picture to show with the card, for things that are not drawn in 3D; otherwise `null`. */
  readonly picture: {
    readonly url: string;
    readonly alt: string;
    readonly credit: string;
    /** What the picture is, when it is not a plain photo. */
    readonly label: string | null;
  } | null;
}

const STRINGS: Readonly<Record<string, string>> = words;

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
  const place = words.ordinals.split(' ')[planets.findIndex((o) => o.id === object.id)];
  if (place === undefined) throw new Error(`${object.id} has no place among the planets`);
  return place;
}

const DEEP_KIND_LABELS: Partial<Record<CelestialObject['kind'], string>> = {
  star: words.kindStar,
  exoplanet: words.kindExoplanet,
  nebula: words.kindNebula,
  'star-cluster': words.kindStarCluster,
  galaxy: words.kindGalaxy,
  'black-hole': words.kindBlackHole,
  'neutron-star': words.kindNeutronStar,
};

/**
 * Whether an object lies beyond the solar system. Such objects are shown as a picture, not in
 * 3D, so they are the ones that carry a picture.
 */
export function isDeepSky(object: CelestialObject): boolean {
  // A star pattern has no picture of its own: its stars are the picture.
  if (object.kind === 'constellation') return true;
  // Nor has every far star one from a trusted source: it is still drawn at its size and colour.
  if (object.kind === 'star' && object.sky !== null) return true;
  // Something with a path round the Sun is in the solar system, even with a picture of it.
  return object.orbit === null && object.media.some((media) => media.role === 'picture');
}

function eyebrow(object: CelestialObject, catalogue: readonly CelestialObject[]): string {
  if (object.kind === 'constellation') return words.eyebrowConstellation;
  if (isDeepSky(object)) {
    const kind = DEEP_KIND_LABELS[object.kind] ?? '';
    // With no distance given, it is the one galaxy we are inside.
    const lightYears = 'sky' in object ? (object.sky?.distanceLy.value ?? null) : null;
    if (lightYears === null) return fill(words.eyebrowHome, { kind });
    return fill(words.eyebrowDeep, { kind, distance: formatLightYears(lightYears) });
  }
  if (object.kind === 'star') return words.eyebrowStar;
  if (object.kind === 'moon') {
    const parent = catalogue.find((o) => o.id === object.parentId);
    return fill(words.eyebrowMoon, { parent: parent ? displayName(parent) : '' });
  }
  if (object.kind === 'spacecraft') {
    if (object.orbit === null) return words.eyebrowSpaceship;
    const parent = catalogue.find((o) => o.id === object.parentId);
    return fill(words.eyebrowSpacecraft, { parent: parent ? displayName(parent) : '' });
  }
  if (object.kind === 'dwarf-planet') return words.eyebrowDwarfPlanet;
  if (object.kind === 'asteroid') return words.eyebrowAsteroid;
  if (object.kind === 'belt') return words.eyebrowBelt;
  if (object.kind === 'comet') return words.eyebrowComet;
  return fill(words.eyebrowPlanet, { place: placeFromSun(object, catalogue) });
}

function conceptOf(object: CelestialObject): CardModel['concept'] {
  // The spacecraft concept explains satellites, which a rocket or a retired craft is not.
  if (isShowpiece(object)) return null;
  const concept = concepts.find((c) => c.kind === object.kind);
  return concept ? { title: text(concept.titleKey), text: text(concept.text.key) } : null;
}

function globeNote(media: MediaRef | undefined): string | null {
  const label = media === undefined ? null : mediaKindLabel(media.kind);
  if (label === null) return null;
  const infrared = media?.infrared ? ` ${words.globeInfrared}` : '';
  const unseen = media?.unseen ? ` ${words.globeUnseen}` : '';
  return `${words.aboutTheGlobe}: ${label}${infrared}${unseen}`;
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
      eyebrow: words.eyebrowSolarSystem,
      name: words.nameSolarSystem,
      hello: text(content.hello.key),
      stats: solarSystemStats(catalogue),
      facts,
      concept: null,
      note: null,
      picture: null,
    };
  }
  const object = catalogue.find((o) => o.id === objectId);
  if (!object) throw new Error(`No object "${objectId}" in the catalogue`);
  const picture = object.media.find((media) => media.role === 'picture');
  const drawnNote =
    object.kind === 'belt'
      ? words.beltNote
      : object.kind === 'comet'
        ? words.cometNote
        : object.kind === 'spacecraft'
          ? object.orbit === null
            ? object.media.some((media) => media.role === 'model' && media.kind === 'composite')
              ? words.deepNoteScan
              : words.deepNoteCraft
            : words.spacecraftNote
          : globeNote(
              object.media.find((media) => media.role === 'surface-map' || media.role === 'model'),
            );
  let stats: Stat[];
  if (object.kind === 'belt') stats = beltStats(object);
  else if (isDeepSky(object)) stats = deepSkyStats(object);
  else stats = objectStats(object, catalogue, content);
  return {
    eyebrow: eyebrow(object, catalogue),
    name: displayName(object),
    hello: content ? text(content.hello.key) : plainHello(object, catalogue),
    stats,
    facts,
    concept: conceptOf(object),
    // A picture says what it is (photo, joined pictures, colours added) right under itself.
    note: picture && isDeepSky(object) ? mediaKindLabel(picture.kind) : drawnNote,
    picture: picture
      ? {
          url: mediaUrl(picture.file),
          alt: text(picture.altKey),
          credit: fill(words.pictureCredit, { credit: picture.credit ?? '' }),
          label: mediaKindLabel(picture.kind),
        }
      : null,
  };
}

/**
 * The hello for an object nobody has written a card for yet: one sentence that is true from
 * the catalogue alone.
 */
function plainHello(object: CelestialObject, catalogue: readonly CelestialObject[]): string {
  if (object.kind === 'dwarf-planet') {
    return fill(words.helloDwarfPlanet, { name: displayName(object) });
  }
  if (object.kind === 'asteroid') return fill(words.helloAsteroid, { name: displayName(object) });
  if (object.kind === 'constellation') {
    return fill(words.helloConstellation, { name: displayName(object) });
  }
  if (object.kind !== 'moon') throw new Error(`No card for "${object.id}"`);
  const parent = catalogue.find((o) => o.id === object.parentId);
  return fill(words.helloMoon, {
    name: displayName(object),
    parent: parent ? displayName(parent) : '',
  });
}
