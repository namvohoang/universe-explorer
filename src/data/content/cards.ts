// Every sentence on a card is backed by a quote from a NASA page. A script checked that each
// quote appears in the page as fetched on the source's `retrieved` date, then wrote this file.
// The sentences themselves are in src/ui/strings/en.ts under each `key`.
import {
  NASA_FACTS_ASTEROIDS,
  NASA_FACTS_EARTH,
  NASA_FACTS_JUPITER,
  NASA_FACTS_KUIPER,
  NASA_FACTS_MARS,
  NASA_FACTS_MERCURY,
  NASA_FACTS_MOON,
  NASA_FACTS_NEPTUNE,
  NASA_FACTS_SATURN,
  NASA_FACTS_SUN,
  NASA_FACTS_URANUS,
  NASA_FACTS_VENUS,
} from '../catalogue/sources';
import type { CardContent } from '../types';

/** The card for the whole view, shown when no body is picked. */
export const SOLAR_SYSTEM_CARD_ID = 'solar-system';

export const cards: readonly CardContent[] = [
  {
    id: 'solar-system',
    hello: {
      key: 'cardSolarSystemHello',
      sourceId: 'nasa-facts-sun',
      quote: 'at the center of our solar system',
    },
    facts: [
      {
        key: 'cardSolarSystemFact1',
        sourceId: 'nasa-facts-sun',
        quote: 'when the solar system was first forming, about 4.6 billion years ago',
      },
      {
        key: 'cardSolarSystemFact2',
        sourceId: 'nasa-facts-mercury',
        quote: 'But Mercury is the fastest planet, zipping around the Sun every 88 Earth days.',
      },
      {
        key: 'cardSolarSystemFact3',
        sourceId: 'nasa-facts-neptune',
        quote: 'In 2011 Neptune completed its first 165-year orbit since its discovery in 1846.',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_SUN, NASA_FACTS_MERCURY, NASA_FACTS_NEPTUNE],
  },
  {
    id: 'sun',
    hello: {
      key: 'cardSunHello',
      sourceId: 'nasa-facts-sun',
      quote: 'a hot glowing ball of hydrogen and helium',
    },
    facts: [
      {
        key: 'cardSunFact1',
        sourceId: 'nasa-facts-sun',
        quote: "it would take 1.3 million Earths to fill the Sun's volume",
      },
      {
        key: 'cardSunFact2',
        sourceId: 'nasa-facts-sun',
        quote:
          "The temperature in the Sun's core is about 27 million degrees Fahrenheit (15 million degrees Celsius)",
      },
      {
        key: 'cardSunFact3',
        sourceId: 'nasa-facts-sun',
        quote: 'At its equator, the Sun completes one rotation in 25 Earth days.',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_SUN],
  },
  {
    id: 'mercury',
    hello: {
      key: 'cardMercuryHello',
      sourceId: 'nasa-facts-mercury',
      quote: 'Mercury is the smallest planet in our solar system and nearest to the Sun.',
    },
    facts: [
      {
        key: 'cardMercuryFact1',
        sourceId: 'nasa-facts-mercury',
        quote: 'But Mercury is the fastest planet, zipping around the Sun every 88 Earth days.',
      },
      {
        key: 'cardMercuryFact2',
        sourceId: 'nasa-facts-mercury',
        quote: "Mercury's surface resembles that of Earth's Moon, scarred by many impact craters",
      },
      {
        key: 'cardMercuryFact3',
        sourceId: 'nasa-facts-mercury',
        quote:
          'Without an atmosphere to retain that heat at night, temperatures can dip as low as -290°F (-180°C).',
      },
    ],
    moons: {
      value: 0,
      sourceId: 'nasa-facts-mercury',
      note: "Source says: Mercury doesn't have moons.",
    },
    sources: [NASA_FACTS_MERCURY],
  },
  {
    id: 'venus',
    hello: {
      key: 'cardVenusHello',
      sourceId: 'nasa-facts-venus',
      quote:
        'Its thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system',
    },
    facts: [
      {
        key: 'cardVenusFact1',
        sourceId: 'nasa-facts-venus',
        quote: 'surface temperatures hot enough to melt lead',
      },
      {
        key: 'cardVenusFact2',
        sourceId: 'nasa-facts-venus',
        quote:
          'the Sun would rise in the west and set in the east, because Venus spins backward compared to Earth',
      },
      {
        key: 'cardVenusFact3',
        sourceId: 'nasa-facts-venus',
        quote: 'Venus is the third brightest object in the sky after the Sun and Moon.',
      },
    ],
    moons: {
      value: 0,
      sourceId: 'nasa-facts-venus',
      note: "Source says: Venus is one of only two planets in our solar system that doesn't have a moon",
    },
    sources: [NASA_FACTS_VENUS],
  },
  {
    id: 'earth',
    hello: {
      key: 'cardEarthHello',
      sourceId: 'nasa-facts-earth',
      quote: "It's the only place we know of inhabited by living things.",
    },
    facts: [
      {
        key: 'cardEarthFact1',
        sourceId: 'nasa-facts-earth',
        quote: 'most of our planet is covered in liquid water',
      },
      {
        key: 'cardEarthFact2',
        sourceId: 'nasa-facts-earth',
        quote: 'This tilt causes our yearly cycle of seasons.',
      },
      {
        key: 'cardEarthFact3',
        sourceId: 'nasa-facts-earth',
        quote:
          'Earth is the only planet in the solar system whose English name does not come from Greek or Roman mythology.',
      },
    ],
    moons: {
      value: 1,
      sourceId: 'nasa-facts-earth',
      note: 'Source says: Earth is the only planet in our solar system with only one moon.',
    },
    sources: [NASA_FACTS_EARTH],
  },
  {
    id: 'moon',
    hello: {
      key: 'cardMoonHello',
      sourceId: 'nasa-facts-moon',
      quote: 'The Moon makes a complete orbit around Earth in 27 Earth days',
    },
    facts: [
      {
        key: 'cardMoonFact1',
        sourceId: 'nasa-facts-moon',
        quote: 'so the same hemisphere faces Earth all the time',
      },
      {
        key: 'cardMoonFact2',
        sourceId: 'nasa-facts-moon',
        quote:
          'The temperature on the Moon reaches about 260 degrees Fahrenheit (127 degrees Celsius) when in full Sun',
      },
      {
        key: 'cardMoonFact3',
        sourceId: 'nasa-facts-moon',
        quote:
          'The Moon is slowly moving away from Earth, getting about an inch farther away each year.',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_MOON],
  },
  {
    id: 'mars',
    hello: {
      key: 'cardMarsHello',
      sourceId: 'nasa-facts-mars',
      quote: 'iron minerals in the Martian dirt oxidize, or rust, causing the surface to look red',
    },
    facts: [
      {
        key: 'cardMarsFact1',
        sourceId: 'nasa-facts-mars',
        quote: 'Mars is home to the largest volcano in the solar system, Olympus Mons',
      },
      {
        key: 'cardMarsFact2',
        sourceId: 'nasa-facts-mars',
        quote: "it's the only planet where we've sent rovers to roam the alien landscape",
      },
      { key: 'cardMarsFact3', sourceId: 'nasa-facts-mars', quote: 'Mars has two small moons,' },
    ],
    moons: {
      value: 2,
      sourceId: 'nasa-facts-mars',
      note: 'Source says: Mars has two small moons,',
    },
    sources: [NASA_FACTS_MARS],
  },
  {
    id: 'jupiter',
    hello: {
      key: 'cardJupiterHello',
      sourceId: 'nasa-facts-jupiter',
      quote: "It's the largest planet in our solar system",
    },
    facts: [
      {
        key: 'cardJupiterFact1',
        sourceId: 'nasa-facts-jupiter',
        quote: 'if it were a hollow shell, 1,000 Earths could fit inside',
      },
      {
        key: 'cardJupiterFact2',
        sourceId: 'nasa-facts-jupiter',
        quote:
          'Great Red Spot is a giant storm bigger than Earth that has raged for hundreds of years.',
      },
      {
        key: 'cardJupiterFact3',
        sourceId: 'nasa-facts-jupiter',
        quote:
          'it has the shortest day in the solar system, taking about 9.9 hours to spin around once on its axis',
      },
    ],
    moons: {
      value: 115,
      sourceId: 'nasa-facts-jupiter',
      note: 'Source says: Jupiter has 115 moons that are officially recognized by the International Astronomical Union.',
    },
    sources: [NASA_FACTS_JUPITER],
  },
  {
    id: 'saturn',
    hello: {
      key: 'cardSaturnHello',
      sourceId: 'nasa-facts-saturn',
      quote: 'Saturn is a massive ball made mostly of hydrogen and helium',
    },
    facts: [
      {
        key: 'cardSaturnFact1',
        sourceId: 'nasa-facts-saturn',
        quote:
          'The ring particles mostly range from tiny, dust-sized icy grains to chunks as big as a house.',
      },
      {
        key: 'cardSaturnFact2',
        sourceId: 'nasa-facts-saturn',
        quote: 'The giant gas planet could float in a bathtub if such a colossal thing existed.',
      },
      {
        key: 'cardSaturnFact3',
        sourceId: 'nasa-facts-saturn',
        quote: 'far more than any other planet in our solar system',
      },
    ],
    moons: {
      value: 274,
      sourceId: 'nasa-facts-saturn',
      note: 'Source says: As of March 2025, Saturn had 274 confirmed moons in its orbit',
    },
    sources: [NASA_FACTS_SATURN],
  },
  {
    id: 'uranus',
    hello: {
      key: 'cardUranusHello',
      sourceId: 'nasa-facts-uranus',
      quote:
        'This unique tilt makes Uranus appear to spin sideways, orbiting the Sun like a rolling ball.',
    },
    facts: [
      {
        key: 'cardUranusFact1',
        sourceId: 'nasa-facts-uranus',
        quote: 'with a minimum temperature of 49K (-224.2 degrees Celsius)',
      },
      {
        key: 'cardUranusFact2',
        sourceId: 'nasa-facts-uranus',
        quote: 'Uranus gets its blue-green color from methane gas in the atmosphere.',
      },
      {
        key: 'cardUranusFact3',
        sourceId: 'nasa-facts-uranus',
        quote: 'The ice giant is surrounded by 13 faint rings and 28 small moons.',
      },
    ],
    moons: {
      value: 28,
      sourceId: 'nasa-facts-uranus',
      note: 'Source says: Uranus has 28 known moons.',
    },
    sources: [NASA_FACTS_URANUS],
  },
  {
    id: 'neptune',
    hello: {
      key: 'cardNeptuneHello',
      sourceId: 'nasa-facts-neptune',
      quote: 'Dark, cold, and whipped by supersonic winds',
    },
    facts: [
      {
        key: 'cardNeptuneFact1',
        sourceId: 'nasa-facts-neptune',
        quote: 'at speeds of more than 1,200 miles per hour (2,000 kilometers per hour)',
      },
      {
        key: 'cardNeptuneFact2',
        sourceId: 'nasa-facts-neptune',
        quote:
          'the ice giant became the first planet located through mathematical predictions rather than through regular observations of the sky',
      },
      {
        key: 'cardNeptuneFact3',
        sourceId: 'nasa-facts-neptune',
        quote: 'In 2011 Neptune completed its first 165-year orbit since its discovery in 1846.',
      },
    ],
    moons: {
      value: 16,
      sourceId: 'nasa-facts-neptune',
      note: 'Source says: Neptune has 16 known moons.',
    },
    sources: [NASA_FACTS_NEPTUNE],
  },
  {
    id: 'asteroid-belt',
    hello: {
      key: 'cardAsteroidBeltHello',
      sourceId: 'nasa-facts-asteroids',
      quote: 'Most asteroids orbit our Sun between Mars and Jupiter within the main asteroid belt.',
    },
    facts: [
      {
        key: 'cardAsteroidBeltFact1',
        sourceId: 'nasa-facts-asteroids',
        quote: 'rocky remnants left over from the formation of our solar system',
      },
      {
        key: 'cardAsteroidBeltFact2',
        sourceId: 'nasa-facts-asteroids',
        quote: 'Vesta - the largest asteroid at about 329 miles (530 kilometers) in diameter',
      },
      {
        key: 'cardAsteroidBeltFact3',
        sourceId: 'nasa-facts-asteroids',
        quote:
          'Most asteroids are irregularly shaped, though a few are nearly round, and they are often pitted or cratered.',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_ASTEROIDS],
  },
  {
    id: 'kuiper-belt',
    hello: {
      key: 'cardKuiperBeltHello',
      sourceId: 'nasa-facts-kuiper',
      quote:
        'The Kuiper Belt is a large, doughnut-shaped region of icy bodies extending far beyond the orbit of Neptune.',
    },
    facts: [
      {
        key: 'cardKuiperBeltFact1',
        sourceId: 'nasa-facts-kuiper',
        quote: 'Its inner edge begins at the orbit of Neptune, at about 30 AU from the Sun.',
      },
      {
        key: 'cardKuiperBeltFact2',
        sourceId: 'nasa-facts-kuiper',
        quote: 'Astronomers think there are millions of small, icy objects in this region',
      },
      {
        key: 'cardKuiperBeltFact3',
        sourceId: 'nasa-facts-kuiper',
        quote: 'Some of the objects, including Pluto, are over 600 miles (1,000 kilometers) wide.',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_KUIPER],
  },
];
