// What each kind of object is, in one or two sentences, each backed by a quote from a NASA
// page. A script checked that every quote appears in the page as fetched on the source's
// `retrieved` date. The sentences themselves are in src/ui/strings/en.ts.
import {
  NASA_DWARF_PLANETS,
  NASA_EXOPLANETS,
  NASA_FACTS_ASTEROIDS,
  NASA_FACTS_COMETS,
  NASA_FACTS_SUN,
  NASA_FIRST_BLACK_HOLE_IMAGE,
  NASA_HUBBLE_M42,
  NASA_HUBBLE_M45,
  NASA_HUBBLE_M87,
  NASA_MOONS,
  NASA_CONSTELLATIONS,
  NASA_SATELLITE,
  NASA_STAR_TYPES,
  NASA_WHAT_IS_A_PLANET,
} from '../catalogue/sources';
import type { ConceptContent } from '../types';

export const concepts: readonly ConceptContent[] = [
  {
    kind: 'star',
    titleKey: 'conceptStarTitle',
    text: {
      key: 'conceptStarText',
      sourceId: 'nasa-facts-sun',
      quote: 'a hot glowing ball of hydrogen and helium',
    },
    source: NASA_FACTS_SUN,
  },
  {
    kind: 'planet',
    titleKey: 'conceptPlanetTitle',
    text: {
      key: 'conceptPlanetText',
      sourceId: 'nasa-what-is-a-planet',
      quote:
        'The definition of a planet adopted by the IAU says a planet must do three things: It must orbit a star',
    },
    source: NASA_WHAT_IS_A_PLANET,
  },
  {
    kind: 'dwarf-planet',
    titleKey: 'conceptDwarfPlanetTitle',
    text: {
      key: 'conceptDwarfPlanetText',
      sourceId: 'nasa-dwarf-planets',
      quote:
        'Dwarf planets like Pluto were defined as objects that orbit the Sun, and are nearly round, but have not been able to clear their orbit of debris.',
    },
    source: NASA_DWARF_PLANETS,
  },
  {
    kind: 'moon',
    titleKey: 'conceptMoonTitle',
    text: {
      key: 'conceptMoonText',
      sourceId: 'nasa-moons',
      quote:
        'Naturally-formed bodies that orbit planets are called moons, or planetary satellites.',
    },
    source: NASA_MOONS,
  },
  {
    kind: 'constellation',
    titleKey: 'conceptConstellationTitle',
    text: {
      key: 'conceptConstellationText',
      sourceId: 'nasa-constellations',
      quote: 'Some stars in a constellation might be close while others are very far away.',
    },
    source: NASA_CONSTELLATIONS,
  },
  {
    kind: 'spacecraft',
    titleKey: 'conceptSpacecraftTitle',
    text: {
      key: 'conceptSpacecraftText',
      sourceId: 'nasa-satellite',
      quote: 'A satellite is an object that moves around a larger object.',
    },
    source: NASA_SATELLITE,
  },
  {
    kind: 'asteroid',
    titleKey: 'conceptAsteroidTitle',
    text: {
      key: 'conceptAsteroidText',
      sourceId: 'nasa-facts-asteroids',
      quote: 'rocky remnants left over from the formation of our solar system',
    },
    source: NASA_FACTS_ASTEROIDS,
  },
  {
    kind: 'comet',
    titleKey: 'conceptCometTitle',
    text: {
      key: 'conceptCometText',
      sourceId: 'nasa-facts-comets',
      quote: 'Comets are leftovers from the dawn of our solar system',
    },
    source: NASA_FACTS_COMETS,
  },
  {
    kind: 'belt',
    titleKey: 'conceptBeltTitle',
    text: {
      key: 'conceptBeltText',
      sourceId: 'nasa-facts-asteroids',
      quote:
        'The majority of known asteroids orbit within the asteroid belt between Mars and Jupiter',
    },
    source: NASA_FACTS_ASTEROIDS,
  },
  {
    kind: 'nebula',
    titleKey: 'conceptNebulaTitle',
    text: {
      key: 'conceptNebulaText',
      sourceId: 'nasa-hubble-m42',
      quote:
        'The nebula is an enormous cloud of dust and gas where vast numbers of new stars are being forged.',
    },
    source: NASA_HUBBLE_M42,
  },
  {
    kind: 'star-cluster',
    titleKey: 'conceptStarClusterTitle',
    text: {
      key: 'conceptStarClusterText',
      sourceId: 'nasa-hubble-m45',
      quote: 'It contains over a thousand stars that are loosely bound by gravity',
    },
    source: NASA_HUBBLE_M45,
  },
  {
    kind: 'galaxy',
    titleKey: 'conceptGalaxyTitle',
    text: {
      key: 'conceptGalaxyText',
      sourceId: 'nasa-hubble-m87',
      quote: 'our Milky Way galaxy contains only a few hundred billion stars',
    },
    source: NASA_HUBBLE_M87,
  },
  {
    kind: 'black-hole',
    titleKey: 'conceptBlackHoleTitle',
    text: {
      key: 'conceptBlackHoleText',
      sourceId: 'nasa-first-black-hole-image',
      quote:
        'A black hole is a dense, compact object whose gravitational pull is so strong that - within a certain distance of it - nothing can escape, not even light.',
    },
    source: NASA_FIRST_BLACK_HOLE_IMAGE,
  },
  {
    kind: 'neutron-star',
    titleKey: 'conceptNeutronStarTitle',
    text: {
      key: 'conceptNeutronStarText',
      sourceId: 'nasa-star-types',
      quote:
        'The result is a huge explosion called a supernova. The remnant core is a superdense neutron star.',
    },
    source: NASA_STAR_TYPES,
  },
  {
    kind: 'exoplanet',
    titleKey: 'conceptExoplanetTitle',
    text: {
      key: 'conceptExoplanetText',
      sourceId: 'nasa-exoplanets',
      quote:
        'An exoplanet is any planet beyond our solar system. Most of them orbit other stars, but some free-floating exoplanets, called rogue planets, are untethered to any star. We’ve confirmed more than 6,000 exoplanets, out of the billions that we believe exist.',
    },
    source: NASA_EXOPLANETS,
  },
];
