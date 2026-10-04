// What each kind of object is, in one or two sentences, each backed by a quote from a NASA
// page. A script checked that every quote appears in the page as fetched on the source's
// `retrieved` date. The sentences themselves are in src/ui/strings/en.ts.
import {
  NASA_DWARF_PLANETS,
  NASA_FACTS_ASTEROIDS,
  NASA_FACTS_COMETS,
  NASA_FACTS_SUN,
  NASA_MOONS,
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
];
