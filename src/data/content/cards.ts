// Every sentence on a card is backed by a quote from a NASA page. A script checked that each
// quote appears in the page as fetched on the source's `retrieved` date, then wrote this file.
// The sentences themselves are in src/ui/strings/en.ts under each `key`.
import {
  NASA_HALLEY,
  NASA_HUBBLE_C6,
  NASA_HUBBLE_MIRA,
  NASA_WEBB_CARTWHEEL,
  ESA_ROSETTA,
  NASA_3D_MIR,
  NASA_APOLLO_SOYUZ,
  NASA_MIR_FIRST_MODULE,
  NASA_SHUTTLE_MIR,
  NASA_WEBB_OVERVIEW,
  NASA_HUBBLE_C34,
  NASA_HUBBLE_C60_61,
  NASA_HUBBLE_C63,
  NASA_HUBBLE_C77,
  NASA_HUBBLE_C92,
  NASA_HUBBLE_M16,
  NASA_HUBBLE_M57,
  NASA_HUBBLE_M81,
  NASA_HUBBLE_M82,
  NASA_WEBB_M82,
  NASA_HUBBLE_C80,
  NASA_HUBBLE_M13,
  NASA_HUBBLE_POLARIS,
  NASA_NSN_DENEB,
  NASA_NSN_LEO,
  NASA_NSN_SCORPIUS,
  ESA_HUBBLE_SIRIUS,
  NASA_51_PEGASI,
  NASA_APOD_HYADES,
  NASA_APOD_RIGEL,
  NASA_APOD_TAURUS,
  NASA_APOD_VEGA,
  NASA_NSN_GEMINI,
  NASA_NSN_VEGA,
  NASA_ORION_STORY,
  NASA_FACTS_ASTEROIDS,
  NASA_FACTS_COMETS,
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
  NASA_FIRST_BLACK_HOLE_IMAGE,
  NASA_HUBBLE_M1,
  NASA_HUBBLE_CASSIOPEIA,
  NASA_HUBBLE_M104,
  NASA_HUBBLE_NUMBERS,
  NASA_CASSINI_FACTS,
  NASA_APOLLO_KIDS,
  NASA_CURIOSITY,
  NASA_GEMINI_KIDS,
  NASA_NEW_HORIZONS,
  NASA_PIONEER_10,
  NASA_VOYAGER_1,
  NASA_CHANDRA_FACTS,
  NASA_ISS_FACTS,
  NASA_JUNO,
  NASA_MRO,
  NASA_PARKER,
  NASA_SATURN_V_KIDS,
  NASA_SLS_KIDS,
  NASA_ORION_KIDS,
  NASA_SHUTTLE_KIDS,
  NASA_SWIFT,
  NASA_HUBBLE_M31,
  NASA_HUBBLE_M33,
  NASA_HUBBLE_M51,
  NASA_HUBBLE_M42,
  NASA_HUBBLE_M45,
  NASA_HUBBLE_M87,
  NASA_APOD_SOUTHERN_CROSS,
  NASA_ASTERISMS,
  ESA_GAIA_BLACK_HOLES,
  ESA_HUBBLE_VY_CMA,
  ESO_SGR_A,
  ESO_ANTARES,
  NASA_BETELGEUSE,
  NASA_HUBBLE_VY_CMA,
  NASA_VY_CMA_DIMMING,
  NASA_CONSTELLATIONS,
  NASA_ORION_CONSTELLATION,
  NASA_IDA,
  NASA_METEORS,
  NASA_PSYCHE,
  NASA_HUBBLE_PROXIMA,
  NASA_MILKY_WAY,
  NASA_GALAXIES,
  CSA_CANADARM,
  NASA_VIKING_1,
  NASA_SPITZER,
  NASA_EUROPA_CLIPPER,
  NASA_KEPLER,
  NASA_DAWN_SPACECRAFT,
  NASA_DAWN,
  NASA_FRIENDSHIP_7,
  NASA_PERSEVERANCE,
  NASA_INGENUITY,
  NASA_BENNU,
  NASA_OSIRIS_REX,
  NASA_COSMIC_HISTORY,
  NASA_DARK_ENERGY,
  NASA_DARK_MATTER,
  NASA_BIGGEST_BLACK_HOLES,
  NASA_EXOPLANET_FACTS,
  NASA_GALAXY_TYPES,
  NASA_HUBBLE_NGC5264,
  ESA_HUBBLE_NGC4866,
  NASA_HUBBLE_NGC2865,
  NASA_HUBBLE_MARKARIAN_231,
  NASA_STAR_TYPES,
  NASA_TRAPPIST1,
  SI_COLUMBIA,
  SI_DISCOVERY,
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
        quote:
          'A coronal hole is a patch of the Sun’s atmosphere with much lower density than the surrounding areas. In ultraviolet views of the Sun, coronal holes appear as dark splotches.',
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
    id: 'ida',
    hello: {
      key: 'cardIdaHello',
      sourceId: 'nasa-ida',
      quote:
        'scientists studying the images Galileo sent back to Earth noticed that a tiny moon accompanied the asteroid',
    },
    facts: [
      {
        key: 'cardIdaFact1',
        sourceId: 'nasa-ida',
        quote: 'Located in the main belt between Mars and Jupiter',
      },
      {
        key: 'cardIdaFact2',
        sourceId: 'nasa-ida',
        quote:
          "NASA's Galileo spacecraft flew by Ida at a distance of about 1,500 miles (about 2,400 kilometers) en route to Jupiter.",
      },
      {
        key: 'cardIdaFact3',
        sourceId: 'nasa-meteors',
        quote:
          'When a meteoroid survives a trip through the atmosphere and hits the ground, it’s called a meteorite.',
      },
    ],
    moons: null,
    sources: [NASA_IDA, NASA_METEORS],
  },
  {
    id: 'psyche',
    hello: {
      key: 'cardPsycheHello',
      sourceId: 'nasa-psyche',
      quote:
        'The best analysis indicates that Psyche is likely made of a mixture of rock and metal, with metal composing 30% to 60% of its volume.',
    },
    facts: [
      {
        key: 'cardPsycheFact1',
        sourceId: 'nasa-psyche',
        quote: 'Psyche orbits the Sun between Mars and Jupiter',
      },
      {
        key: 'cardPsycheFact2',
        sourceId: 'nasa-psyche',
        quote: 'Psyche is likely made of a mixture of rock and metal',
      },
      {
        key: 'cardPsycheFact3',
        sourceId: 'nasa-psyche',
        quote:
          'Scientists think Psyche may consist of significant amounts of metal from the core of a planetesimal, one of the building blocks of our solar system.',
      },
    ],
    moons: null,
    sources: [NASA_PSYCHE],
  },
  {
    id: 'parker-solar-probe',
    hello: {
      key: 'cardParkerSolarProbeHello',
      sourceId: 'nasa-parker',
      quote:
        "Flying into the outermost part of the Sun's atmosphere, the corona, for the first time",
    },
    facts: [
      {
        key: 'cardParkerSolarProbeFact1',
        sourceId: 'nasa-parker',
        quote:
          'Parker Solar Probe hurtles around the Sun at approximately 430,000 mph (700,000 kph)',
      },
      {
        key: 'cardParkerSolarProbeFact2',
        sourceId: 'nasa-parker',
        quote:
          'carbon-composite shield, which can withstand temperatures reaching nearly 2,500 degrees Fahrenheit (1,377 Celsius)',
      },
      {
        key: 'cardParkerSolarProbeFact3',
        sourceId: 'nasa-parker',
        quote: 'Launch Aug. 12, 2018',
      },
    ],
    moons: null,
    sources: [NASA_PARKER],
  },
  {
    id: 'iss',
    hello: {
      key: 'cardIssHello',
      sourceId: 'nasa-iss-facts',
      quote:
        'An international crew of seven people live and work while traveling at a speed of five miles per second, orbiting Earth about every 90 minutes.',
    },
    facts: [
      {
        key: 'cardIssFact1',
        sourceId: 'nasa-iss-facts',
        quote: 'orbiting Earth about every 90 minutes',
      },
      {
        key: 'cardIssFact2',
        sourceId: 'nasa-iss-facts',
        quote:
          'In 24 hours, the space station makes 16 orbits of Earth, traveling through 16 sunrises and sunsets.',
      },
      {
        key: 'cardIssFact3',
        sourceId: 'nasa-iss-facts',
        quote: 'The space station has been continuously occupied since November 2000.',
      },
    ],
    moons: null,
    sources: [NASA_ISS_FACTS],
  },
  {
    id: 'hubble',
    hello: {
      key: 'cardHubbleHello',
      sourceId: 'nasa-hubble-numbers',
      quote:
        'The Hubble Space Telescope is in low-Earth orbit, making one revolution around Earth every 95 minutes.',
    },
    facts: [
      {
        key: 'cardHubbleFact1',
        sourceId: 'nasa-hubble-numbers',
        quote: 'making one revolution around Earth every 95 minutes',
      },
      {
        key: 'cardHubbleFact2',
        sourceId: 'nasa-hubble-numbers',
        quote: 'Hubble is the size of a large school bus and weighs 27,000 pounds (12,200 kg).',
      },
      {
        key: 'cardHubbleFact3',
        sourceId: 'nasa-hubble-numbers',
        quote: 'Astronauts serviced Hubble on five separate shuttle missions.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_NUMBERS],
  },
  {
    id: 'juno',
    hello: {
      key: 'cardJunoHello',
      sourceId: 'nasa-juno',
      quote:
        'Juno has provided breathtaking images and breakthrough discoveries from Jupiter and its moons',
    },
    facts: [
      {
        key: 'cardJunoFact1',
        sourceId: 'nasa-juno',
        quote: 'First solar-powered spacecraft operating at Jupiter.',
      },
      {
        key: 'cardJunoFact2',
        sourceId: 'nasa-juno',
        quote: 'give it an overall width exceeding 66 feet (20 meters)',
      },
      {
        key: 'cardJunoFact3',
        sourceId: 'nasa-juno',
        quote: 'From its very first orbit, stretching across 53 days',
      },
    ],
    moons: null,
    sources: [NASA_JUNO],
  },
  {
    id: 'mro',
    hello: {
      key: 'cardMroHello',
      sourceId: 'nasa-mro',
      quote: 'The instruments zoom in for extreme close-up photography of the Martian surface',
    },
    facts: [
      {
        key: 'cardMroFact1',
        sourceId: 'nasa-mro',
        quote: "NASA's Mars Reconnaissance Orbiter blasted off from Cape Canaveral in 2005",
      },
      {
        key: 'cardMroFact2',
        sourceId: 'nasa-mro',
        quote:
          'on a search for evidence that water persisted on the surface of Mars for long periods of time',
      },
      {
        key: 'cardMroFact3',
        sourceId: 'nasa-mro',
        quote: 'this camera can spot something as small as a dinner table',
      },
    ],
    moons: null,
    sources: [NASA_MRO],
  },
  {
    id: 'swift',
    hello: {
      key: 'cardSwiftHello',
      sourceId: 'nasa-swift',
      quote:
        'is a satellite that studies gamma-ray bursts, the most powerful explosions in the universe',
    },
    facts: [
      {
        key: 'cardSwiftFact1',
        sourceId: 'nasa-swift',
        quote: 'Swift houses three multiwavelength telescopes',
      },
      {
        key: 'cardSwiftFact2',
        sourceId: 'nasa-swift',
        quote: 'collecting data in visible, ultraviolet, X-ray, and gamma-ray light',
      },
      {
        key: 'cardSwiftFact3',
        sourceId: 'nasa-swift',
        quote: 'Launch Nov. 20, 2004',
      },
    ],
    moons: null,
    sources: [NASA_SWIFT],
  },
  {
    id: 'chandra',
    hello: {
      key: 'cardChandraHello',
      sourceId: 'nasa-chandra-facts',
      quote: 'Chandra allows scientists from around the world to obtain unprecedented X-ray images',
    },
    facts: [
      {
        key: 'cardChandraFact1',
        sourceId: 'nasa-chandra-facts',
        quote: 'Chandra travels almost one-third of the way to the Moon',
      },
      {
        key: 'cardChandraFact2',
        sourceId: 'nasa-chandra-facts',
        quote: 'It takes Chandra 64 hours to complete one full orbit',
      },
      {
        key: 'cardChandraFact3',
        sourceId: 'nasa-chandra-facts',
        quote: 'was carried into low-Earth orbit by the Space Shuttle Columbia on July 23, 1999',
      },
    ],
    moons: null,
    sources: [NASA_CHANDRA_FACTS],
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
  {
    id: 'halley',
    hello: {
      key: 'cardHalleyHello',
      sourceId: 'nasa-facts-comets',
      quote: 'The nucleus contains icy chunks, frozen gases with bits of embedded dust.',
    },
    facts: [
      {
        key: 'cardHalleyFact1',
        sourceId: 'nasa-halley',
        quote:
          "Halley was last seen in Earth's skies in 1986 and was met in space by an international fleet of spacecraft. It will return in 2061 on its regular 76-year journey around the Sun.",
      },
      {
        key: 'cardHalleyFact2',
        sourceId: 'nasa-halley',
        quote:
          'It has an albedo of 0.03, which means that it reflects only 3% of the light that falls on it.',
      },
      {
        key: 'cardHalleyFact3',
        sourceId: 'nasa-halley',
        quote:
          'In 1986, the European spacecraft Giotto became one of the first spacecraft to encounter and photograph the nucleus of a comet',
      },
    ],
    moons: null,
    sources: [NASA_FACTS_COMETS, NASA_HALLEY],
  },
  {
    id: 'pleiades',
    hello: {
      key: 'cardPleiadesHello',
      sourceId: 'nasa-hubble-m45',
      quote:
        'This bright open cluster of stars, more commonly called the Pleiades or Seven Sisters, is easy to see with the unaided eye.',
    },
    facts: [
      {
        key: 'cardPleiadesFact1',
        sourceId: 'nasa-hubble-m45',
        quote: 'It contains over a thousand stars that are loosely bound by gravity',
      },
      {
        key: 'cardPleiadesFact2',
        sourceId: 'nasa-hubble-m45',
        quote: 'more commonly called the Pleiades or Seven Sisters',
      },
      {
        key: 'cardPleiadesFact3',
        sourceId: 'nasa-hubble-m45',
        quote:
          'M45 is located roughly 445 light-years from Earth in the constellation Taurus, though this number is not universally agreed upon.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M45],
  },
  {
    id: 'orion-nebula',
    hello: {
      key: 'cardOrionNebulaHello',
      sourceId: 'nasa-hubble-m42',
      quote:
        'The nebula is an enormous cloud of dust and gas where vast numbers of new stars are being forged.',
    },
    facts: [
      {
        key: 'cardOrionNebulaFact1',
        sourceId: 'nasa-hubble-m42',
        quote:
          'You can spot Messier 42, better known as the Orion Nebula, with the unaided eye from a dark sky site.',
      },
      {
        key: 'cardOrionNebulaFact2',
        sourceId: 'nasa-hubble-m42',
        quote: 'making it the closest large star-forming region to Earth',
      },
      {
        key: 'cardOrionNebulaFact3',
        sourceId: 'nasa-hubble-m42',
        quote:
          'Its bright, central region is the home of four massive, young stars that shape the nebula.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M42],
  },
  {
    id: 'crab-nebula',
    hello: {
      key: 'cardCrabNebulaHello',
      sourceId: 'nasa-hubble-m1',
      quote: 'supernova explosion, which gave rise to the Crab Nebula',
    },
    facts: [
      {
        key: 'cardCrabNebulaFact1',
        sourceId: 'nasa-hubble-m1',
        quote:
          'In 1054, Chinese astronomers took notice of a "guest star" that was, for nearly a month, visible in the daytime sky.',
      },
      {
        key: 'cardCrabNebulaFact2',
        sourceId: 'nasa-hubble-m1',
        quote: 'a six-light-year-wide remnant',
      },
      {
        key: 'cardCrabNebulaFact3',
        sourceId: 'nasa-hubble-m1',
        quote:
          'A rapidly spinning neutron star (the ultra-dense core of the exploded star) is embedded in the center of the Crab Nebula.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M1],
  },
  {
    id: 'andromeda',
    hello: {
      key: 'cardAndromedaHello',
      sourceId: 'nasa-hubble-m31',
      quote:
        'M31, also well-known as the Andromeda Galaxy, is the nearest major galaxy to our own, the Milky Way.',
    },
    facts: [
      {
        key: 'cardAndromedaFact1',
        sourceId: 'nasa-hubble-m31',
        quote: 'It is easily visible with the unaided eye from a dark sky site.',
      },
      {
        key: 'cardAndromedaFact2',
        sourceId: 'nasa-hubble-m31',
        quote: 'This stunning, colorful mosaic captures the glow of 200 million stars.',
      },
      {
        key: 'cardAndromedaFact3',
        sourceId: 'nasa-hubble-m31',
        quote:
          'It took over 10 years to make this vast and colorful portrait of the galaxy, requiring over 600 Hubble overlapping snapshots',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M31],
  },
  {
    id: 'triangulum',
    hello: {
      key: 'cardTriangulumHello',
      sourceId: 'nasa-hubble-m33',
      quote: 'About half the size of our Milky Way galaxy',
    },
    facts: [
      {
        key: 'cardTriangulumFact1',
        sourceId: 'nasa-hubble-m33',
        quote: 'About 3 million light-years',
      },
      {
        key: 'cardTriangulumFact2',
        sourceId: 'nasa-hubble-m33',
        quote: 'M33 is the third-largest member of our Local Group of galaxies',
      },
      {
        key: 'cardTriangulumFact3',
        sourceId: 'nasa-hubble-m33',
        quote:
          'It resolves 25 million individual stars in a 14,000-light-year-wide region spanning the center of the galaxy.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M33],
  },
  {
    id: 'sombrero',
    hello: {
      key: 'cardSombreroHello',
      sourceId: 'nasa-hubble-m104',
      quote: 'is a spiral galaxy seen nearly edge-on',
    },
    facts: [
      {
        key: 'cardSombreroFact1',
        sourceId: 'nasa-hubble-m104',
        quote: 'M104 is located 28 million light-years away',
      },
      {
        key: 'cardSombreroFact2',
        sourceId: 'nasa-hubble-m104',
        quote: 'Looking like a broad-brimmed Mexican hat',
      },
      {
        key: 'cardSombreroFact3',
        sourceId: 'nasa-hubble-m104',
        quote: 'The center of M104 is thought to be home to a massive black hole.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M104],
  },
  {
    id: 'whirlpool',
    hello: {
      key: 'cardWhirlpoolHello',
      sourceId: 'nasa-hubble-m51',
      quote:
        'It highlights the attributes of a typical spiral galaxy, including graceful, curving arms',
    },
    facts: [
      {
        key: 'cardWhirlpoolFact1',
        sourceId: 'nasa-hubble-m51',
        quote: 'is a spiral galaxy located 31 million light-years away',
      },
      {
        key: 'cardWhirlpoolFact2',
        sourceId: 'nasa-hubble-m51',
        quote: 'they are star-formation factories',
      },
      {
        key: 'cardWhirlpoolFact3',
        sourceId: 'nasa-hubble-m51',
        quote:
          'The small galaxy has been gliding past the Whirlpool for hundreds of millions of years.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M51],
  },
  {
    id: 'm87',
    hello: {
      key: 'cardM87Hello',
      sourceId: 'nasa-hubble-m87',
      quote:
        'The elliptical galaxy M87 is the home of several trillion stars, a supermassive black hole and a family of roughly 15,000 globular star clusters.',
    },
    facts: [
      {
        key: 'cardM87Fact1',
        sourceId: 'nasa-hubble-m87',
        quote:
          'The elliptical galaxy M87 is the home of several trillion stars, a supermassive black hole',
      },
      {
        key: 'cardM87Fact2',
        sourceId: 'nasa-hubble-m87',
        quote: 'our Milky Way galaxy contains only a few hundred billion stars',
      },
      {
        key: 'cardM87Fact3',
        sourceId: 'nasa-hubble-m87',
        quote:
          'the energy released produces a stream of subatomic particles that are accelerated to velocities near the speed of light',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M87],
  },
  {
    id: 'betelgeuse',
    hello: {
      key: 'cardBetelgeuseHello',
      sourceId: 'nasa-betelgeuse',
      quote: 'one of the largest stars ever discovered',
    },
    facts: [
      {
        key: 'cardBetelgeuseFact1',
        sourceId: 'nasa-betelgeuse',
        quote: 'about 700 times the size of the Sun',
      },
      {
        key: 'cardBetelgeuseFact2',
        sourceId: 'nasa-betelgeuse',
        quote: "cooler than our Sun's roughly 10,000-degree Fahrenheit",
      },
      {
        key: 'cardBetelgeuseFact3',
        sourceId: 'nasa-betelgeuse',
        quote: 'Betelgeuse is around 700 light-years away',
      },
    ],
    moons: null,
    sources: [NASA_BETELGEUSE],
  },
  {
    id: 'proxima-centauri',
    hello: {
      key: 'cardProximaCentauriHello',
      sourceId: 'nasa-hubble-proxima',
      quote: 'our closest stellar neighbor: Proxima Centauri',
    },
    facts: [
      {
        key: 'cardProximaCentauriFact1',
        sourceId: 'nasa-exoplanet-facts',
        quote: 'At only four light-years away, Proxima b is our closest known exoplanet neighbor.',
      },
      {
        key: 'cardProximaCentauriFact2',
        sourceId: 'nasa-hubble-proxima',
        quote: 'Proxima Centauri is not visible to the naked eye',
      },
      {
        key: 'cardProximaCentauriFact3',
        sourceId: 'nasa-star-types',
        quote:
          'Red dwarfs are the smallest main sequence stars – just a fraction of the Sun’s size and mass. They’re also the coolest',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_PROXIMA, NASA_STAR_TYPES, NASA_EXOPLANET_FACTS],
  },
  {
    id: 'trappist-1',
    hello: {
      key: 'cardTrappist1Hello',
      sourceId: 'nasa-trappist-1',
      quote: 'the seven rocky exoplanets orbiting the TRAPPIST-1 star',
    },
    facts: [
      {
        key: 'cardTrappist1Fact1',
        sourceId: 'nasa-trappist-1',
        quote: 'lies about 40 light-years away',
      },
      {
        key: 'cardTrappist1Fact2',
        sourceId: 'nasa-trappist-1',
        quote: 'all of them with the potential for water on their surface',
      },
      {
        key: 'cardTrappist1Fact3',
        sourceId: 'nasa-trappist-1',
        quote: "This artist's concept shows what the TRAPPIST-1 planetary system may look like",
      },
    ],
    moons: null,
    sources: [NASA_TRAPPIST1],
  },
  {
    id: 'milky-way',
    hello: {
      key: 'cardMilkyWayHello',
      sourceId: 'nasa-milky-way',
      quote: 'Our Sun lies near a small, partial arm called the Orion Arm, or Orion Spur',
    },
    facts: [
      {
        key: 'cardMilkyWayFact1',
        sourceId: 'nasa-milky-way',
        quote:
          "the Milky Way's elegant spiral structure is dominated by just two arms wrapping off the ends of a central bar of stars",
      },
      {
        key: 'cardMilkyWayFact2',
        sourceId: 'nasa-milky-way',
        quote: 'Our Sun lies near a small, partial arm called the Orion Arm, or Orion Spur',
      },
      {
        key: 'cardMilkyWayFact3',
        sourceId: 'nasa-galaxies',
        quote:
          'It’s a spiral galaxy with a disk of stars spanning more than 100,000 light-years. Earth is located along one of the galaxy’s spiral arms, about halfway from the center. Our solar system takes about 240 million years to orbit the Milky Way just once.',
      },
    ],
    moons: null,
    sources: [NASA_MILKY_WAY, NASA_GALAXIES],
  },
  {
    id: 'm87-black-hole',
    hello: {
      key: 'cardM87BlackHoleHello',
      sourceId: 'nasa-first-black-hole-image',
      quote: 'This is the first picture of a black hole.',
    },
    facts: [
      {
        key: 'cardM87BlackHoleFact1',
        sourceId: 'nasa-first-black-hole-image',
        quote:
          'located in the center of the elliptical galaxy M87, located about 55 million light years from Earth',
      },
      {
        key: 'cardM87BlackHoleFact2',
        sourceId: 'nasa-first-black-hole-image',
        quote: 'The black hole is outlined by emission from hot gas swirling around it',
      },
      {
        key: 'cardM87BlackHoleFact3',
        sourceId: 'nasa-biggest-black-holes',
        quote:
          'M87’s black hole, now with a updated mass of 5.4 billion Suns. Its shadow is so big that even a beam of light – traveling at 670 million mph (1 billion kph) – would take about two and a half days to cross it.',
      },
    ],
    moons: null,
    sources: [NASA_FIRST_BLACK_HOLE_IMAGE, NASA_BIGGEST_BLACK_HOLES],
  },
  {
    id: 'orion',
    hello: {
      key: 'cardOrionHello',
      sourceId: 'nasa-orion-constellation',
      quote:
        'the ancient Greeks thought that an arrangement of stars in the sky looked like a giant hunter with a sword attached to his belt',
    },
    facts: [
      {
        key: 'cardOrionFact1',
        sourceId: 'nasa-orion-constellation',
        quote: 'look for three bright stars close together in an almost-straight line',
      },
      {
        key: 'cardOrionFact2',
        sourceId: 'nasa-orion-constellation',
        quote: 'stand out as the brightest members in the constellation',
      },
      {
        key: 'cardOrionFact3',
        sourceId: 'nasa-orion-constellation',
        quote: 'Alnilam, the star in the middle of the belt, is about 1,300 light-years away.',
      },
    ],
    moons: null,
    sources: [NASA_ORION_CONSTELLATION],
  },
  {
    id: 'big-dipper',
    hello: {
      key: 'cardBigDipperHello',
      sourceId: 'nasa-constellations',
      quote: 'If you trace a line between the stars, it looks like a ladle, or dipper',
    },
    facts: [
      {
        key: 'cardBigDipperFact1',
        sourceId: 'nasa-asterisms',
        quote: 'Its stars are part of the constellation Ursa Major, the Great Bear.',
      },
      {
        key: 'cardBigDipperFact2',
        sourceId: 'nasa-asterisms',
        quote: 'The Big Dipper is also known as the Plow (or Plough, in the United Kingdom).',
      },
      {
        key: 'cardBigDipperFact3',
        sourceId: 'nasa-asterisms',
        quote:
          'located very close to each other in the northern sky, and are generally easy to observe',
      },
    ],
    moons: null,
    sources: [NASA_ASTERISMS, NASA_CONSTELLATIONS],
  },
  {
    id: 'southern-cross',
    hello: {
      key: 'cardSouthernCrossHello',
      sourceId: 'nasa-apod-southern-cross',
      quote: 'the four bright stars that mark the Southern Cross',
    },
    facts: [
      {
        key: 'cardSouthernCrossFact1',
        sourceId: 'nasa-apod-southern-cross',
        quote: "This famous constellation is best seen from Earth's Southern Hemisphere.",
      },
      {
        key: 'cardSouthernCrossFact2',
        sourceId: 'nasa-apod-southern-cross',
        quote: 'it is depicted on the national flags of',
      },
      {
        key: 'cardSouthernCrossFact3',
        sourceId: 'nasa-apod-southern-cross',
        quote: 'is the orange star',
      },
    ],
    moons: null,
    sources: [NASA_APOD_SOUTHERN_CROSS],
  },
  {
    id: 'cassiopeia',
    hello: {
      key: 'cardCassiopeiaHello',
      sourceId: 'nasa-hubble-cassiopeia',
      quote: 'Its distinctive "W" asterism',
    },
    facts: [
      {
        key: 'cardCassiopeiaFact1',
        sourceId: 'nasa-hubble-cassiopeia',
        quote: "which forms the queen's throne",
      },
      {
        key: 'cardCassiopeiaFact2',
        sourceId: 'nasa-hubble-cassiopeia',
        quote:
          'The constellation Cassiopeia is visible every clear night from mid-northern and higher latitudes.',
      },
      {
        key: 'cardCassiopeiaFact3',
        sourceId: 'nasa-hubble-cassiopeia',
        quote: 'is best seen high in the sky on autumn and winter evenings',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_CASSIOPEIA],
  },
  {
    id: 'antares',
    hello: {
      key: 'cardAntaresHello',
      sourceId: 'eso-antares',
      quote:
        'the famous, bright star Antares shines with a strong red tint in the heart of the constellation of Scorpius (The Scorpion)',
    },
    facts: [
      {
        key: 'cardAntaresFact1',
        sourceId: 'eso-antares',
        quote: 'a diameter about 700 times larger than the Sun',
      },
      {
        key: 'cardAntaresFact2',
        sourceId: 'eso-antares',
        quote:
          'It is a huge and comparatively cool red supergiant star in the late stages of its life',
      },
      {
        key: 'cardAntaresFact3',
        sourceId: 'eso-antares',
        quote:
          'This is the most detailed image ever of this object, or any other star apart from the Sun.',
      },
    ],
    moons: null,
    sources: [ESO_ANTARES],
  },
  {
    id: 'vy-canis-majoris',
    hello: {
      key: 'cardVyCanisMajorisHello',
      sourceId: 'esa-hubble-vy-cma',
      quote:
        'VY Canis Majoris is one of the largest known stars in the Universe in respect of size.',
    },
    facts: [
      {
        key: 'cardVyCanisMajorisFact1',
        sourceId: 'esa-hubble-vy-cma',
        quote: 'The diameter of this red hypergiant is about 1400 times larger than the Sun.',
      },
      {
        key: 'cardVyCanisMajorisFact2',
        sourceId: 'nasa-hubble-vy-cma',
        quote: 'Approximately 5,000 light-years',
      },
      {
        key: 'cardVyCanisMajorisFact3',
        sourceId: 'nasa-vy-cma-dimming',
        quote: 'the huge nebula of material cast off by the hypergiant star VY Canis Majoris',
      },
    ],
    moons: null,
    sources: [ESA_HUBBLE_VY_CMA, NASA_HUBBLE_VY_CMA, NASA_VY_CMA_DIMMING],
  },
  {
    id: 'space-shuttle',
    hello: {
      key: 'cardSpaceShuttleHello',
      sourceId: 'nasa-shuttle-kids',
      quote: 'It carried astronauts and cargo to and from Earth orbit.',
    },
    facts: [
      {
        key: 'cardSpaceShuttleFact1',
        sourceId: 'nasa-shuttle-kids',
        quote: 'The first space shuttle flight took place April 12, 1981.',
      },
      {
        key: 'cardSpaceShuttleFact2',
        sourceId: 'nasa-shuttle-kids',
        quote: 'During those 30 years, the space shuttle launched on 135 missions.',
      },
      {
        key: 'cardSpaceShuttleFact3',
        sourceId: 'nasa-shuttle-kids',
        quote: 'The orbiter landed like a glider.',
      },
    ],
    moons: null,
    sources: [NASA_SHUTTLE_KIDS],
  },
  {
    id: 'saturn-v',
    hello: {
      key: 'cardSaturnVHello',
      sourceId: 'nasa-saturn-v-kids',
      quote: 'The Saturn V was a rocket NASA built to send people to the moon.',
    },
    facts: [
      {
        key: 'cardSaturnVFact1',
        sourceId: 'nasa-saturn-v-kids',
        quote:
          'The Saturn V rocket was 111 meters (363 feet) tall, about the height of a 36-story-tall building',
      },
      {
        key: 'cardSaturnVFact2',
        sourceId: 'nasa-saturn-v-kids',
        quote: 'It was the most powerful rocket that had ever flown successfully.',
      },
      {
        key: 'cardSaturnVFact3',
        sourceId: 'nasa-saturn-v-kids',
        quote: 'The first Saturn V was launched in 1967.',
      },
    ],
    moons: null,
    sources: [NASA_SATURN_V_KIDS],
  },
  {
    id: 'cassini',
    hello: {
      key: 'cardCassiniHello',
      sourceId: 'nasa-cassini-facts',
      quote: 'Saturn arrival: July 1, 2004',
    },
    facts: [
      {
        key: 'cardCassiniFact1',
        sourceId: 'nasa-cassini-facts',
        quote: 'Launch: Oct. 15, 1997',
      },
      {
        key: 'cardCassiniFact2',
        sourceId: 'nasa-cassini-facts',
        quote: 'during its 20 year mission',
      },
      {
        key: 'cardCassiniFact3',
        sourceId: 'nasa-cassini-facts',
        quote: 'Huygens Probe: Titan Release Dec. 24, 2004; Titan Descent Jan. 14, 2005',
      },
    ],
    moons: null,
    sources: [NASA_CASSINI_FACTS],
  },
  {
    id: 'voyager',
    hello: {
      key: 'cardVoyagerHello',
      sourceId: 'nasa-voyager-1',
      quote: 'The twin spacecraft launched in 1977.',
    },
    facts: [
      {
        key: 'cardVoyagerFact1',
        sourceId: 'nasa-voyager-1',
        quote: 'Launched in 1977 to fly by Jupiter and Saturn',
      },
      {
        key: 'cardVoyagerFact2',
        sourceId: 'nasa-voyager-1',
        quote: 'Voyager 1 is the first human-made object to venture into interstellar space.',
      },
      {
        key: 'cardVoyagerFact3',
        sourceId: 'nasa-voyager-1',
        quote:
          'Each of the Voyagers contain a message to potential extraterrestrials in the form of a 30-centimeter diameter gold-plated copper disc.',
      },
    ],
    moons: null,
    sources: [NASA_VOYAGER_1],
  },
  {
    id: 'sls',
    hello: {
      key: 'cardSlsHello',
      sourceId: 'nasa-sls-kids',
      quote:
        'SLS is a super heavy-lift rocket. That means it has the power to carry heavy loads into space.',
    },
    facts: [
      {
        key: 'cardSlsFact1',
        sourceId: 'nasa-sls-kids',
        quote:
          'The core stage: This is the large orange tank that makes up most of the rocket. It contains liquid propellants that power the engines.',
      },
      {
        key: 'cardSlsFact2',
        sourceId: 'nasa-sls-kids',
        quote:
          'Solid rocket boosters: Along with the engines on the core stage, the two white solid rocket boosters provide the initial thrust to push SLS away from Earth’s gravity.',
      },
      {
        key: 'cardSlsFact3',
        sourceId: 'nasa-sls-kids',
        quote:
          'The first SLS mission was called Artemis I. It launched Nov. 16, 2022. Artemis I was a lunar flight test that did not carry astronauts.',
      },
    ],
    moons: null,
    sources: [NASA_SLS_KIDS],
  },
  {
    id: 'orion-craft',
    hello: {
      key: 'cardOrionCraftHello',
      sourceId: 'nasa-orion-kids',
      quote: 'Orion will take astronauts farther than they have ever gone.',
    },
    facts: [
      {
        key: 'cardOrionCraftFact1',
        sourceId: 'nasa-orion-kids',
        quote:
          'The crew module is in the middle. This is the part where up to four astronauts can sit and live while they travel through space.',
      },
      {
        key: 'cardOrionCraftFact2',
        sourceId: 'nasa-orion-kids',
        quote:
          'Orion has solar panels that open like the letter X outside of the service module after it is safely in space. These panels absorb sunlight and turn it into electricity.',
      },
      {
        key: 'cardOrionCraftFact3',
        sourceId: 'nasa-orion-kids',
        quote: 'Orion will ride on top of the SLS.',
      },
    ],
    moons: null,
    sources: [NASA_ORION_KIDS],
  },
  {
    id: 'lunar-module',
    hello: {
      key: 'cardLunarModuleHello',
      sourceId: 'nasa-apollo-kids',
      quote: 'Another spacecraft, the Lunar Module, was used for landing on the moon.',
    },
    facts: [
      {
        key: 'cardLunarModuleFact1',
        sourceId: 'nasa-apollo-kids',
        quote: 'Two astronauts in the Lunar Module landed on the lunar surface.',
      },
      {
        key: 'cardLunarModuleFact2',
        sourceId: 'nasa-apollo-kids',
        quote: 'Six of the other seven flights landed on the moon.',
      },
      {
        key: 'cardLunarModuleFact3',
        sourceId: 'nasa-apollo-kids',
        quote: 'A total of 12 astronauts walked on the moon.',
      },
    ],
    moons: null,
    sources: [NASA_APOLLO_KIDS],
  },
  {
    id: 'gemini',
    hello: {
      key: 'cardGeminiHello',
      sourceId: 'nasa-gemini-kids',
      quote: 'Ten crews flew missions on the two-man Gemini spacecraft.',
    },
    facts: [
      {
        key: 'cardGeminiFact1',
        sourceId: 'nasa-gemini-kids',
        quote: 'The Gemini missions were flown in 1965 and 1966.',
      },
      {
        key: 'cardGeminiFact2',
        sourceId: 'nasa-gemini-kids',
        quote: 'NASA named the Gemini spacecraft and program after the constellation Gemini.',
      },
      {
        key: 'cardGeminiFact3',
        sourceId: 'nasa-gemini-kids',
        quote: 'The Gemini capsule flew on a Titan II rocket.',
      },
    ],
    moons: null,
    sources: [NASA_GEMINI_KIDS],
  },
  {
    id: 'pioneer-10',
    hello: {
      key: 'cardPioneer10Hello',
      sourceId: 'nasa-pioneer-10',
      quote: 'Originally designed for a 21-month mission to fly by Jupiter',
    },
    facts: [
      {
        key: 'cardPioneer10Fact1',
        sourceId: 'nasa-pioneer-10',
        quote: 'Pioneer 10 lasted more than 30 years',
      },
      {
        key: 'cardPioneer10Fact2',
        sourceId: 'nasa-pioneer-10',
        quote:
          'On July 15, 1972, the spacecraft entered the asteroid belt, emerging in February 1973',
      },
      {
        key: 'cardPioneer10Fact3',
        sourceId: 'nasa-pioneer-10',
        quote: 'Pioneer 10 was returning better images of the planet than possible from Earth',
      },
    ],
    moons: null,
    sources: [NASA_PIONEER_10],
  },
  {
    id: 'new-horizons',
    hello: {
      key: 'cardNewHorizonsHello',
      sourceId: 'nasa-new-horizons',
      quote: 'as it flew through the Pluto system on July 14, 2015',
    },
    facts: [
      {
        key: 'cardNewHorizonsFact1',
        sourceId: 'nasa-new-horizons',
        quote: 'July 14, 2015 : Pluto Flyby',
      },
      {
        key: 'cardNewHorizonsFact2',
        sourceId: 'nasa-new-horizons',
        quote:
          'reaching the Kuiper Belt object Arrokoth in 2019, the most distant object ever explored up close',
      },
      {
        key: 'cardNewHorizonsFact3',
        sourceId: 'nasa-new-horizons',
        quote: 'New Horizons passed 60 times as far from the Sun as Earth is',
      },
    ],
    moons: null,
    sources: [NASA_NEW_HORIZONS],
  },
  {
    id: 'curiosity',
    hello: {
      key: 'cardCuriosityHello',
      sourceId: 'nasa-curiosity',
      quote: 'The car-size rover is about as tall as a basketball player',
    },
    facts: [
      {
        key: 'cardCuriosityFact1',
        sourceId: 'nasa-curiosity',
        quote: 'The car-size rover',
      },
      {
        key: 'cardCuriosityFact2',
        sourceId: 'nasa-curiosity',
        quote: 'has been exploring Gale Crater since 2012',
      },
      {
        key: 'cardCuriosityFact3',
        sourceId: 'nasa-curiosity',
        quote: 'Curiosity is seeking evidence of organics, the chemical building blocks of life.',
      },
    ],
    moons: null,
    sources: [NASA_CURIOSITY],
  },
  {
    id: 'columbia',
    hello: {
      key: 'cardColumbiaHello',
      sourceId: 'si-columbia',
      quote:
        'carried astronauts Neil Armstrong, Edwin "Buzz" Aldrin and Michael Collins to the Moon and back on the first lunar landing mission in July, 1969',
    },
    facts: [
      {
        key: 'cardColumbiaFact1',
        sourceId: 'si-columbia',
        quote:
          'was the living quarters for the three-person crew during most of the first crewed lunar landing mission',
      },
      {
        key: 'cardColumbiaFact2',
        sourceId: 'si-columbia',
        quote: 'were launched from Cape Kennedy atop a Saturn V rocket',
      },
      {
        key: 'cardColumbiaFact3',
        sourceId: 'si-columbia',
        quote: 'The Command Module is the only portion of the spacecraft to return to Earth.',
      },
    ],
    moons: null,
    sources: [SI_COLUMBIA],
  },
  {
    id: 'discovery',
    hello: {
      key: 'cardDiscoveryHello',
      sourceId: 'si-discovery',
      quote: 'Discovery was flown on 39 Earth-orbital missions',
    },
    facts: [
      {
        key: 'cardDiscoveryFact1',
        sourceId: 'si-discovery',
        quote: 'It entered service in 1984',
      },
      {
        key: 'cardDiscoveryFact2',
        sourceId: 'si-discovery',
        quote:
          'Discovery was flown on 39 Earth-orbital missions, spent a total of 365 days in space',
      },
      {
        key: 'cardDiscoveryFact3',
        sourceId: 'si-discovery',
        quote: 'It shuttled 184 men and women into space and back',
      },
    ],
    moons: null,
    sources: [SI_DISCOVERY],
  },
  {
    id: 'sagittarius-a',
    hello: {
      key: 'cardSagittariusAHello',
      sourceId: 'eso-sgr-a',
      quote: 'the massive object that sits at the very centre of our galaxy',
    },
    facts: [
      {
        key: 'cardSagittariusAFact1',
        sourceId: 'eso-sgr-a',
        quote: 'which is four million times more massive than our Sun',
      },
      {
        key: 'cardSagittariusAFact2',
        sourceId: 'eso-sgr-a',
        quote: 'the black hole is about 27 000 light-years away from Earth',
      },
      {
        key: 'cardSagittariusAFact3',
        sourceId: 'eso-sgr-a',
        quote: 'it appears to us to have about the same size in the sky as a doughnut on the Moon',
      },
    ],
    moons: null,
    sources: [ESO_SGR_A],
  },
  {
    id: 'gaia-bh1',
    hello: {
      key: 'cardGaiaBh1Hello',
      sourceId: 'esa-gaia-black-holes',
      quote:
        'astronomers have discovered not only the closest but also the second closest black hole to Earth',
    },
    facts: [
      {
        key: 'cardGaiaBh1Fact1',
        sourceId: 'esa-gaia-black-holes',
        quote: 'located just 1560 light-years away from us',
      },
      {
        key: 'cardGaiaBh1Fact2',
        sourceId: 'esa-gaia-black-holes',
        quote: 'the objects are approximately ten times more massive than our Sun',
      },
      {
        key: 'cardGaiaBh1Fact3',
        sourceId: 'esa-gaia-black-holes',
        quote:
          'The two black holes were discovered by studying the movement of their companion stars.',
      },
    ],
    moons: null,
    sources: [ESA_GAIA_BLACK_HOLES],
  },
  {
    id: 'rigel',
    hello: {
      key: 'cardRigelHello',
      sourceId: 'nasa-apod-rigel',
      quote: 'Brilliant, blue, supergiant star Rigel marks the foot of Orion the Hunter',
    },
    facts: [
      {
        key: 'cardRigelFact1',
        sourceId: 'nasa-apod-rigel',
        quote: 'extends to about 74 times the solar radius',
      },
      {
        key: 'cardRigelFact2',
        sourceId: 'nasa-orion-story',
        quote:
          'Its surface is thousands of degrees hotter than Betelgeuse, though, making it shine blue-white rather than red.',
      },
      {
        key: 'cardRigelFact3',
        sourceId: 'nasa-apod-rigel',
        quote: 'Some 860 light-years away',
      },
    ],
    moons: null,
    sources: [NASA_APOD_RIGEL, NASA_ORION_STORY],
  },
  {
    id: 'sirius',
    hello: {
      key: 'cardSiriusHello',
      sourceId: 'esa-hubble-sirius',
      quote:
        'the nearest white-dwarf star is buried in the glow of the brightest star in the nighttime sky',
    },
    facts: [
      {
        key: 'cardSiriusFact1',
        sourceId: 'esa-hubble-sirius',
        quote:
          'Sirius itself has a mass of two times that of the Sun and a diameter of 2.4 million kilometres.',
      },
      {
        key: 'cardSiriusFact2',
        sourceId: 'esa-hubble-sirius',
        quote: 'Sirius itself has a surface temperature of 10,000 degrees C.',
      },
      {
        key: 'cardSiriusFact3',
        sourceId: 'esa-hubble-sirius',
        quote: 'At 8.6 light-years away, Sirius is one of the nearest known stars to Earth.',
      },
    ],
    moons: null,
    sources: [ESA_HUBBLE_SIRIUS],
  },
  {
    id: 'sirius-b',
    hello: {
      key: 'cardSiriusBHello',
      sourceId: 'esa-hubble-sirius',
      quote: 'the nearest white dwarf, Sirius B, companion of the brightest star in the sky',
    },
    facts: [
      {
        key: 'cardSiriusBFact1',
        sourceId: 'esa-hubble-sirius',
        quote: 'Sirius B has a diameter of 12,000 kilometres, less than the size of Earth',
      },
      {
        key: 'cardSiriusBFact2',
        sourceId: 'esa-hubble-sirius',
        quote: 'despite being smaller than the Earth, has a mass that is 98% that of our own Sun',
      },
      {
        key: 'cardSiriusBFact3',
        sourceId: 'esa-hubble-sirius',
        quote: 'White dwarfs are the leftover remnants of stars similar to our Sun.',
      },
    ],
    moons: null,
    sources: [ESA_HUBBLE_SIRIUS],
  },
  {
    id: 'vega',
    hello: {
      key: 'cardVegaHello',
      sourceId: 'nasa-nsn-vega',
      quote: 'Vega is the brightest star in the small Greek constellation of Lyra, the harp.',
    },
    facts: [
      {
        key: 'cardVegaFact1',
        sourceId: 'nasa-apod-vega',
        quote: 'has a diameter almost three times that of our Sun',
      },
      {
        key: 'cardVegaFact2',
        sourceId: 'nasa-nsn-vega',
        quote: 'making Vega one of the easiest stars to find for novice stargazers',
      },
      {
        key: 'cardVegaFact3',
        sourceId: 'nasa-nsn-vega',
        quote:
          'Ancient humans from 14,000 years ago likely knew Vega for another reason: it was the Earth’s northern pole star!',
      },
    ],
    moons: null,
    sources: [NASA_APOD_VEGA, NASA_NSN_VEGA],
  },
  {
    id: 'pollux',
    hello: {
      key: 'cardPolluxHello',
      sourceId: 'nasa-nsn-gemini',
      quote: 'Pollux is the brighter of Gemini’s two “head” stars',
    },
    facts: [
      {
        key: 'cardPolluxFact1',
        sourceId: 'nasa-nsn-gemini',
        quote: 'is located about 34 light-years away from our Solar System',
      },
      {
        key: 'cardPolluxFact2',
        sourceId: 'nasa-nsn-gemini',
        quote: 'Pollux even possesses a planet, Pollux b, with a mass over twice that of Jupiter.',
      },
      {
        key: 'cardPolluxFact3',
        sourceId: 'nasa-nsn-gemini',
        quote:
          'Keep going, and you will end up between the bright stars Castor and Pollux, the “heads” of the Gemini Twins.',
      },
    ],
    moons: null,
    sources: [NASA_NSN_GEMINI],
  },
  {
    id: '51-pegasi',
    hello: {
      key: 'card51PegasiHello',
      sourceId: 'nasa-51-pegasi',
      quote: 'the first detection of a planet orbiting a star like our Sun',
    },
    facts: [
      {
        key: 'card51PegasiFact1',
        sourceId: 'nasa-51-pegasi',
        quote: 'was the first exoplanet discovered orbiting a Sun-like star in 1995',
      },
      {
        key: 'card51PegasiFact2',
        sourceId: 'nasa-51-pegasi',
        quote: 'takes only four days to complete one orbit',
      },
      {
        key: 'card51PegasiFact3',
        sourceId: 'nasa-51-pegasi',
        quote: "It's 51 light-years from Earth.",
      },
    ],
    moons: null,
    sources: [NASA_51_PEGASI],
  },
  {
    id: 'aldebaran',
    hello: {
      key: 'cardAldebaranHello',
      sourceId: 'nasa-apod-taurus',
      quote: 'considered to be the eye of the Bull',
    },
    facts: [
      {
        key: 'cardAldebaranFact1',
        sourceId: 'nasa-apod-taurus',
        quote: 'the brightest star in Taurus and the 15th brightest star in the sky',
      },
      {
        key: 'cardAldebaranFact2',
        sourceId: 'nasa-apod-hyades',
        quote: 'at 65 light-years away, is now known to be unrelated to the Hyades cluster',
      },
      {
        key: 'cardAldebaranFact3',
        sourceId: 'nasa-apod-hyades',
        quote: 'unrelated to the Hyades cluster, which lies about 150 light-years away',
      },
    ],
    moons: null,
    sources: [NASA_APOD_HYADES, NASA_APOD_TAURUS],
  },
  {
    id: 'scorpius',
    hello: {
      key: 'cardScorpiusHello',
      sourceId: 'nasa-nsn-scorpius',
      quote:
        'a familiar constellation rises with the galactic core of the Milky Way each evening: Scorpius the Scorpion',
    },
    facts: [
      {
        key: 'cardScorpiusFact1',
        sourceId: 'nasa-nsn-scorpius',
        quote:
          'referred to as “the heart of the scorpion,” this supergiant has a distinct reddish hue and is visible to the naked eye',
      },
      {
        key: 'cardScorpiusFact2',
        sourceId: 'nasa-nsn-scorpius',
        quote: "several Polynesian cultures see the same stars as the demigod Māui's fishhook",
      },
      {
        key: 'cardScorpiusFact3',
        sourceId: 'nasa-nsn-scorpius',
        quote: 'On a clear night, can you trail the curve of the tail?',
      },
    ],
    moons: null,
    sources: [NASA_NSN_SCORPIUS],
  },
  {
    id: 'leo',
    hello: {
      key: 'cardLeoHello',
      sourceId: 'nasa-nsn-leo',
      quote: 'forms the constellation of Leo the Lion',
    },
    facts: [
      {
        key: 'cardLeoFact1',
        sourceId: 'nasa-nsn-leo',
        quote: 'Leo’s distinctive forward sickle, or “reverse question mark,” is easy to spot',
      },
      {
        key: 'cardLeoFact2',
        sourceId: 'nasa-nsn-leo',
        quote: 'the bright star Regulus, the “period” in the reverse question mark',
      },
      {
        key: 'cardLeoFact3',
        sourceId: 'nasa-nsn-leo',
        quote:
          'the forward-facing sickle being the lion’s head and mane, and the rear triangle its hindquarters',
      },
    ],
    moons: null,
    sources: [NASA_NSN_LEO],
  },
  {
    id: 'cygnus',
    hello: {
      key: 'cardCygnusHello',
      sourceId: 'nasa-nsn-deneb',
      quote: 'Bird constellations abound in the night sky, including Cygnus, the majestic swan.',
    },
    facts: [
      {
        key: 'cardCygnusFact1',
        sourceId: 'nasa-nsn-deneb',
        quote: 'you may only see the brightest stars, sometimes called the Northern Cross',
      },
      {
        key: 'cardCygnusFact2',
        sourceId: 'nasa-nsn-deneb',
        quote: 'is an Arabic word meaning the tail',
      },
      {
        key: 'cardCygnusFact3',
        sourceId: 'nasa-nsn-deneb',
        quote:
          'While the bright beak star Albireo is easy to pick out, a telescope will let its true beauty shine!',
      },
    ],
    moons: null,
    sources: [NASA_NSN_DENEB],
  },
  {
    id: 'gemini-twins',
    hello: {
      key: 'cardGeminiTwinsHello',
      sourceId: 'nasa-nsn-gemini',
      quote: 'the bright stars Castor and Pollux, the “heads” of the Gemini Twins',
    },
    facts: [
      {
        key: 'cardGeminiTwinsFact1',
        sourceId: 'nasa-nsn-gemini',
        quote: 'Pollux is the brighter of Gemini’s two “head” stars',
      },
      {
        key: 'cardGeminiTwinsFact2',
        sourceId: 'nasa-nsn-gemini',
        quote: 'Castor is actually a six-star system',
      },
      {
        key: 'cardGeminiTwinsFact3',
        sourceId: 'nasa-nsn-gemini',
        quote: 'just look above Orion’s “head” to see Gemini’s “feet.”',
      },
    ],
    moons: null,
    sources: [NASA_NSN_GEMINI],
  },
  {
    id: 'little-dipper',
    hello: {
      key: 'cardLittleDipperHello',
      sourceId: 'nasa-asterisms',
      quote: 'The Little Dipper is part of the constellation Ursa Minor, the little bear.',
    },
    facts: [
      {
        key: 'cardLittleDipperFact1',
        sourceId: 'nasa-hubble-polaris',
        quote:
          "Polaris's location very close to the position of Earth's north celestial pole in Ursa Minor",
      },
      {
        key: 'cardLittleDipperFact2',
        sourceId: 'nasa-hubble-polaris',
        quote: 'a steady, solitary point of light that guided sailors in ages past',
      },
      {
        key: 'cardLittleDipperFact3',
        sourceId: 'nasa-hubble-polaris',
        quote: 'The North Star is actually a triple star system.',
      },
    ],
    moons: null,
    sources: [NASA_ASTERISMS, NASA_HUBBLE_POLARIS],
  },
  {
    id: 'hercules-cluster',
    hello: {
      key: 'cardHerculesClusterHello',
      sourceId: 'nasa-hubble-m13',
      quote: 'over 100,000 stars whirl within the globular cluster M13',
    },
    facts: [
      {
        key: 'cardHerculesClusterFact1',
        sourceId: 'nasa-hubble-m13',
        quote: 'Located 25,000 light-years from Earth',
      },
      {
        key: 'cardHerculesClusterFact2',
        sourceId: 'nasa-hubble-m13',
        quote: 'can be spotted with a pair of binoculars most easily in July',
      },
      {
        key: 'cardHerculesClusterFact3',
        sourceId: 'nasa-hubble-m13',
        quote:
          'These stars are so crowded that they can, at times, run into each other and even form a new star.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M13],
  },
  {
    id: 'omega-centauri',
    hello: {
      key: 'cardOmegaCentauriHello',
      sourceId: 'nasa-hubble-c80',
      quote: 'the biggest and brightest ball of stars in our galaxy',
    },
    facts: [
      {
        key: 'cardOmegaCentauriFact1',
        sourceId: 'nasa-hubble-c80',
        quote: 'is home to around 10 million stars',
      },
      {
        key: 'cardOmegaCentauriFact2',
        sourceId: 'nasa-hubble-c80',
        quote:
          'Located about 17,000 light-years away from Earth toward the Centaurus constellation, the cluster has a diameter of about 450 light-years.',
      },
      {
        key: 'cardOmegaCentauriFact3',
        sourceId: 'nasa-hubble-c80',
        quote: 'It’s so bright that it can easily be seen with the unaided eye',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C80],
  },
  {
    id: 'bodes-galaxy',
    hello: {
      key: 'cardBodesGalaxyHello',
      sourceId: 'nasa-hubble-m81',
      quote: 'M81 is one of the brightest galaxies in the night sky',
    },
    facts: [
      {
        key: 'cardBodesGalaxyFact1',
        sourceId: 'nasa-hubble-m81',
        quote: 'It is located 11.6 million light-years from Earth',
      },
      {
        key: 'cardBodesGalaxyFact2',
        sourceId: 'nasa-hubble-m81',
        quote: 'A black hole of 70 million solar masses resides at the center of M81',
      },
      {
        key: 'cardBodesGalaxyFact3',
        sourceId: 'nasa-hubble-m81',
        quote: 'Through a pair of binoculars, the galaxy appears as a faint patch of light',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M81],
  },
  {
    id: 'cigar-galaxy',
    hello: {
      key: 'cardCigarGalaxyHello',
      sourceId: 'nasa-webb-m82',
      quote: 'edge-on starburst galaxy Messier 82',
    },
    facts: [
      {
        key: 'cardCigarGalaxyFact1',
        sourceId: 'nasa-hubble-m82',
        quote: 'Located 12 million light-years from Earth',
      },
      {
        key: 'cardCigarGalaxyFact2',
        sourceId: 'nasa-hubble-m82',
        quote:
          'young stars are being born 10 times faster than they are inside our entire Milky Way galaxy',
      },
      {
        key: 'cardCigarGalaxyFact3',
        sourceId: 'nasa-hubble-m82',
        quote:
          'The Cigar galaxy experiences gravitational interactions with its galactic neighbor, M81, causing it to have an extraordinarily high rate of star formation',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M82, NASA_WEBB_M82],
  },
  {
    id: 'centaurus-a',
    hello: {
      key: 'cardCentaurusAHello',
      sourceId: 'nasa-hubble-c77',
      quote: 'with its prominent, dark dust lane crossing the center',
    },
    facts: [
      {
        key: 'cardCentaurusAFact1',
        sourceId: 'nasa-hubble-c77',
        quote:
          'Centaurus A is apparently the result of a collision between two otherwise normal galaxies',
      },
      {
        key: 'cardCentaurusAFact2',
        sourceId: 'nasa-hubble-c77',
        quote: 'about 11 million light-years away',
      },
      {
        key: 'cardCentaurusAFact3',
        sourceId: 'nasa-hubble-c77',
        quote:
          'leftover cosmic debris is steadily being consumed by a central supermassive black hole',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C77],
  },
  {
    id: 'antennae',
    hello: {
      key: 'cardAntennaeHello',
      sourceId: 'nasa-hubble-c60-61',
      quote: 'Caldwell 60 and 61 are a pair of interacting spiral galaxies',
    },
    facts: [
      {
        key: 'cardAntennaeFact1',
        sourceId: 'nasa-hubble-c60-61',
        quote: 'They are located about 65 million light-years away in the Corvus constellation',
      },
      {
        key: 'cardAntennaeFact2',
        sourceId: 'nasa-hubble-c60-61',
        quote:
          'long streamers of stars extending outward into space like a set of antennae, giving the duo their common nickname',
      },
      {
        key: 'cardAntennaeFact3',
        sourceId: 'nasa-hubble-c60-61',
        quote: 'the once-separate galaxies will merge into one large elliptical galaxy',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C60_61],
  },
  {
    id: 'eagle-nebula',
    hello: {
      key: 'cardEagleNebulaHello',
      sourceId: 'nasa-hubble-m16',
      quote:
        'are part of an active star-forming region within the nebula and hide newborn stars in their wispy columns',
    },
    facts: [
      {
        key: 'cardEagleNebulaFact1',
        sourceId: 'nasa-hubble-m16',
        quote: 'The aptly named Pillars of Creation, featured in this stunning Hubble image',
      },
      {
        key: 'cardEagleNebulaFact2',
        sourceId: 'nasa-hubble-m16',
        quote: 'Stretching roughly 4 to 5 light-years tall',
      },
      {
        key: 'cardEagleNebulaFact3',
        sourceId: 'nasa-hubble-m16',
        quote: 'is located 7,000 light-years from Earth in the constellation Serpens',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M16],
  },
  {
    id: 'ring-nebula',
    hello: {
      key: 'cardRingNebulaHello',
      sourceId: 'nasa-hubble-m57',
      quote: 'to resolve its beautiful ring-like details',
    },
    facts: [
      {
        key: 'cardRingNebulaFact1',
        sourceId: 'nasa-hubble-m57',
        quote: 'is about 2,000 light-years away in the constellation Lyra',
      },
      {
        key: 'cardRingNebulaFact2',
        sourceId: 'nasa-hubble-m57',
        quote:
          'The blue gas in the nebula’s center is actually a football-shaped structure seen end-on',
      },
      {
        key: 'cardRingNebulaFact3',
        sourceId: 'nasa-hubble-m57',
        quote:
          'it requires a moderately-sized telescope to resolve its beautiful ring-like details',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_M57],
  },
  {
    id: 'helix-nebula',
    hello: {
      key: 'cardHelixNebulaHello',
      sourceId: 'nasa-hubble-c63',
      quote: 'A planetary nebula is the glowing gas around a dying, Sun-like star.',
    },
    facts: [
      {
        key: 'cardHelixNebulaFact1',
        sourceId: 'nasa-hubble-c63',
        quote:
          'At 650 light-years away, the Helix is one of the nearest planetary nebulae to Earth.',
      },
      {
        key: 'cardHelixNebulaFact2',
        sourceId: 'nasa-hubble-c63',
        quote: 'with its bright ring stretching across nearly three light-years',
      },
      {
        key: 'cardHelixNebulaFact3',
        sourceId: 'nasa-hubble-c63',
        quote: 'the Helix Nebula appears to be nearly half the width of the full moon',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C63],
  },
  {
    id: 'carina-nebula',
    hello: {
      key: 'cardCarinaNebulaHello',
      sourceId: 'nasa-hubble-c92',
      quote: 'this strange stellar nursery',
    },
    facts: [
      {
        key: 'cardCarinaNebulaFact1',
        sourceId: 'nasa-hubble-c92',
        quote:
          'The Carina Nebula lies within our own galaxy, approximately 7,500 light-years away.',
      },
      {
        key: 'cardCarinaNebulaFact2',
        sourceId: 'nasa-hubble-c92',
        quote:
          'Due to the nebula’s enormous size – about 300 light-years – astronomers can only study it in sections',
      },
      {
        key: 'cardCarinaNebulaFact3',
        sourceId: 'nasa-hubble-c92',
        quote: 'it is visible in the Carina constellation even with the naked eye',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C92],
  },
  {
    id: 'veil-nebula',
    hello: {
      key: 'cardVeilNebulaHello',
      sourceId: 'nasa-hubble-c34',
      quote:
        'The remains of a star — once 20 times as massive as the Sun — that exploded several thousand years ago',
    },
    facts: [
      {
        key: 'cardVeilNebulaFact1',
        sourceId: 'nasa-hubble-c34',
        quote: 'the Veil Nebula lies about 2,000 light-years away in the constellation Cygnus',
      },
      {
        key: 'cardVeilNebulaFact2',
        sourceId: 'nasa-hubble-c34',
        quote:
          'extending 110 light-years across and covering an area of sky six times larger than the full moon',
      },
      {
        key: 'cardVeilNebulaFact3',
        sourceId: 'nasa-hubble-c34',
        quote:
          'This Hubble image features a small fraction of the supernova remnant: the Veil Nebula.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C34],
  },
  {
    id: 'mir',
    hello: {
      key: 'cardMirHello',
      sourceId: 'nasa-3d-mir',
      quote:
        'The Russian Space Station Mir endured 15 years in orbit, three times its planned lifetime.',
    },
    facts: [
      {
        key: 'cardMirFact1',
        sourceId: 'nasa-mir-first-module',
        quote: '19, 1986, the Soviet Union launched the first module of the Mir space station',
      },
      {
        key: 'cardMirFact2',
        sourceId: 'nasa-shuttle-mir',
        quote: 'Mir hosted 125 cosmonauts and astronauts from 12 countries',
      },
      {
        key: 'cardMirFact3',
        sourceId: 'nasa-3d-mir',
        quote: 'It raised the first crop of wheat to be grown from seed to seed in outer space.',
      },
    ],
    moons: null,
    sources: [NASA_3D_MIR, NASA_MIR_FIRST_MODULE, NASA_SHUTTLE_MIR],
  },
  {
    id: 'apollo-soyuz',
    hello: {
      key: 'cardApolloSoyuzHello',
      sourceId: 'nasa-apollo-soyuz',
      quote:
        'brought together two former spaceflight rivals: the United States and the Soviet Union',
    },
    facts: [
      {
        key: 'cardApolloSoyuzFact1',
        sourceId: 'nasa-apollo-soyuz',
        quote:
          'On July 15, 1975, an Apollo spacecraft launched carrying a crew of three and docked two days later on July 17, with a Soyuz spacecraft and its crew of two.',
      },
      {
        key: 'cardApolloSoyuzFact2',
        sourceId: 'nasa-apollo-soyuz',
        quote:
          'For nearly two days, the two ships remained docked for joint activities and experiments.',
      },
      {
        key: 'cardApolloSoyuzFact3',
        sourceId: 'nasa-apollo-soyuz',
        quote:
          'The docking module was designed and constructed by NASA to serve as an airlock and transfer corridor between the two craft.',
      },
    ],
    moons: null,
    sources: [NASA_APOLLO_SOYUZ],
  },
  {
    id: 'rosetta',
    hello: {
      key: 'cardRosettaHello',
      sourceId: 'esa-rosetta',
      quote: 'Rosetta made the most detailed study of a comet ever attempted.',
    },
    facts: [
      {
        key: 'cardRosettaFact1',
        sourceId: 'esa-rosetta',
        quote:
          'Rosetta was the first mission ever to orbit a comet’s nucleus and land a probe on its surface.',
      },
      {
        key: 'cardRosettaFact2',
        sourceId: 'esa-rosetta',
        quote:
          'Rosetta launched on 2 March 2004 by an Ariane-5 G+ from Europe’s spaceport in Kourou, French Guiana.',
      },
      {
        key: 'cardRosettaFact3',
        sourceId: 'esa-rosetta',
        quote:
          'The main spacecraft measured 2.8 x 2.1 x 2.0 m with two 14 metre long solar panels.',
      },
    ],
    moons: null,
    sources: [ESA_ROSETTA],
  },
  {
    id: 'webb',
    hello: {
      key: 'cardWebbHello',
      sourceId: 'nasa-webb-overview',
      quote: 'Webb is the largest telescope ever placed in space.',
    },
    facts: [
      {
        key: 'cardWebbFact1',
        sourceId: 'nasa-webb-overview',
        quote:
          'Webb is an International Collaboration including NASA, the European Space Agency (ESA), and the Canadian Space Agency (CSA).',
      },
      {
        key: 'cardWebbFact2',
        sourceId: 'nasa-webb-overview',
        quote: 'Webb was launched on Dec 25, 2021 on from French Guiana on an Arianne 5 rocket.',
      },
      {
        key: 'cardWebbFact3',
        sourceId: 'nasa-webb-overview',
        quote:
          'Webb’s biggest feature is a tennis court sized five-layer sunshield that attenuates heat from the Sun more than a million times.',
      },
    ],
    moons: null,
    sources: [NASA_WEBB_OVERVIEW],
  },
  {
    id: 'mira',
    hello: {
      key: 'cardMiraHello',
      sourceId: 'nasa-hubble-mira',
      quote: 'has evolved into a cool red giant star that is highly variable in brightness',
    },
    facts: [
      {
        key: 'cardMiraFact1',
        sourceId: 'nasa-hubble-mira',
        quote: 'corresponding to a diameter some 700 times larger than our Sun',
      },
      {
        key: 'cardMiraFact2',
        sourceId: 'nasa-hubble-mira',
        quote: 'Contracting and expanding every 332 days',
      },
      {
        key: 'cardMiraFact3',
        sourceId: 'nasa-hubble-mira',
        quote: 'He called it Mira, meaning "The Wonderful."',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_MIRA],
  },
  {
    id: 'cats-eye-nebula',
    hello: {
      key: 'cardCatsEyeNebulaHello',
      sourceId: 'nasa-hubble-c6',
      quote: 'planetary nebulae reflect the very slow death of a Sun-like star',
    },
    facts: [
      {
        key: 'cardCatsEyeNebulaFact1',
        sourceId: 'nasa-hubble-c6',
        quote:
          'Located about 3,000 light-years away, Caldwell 6 is located in the constellation Draco',
      },
      {
        key: 'cardCatsEyeNebulaFact2',
        sourceId: 'nasa-hubble-c6',
        quote:
          "Each of the eleven or more concentric rings, or shells, around the Cat's Eye is actually the edge of a spherical bubble seen projected onto the sky",
      },
      {
        key: 'cardCatsEyeNebulaFact3',
        sourceId: 'nasa-hubble-c6',
        quote: 'material ejected in regular episodes 1,500 years apart',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_C6],
  },
  {
    id: 'cartwheel-galaxy',
    hello: {
      key: 'cardCartwheelGalaxyHello',
      sourceId: 'nasa-webb-cartwheel',
      quote: 'Its appearance, much like that of the wheel of a wagon',
    },
    facts: [
      {
        key: 'cardCartwheelGalaxyFact1',
        sourceId: 'nasa-webb-cartwheel',
        quote:
          'The Cartwheel Galaxy, located about 500 million light-years away in the Sculptor constellation, is a rare sight.',
      },
      {
        key: 'cardCartwheelGalaxyFact2',
        sourceId: 'nasa-webb-cartwheel',
        quote:
          'a high-speed collision between a large spiral galaxy and a smaller galaxy not visible in this image',
      },
      {
        key: 'cardCartwheelGalaxyFact3',
        sourceId: 'nasa-webb-cartwheel',
        quote:
          'These two rings expand outwards from the center of the collision, like ripples in a pond after a stone is tossed into it.',
      },
    ],
    moons: null,
    sources: [NASA_WEBB_CARTWHEEL],
  },
  {
    id: 'ngc-5264',
    hello: {
      key: 'cardNgc5264Hello',
      sourceId: 'nasa-hubble-ngc5264',
      quote:
        'NGC 5264 clearly possesses an irregular shape — unlike the more common spiral or elliptical galaxies — with knots of blue star formation.',
    },
    facts: [
      {
        key: 'cardNgc5264Fact1',
        sourceId: 'nasa-hubble-ngc5264',
        quote:
          'a dwarf galaxy located just over 15 million light-years away in the constellation of Hydra',
      },
      {
        key: 'cardNgc5264Fact2',
        sourceId: 'nasa-hubble-ngc5264',
        quote:
          'Dwarf galaxies like NGC 5264 typically possess around a billion stars — just 1 percent of the number of stars found within the Milky Way.',
      },
      {
        key: 'cardNgc5264Fact3',
        sourceId: 'nasa-hubble-ngc5264',
        quote:
          'Astronomers believe that this is due to the gravitational interactions between NGC 5264 and other galaxies nearby. These past flirtations sparked the formation of new generations of stars, which now glow in bright shades of blue.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_NGC5264],
  },
  {
    id: 'ngc-4866',
    hello: {
      key: 'cardNgc4866Hello',
      sourceId: 'nasa-galaxy-types',
      quote: 'They have the central bulge and disk common to spiral galaxies but no arms.',
    },
    facts: [
      {
        key: 'cardNgc4866Fact1',
        sourceId: 'esa-hubble-ngc4866',
        quote: 'a lenticular galaxy situated about 80 million light-years from Earth',
      },
      {
        key: 'cardNgc4866Fact2',
        sourceId: 'esa-hubble-ngc4866',
        quote: 'The galaxy is seen from Earth as almost edge-on',
      },
      {
        key: 'cardNgc4866Fact3',
        sourceId: 'esa-hubble-ngc4866',
        quote:
          'However, this star actually lies much closer to us; in front of the galaxy, along our line of sight.',
      },
    ],
    moons: null,
    sources: [ESA_HUBBLE_NGC4866, NASA_GALAXY_TYPES],
  },
  {
    id: 'ngc-2865',
    hello: {
      key: 'cardNgc2865Hello',
      sourceId: 'nasa-galaxy-types',
      quote: 'Elliptical galaxies have shapes that range from completely round to oval.',
    },
    facts: [
      {
        key: 'cardNgc2865Fact1',
        sourceId: 'nasa-hubble-ngc2865',
        quote:
          'It lies just over 100 million light-years away from us in the constellation of Hydra',
      },
      {
        key: 'cardNgc2865Fact2',
        sourceId: 'nasa-hubble-ngc2865',
        quote:
          'Elliptical galaxies are usually filled with old, dying stars. NGC 2865, however, is relatively youthful and dynamic, with a rapidly rotating disk full of young stars and metal-rich gas.',
      },
      {
        key: 'cardNgc2865Fact3',
        sourceId: 'nasa-hubble-ngc2865',
        quote:
          'The starburst itself was induced by a merger between a spiral galaxy, similar to our galaxy, the Milky Way, and an elliptical galaxy some three times more massive',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_NGC2865, NASA_GALAXY_TYPES],
  },
  {
    id: 'markarian-231',
    hello: {
      key: 'cardMarkarian231Hello',
      sourceId: 'nasa-hubble-markarian-231',
      quote:
        'reveals a bright starlike glow in the center of the interacting galaxy Markarian 231, the nearest quasar to Earth',
    },
    facts: [
      {
        key: 'cardMarkarian231Fact1',
        sourceId: 'nasa-hubble-markarian-231',
        quote: 'the nearest quasar to Earth. Located 581 million light-years away',
      },
      {
        key: 'cardMarkarian231Fact2',
        sourceId: 'nasa-hubble-markarian-231',
        quote:
          'Quasars are powered by a central black hole that heats the gas around it to unleash tremendous amounts of energy.',
      },
      {
        key: 'cardMarkarian231Fact3',
        sourceId: 'nasa-hubble-markarian-231',
        quote:
          'Hubble spectroscopic observations infer the presence of two supermassive black holes whirling around each other.',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_MARKARIAN_231],
  },
  {
    id: 'vela-pulsar',
    hello: {
      key: 'cardVelaPulsarHello',
      sourceId: 'nasa-star-types',
      quote: 'Pulsars: These are a type of rapidly rotating neutron star.',
    },
    facts: [
      {
        key: 'cardVelaPulsarFact1',
        sourceId: 'nasa-star-types',
        quote:
          'The Vela pulsar is located in the circular white dot in the center of this image captured by NASA’s Chandra X-ray Observatory. The pulsar resides over 1,000 light-years away in the southern constellation Vela.',
      },
      {
        key: 'cardVelaPulsarFact2',
        sourceId: 'nasa-star-types',
        quote:
          'Neutron stars are stellar remnants that pack more mass than the Sun into a sphere about as wide as New York City’s Manhattan Island is long.',
      },
      {
        key: 'cardVelaPulsarFact3',
        sourceId: 'nasa-star-types',
        quote:
          'Bright X-ray hot spots form on the surfaces of these objects. As they rotate, the spots spin in and out of view like the beams of a lighthouse.',
      },
    ],
    moons: null,
    sources: [NASA_STAR_TYPES],
  },
  {
    id: 'universe',
    hello: {
      key: 'cardUniverseHello',
      sourceId: 'nasa-cosmic-history',
      quote:
        'Scientists used nine years of data from NASA’s Wilkinson Microwave Anisotropy Probe to create this detailed, all-sky image of the cosmic microwave background. The image reveals 13.8-billion-year-old temperature fluctuations (shown as different colors) – seeds that grew into the galaxies we see today.',
    },
    facts: [
      {
        key: 'cardUniverseFact1',
        sourceId: 'nasa-dark-energy',
        quote:
          'Some 13.8 billion years ago, the universe began with a rapid expansion we call the big bang.',
      },
      {
        key: 'cardUniverseFact2',
        sourceId: 'nasa-dark-matter',
        quote:
          'scientists estimate that ordinary matter makes up only about 5% of the universe, while dark matter makes up about 27%. (The rest is thought to be dark energy, which is its own mystery).',
      },
      {
        key: 'cardUniverseFact3',
        sourceId: 'nasa-dark-energy',
        quote:
          "The short answer is: We don't know. But we do know that it exists, it’s making the universe expand at an accelerating rate",
      },
    ],
    moons: null,
    sources: [NASA_COSMIC_HISTORY, NASA_DARK_ENERGY, NASA_DARK_MATTER],
  },
  {
    id: 'bennu',
    hello: {
      key: 'cardBennuHello',
      sourceId: 'nasa-bennu',
      quote:
        'Bennu is a relatively small asteroid that passes close to Earth about every six years.',
    },
    facts: [
      {
        key: 'cardBennuFact1',
        sourceId: 'nasa-bennu',
        quote: 'Bennu is about one-third of a mile wide at its equator.',
      },
      {
        key: 'cardBennuFact2',
        sourceId: 'nasa-bennu',
        quote:
          'The rocks Bennu is made of formed nearly 4.6 billion years ago on a primeval world that has since been destroyed by a giant collision.',
      },
      {
        key: 'cardBennuFact3',
        sourceId: 'nasa-bennu',
        quote:
          "Bennu was the target of NASA's OSIRIS-REx, the first U.S. mission to collect a sample from an asteroid and deliver it to Earth on Sept. 24, 2023.",
      },
    ],
    moons: null,
    sources: [NASA_BENNU],
  },
  {
    id: 'osiris-rex',
    hello: {
      key: 'cardOsirisRexHello',
      sourceId: 'nasa-osiris-rex',
      quote:
        'Launched on Sept. 8, 2016, the Origins, Spectral Interpretation, Resource Identification, and Security-Regolith Explorer, or OSIRIS-REx, spacecraft traveled to a near-Earth asteroid named Bennu (formerly 1999 RQ36).',
    },
    facts: [
      {
        key: 'cardOsirisRexFact1',
        sourceId: 'nasa-osiris-rex',
        quote: "It collected a sample of rocks and dust from Bennu's surface on October 20, 2020.",
      },
      {
        key: 'cardOsirisRexFact2',
        sourceId: 'nasa-osiris-rex',
        quote:
          'The spacecraft delivered the sample to Earth on Sept. 24, 2023, when it released a capsule with grains of Bennu over Earth’s atmosphere.',
      },
      {
        key: 'cardOsirisRexFact3',
        sourceId: 'nasa-osiris-rex',
        quote:
          'Scientists hope the Bennu sample will reveal whether asteroids that collided with Earth billions of years ago thereby delivered water and other ingredients for life to our planet.',
      },
    ],
    moons: null,
    sources: [NASA_OSIRIS_REX],
  },
  {
    id: 'perseverance',
    hello: {
      key: 'cardPerseveranceHello',
      sourceId: 'nasa-perseverance',
      quote:
        "The Mars 2020 Perseverance Rover is searching for signs of ancient microbial life, to advance NASA's quest to explore the past habitability of Mars.",
    },
    facts: [
      {
        key: 'cardPerseveranceFact1',
        sourceId: 'nasa-perseverance',
        quote:
          'The rover is collecting core samples of Martian rock and regolith (broken rock and soil), for potential pickup by a future mission that would bring them to Earth for detailed study.',
      },
      {
        key: 'cardPerseveranceFact2',
        sourceId: 'nasa-perseverance',
        quote:
          "The rover discovered a habitable, stable lake, delta, and river system in Jezero Crater's history.",
      },
      {
        key: 'cardPerseveranceFact3',
        sourceId: 'nasa-ingenuity',
        quote:
          'After riding to Mars strapped beneath the Perseverance rover, the Ingenuity helicopter took to the Martian air for its initial flight on April 19, 2021',
      },
    ],
    moons: null,
    sources: [NASA_PERSEVERANCE, NASA_INGENUITY],
  },
  {
    id: 'ingenuity',
    hello: {
      key: 'cardIngenuityHello',
      sourceId: 'nasa-ingenuity',
      quote:
        "On April 19, 2021, NASA's Ingenuity Mars Helicopter made history when it completed the first powered, controlled flight on the Red Planet.",
    },
    facts: [
      {
        key: 'cardIngenuityFact1',
        sourceId: 'nasa-ingenuity',
        quote: 'the first powered flight on another planet',
      },
      {
        key: 'cardIngenuityFact2',
        sourceId: 'nasa-ingenuity',
        quote:
          'Designed to be a technology demonstration that would make no more than five test flights in 30 days, the helicopter eventually completed 72 flights across nearly three years',
      },
      {
        key: 'cardIngenuityFact3',
        sourceId: 'nasa-ingenuity',
        quote: 'Total length of rotors: Approximately 4 feet (approximately 1.2 meters) tip to tip',
      },
    ],
    moons: null,
    sources: [NASA_INGENUITY],
  },
  {
    id: 'dawn',
    hello: {
      key: 'cardDawnHello',
      sourceId: 'nasa-dawn',
      quote: 'giant asteroid Vesta and dwarf planet Ceres',
    },
    facts: [
      {
        key: 'cardDawnFact1',
        sourceId: 'nasa-dawn',
        quote: 'Dawn was NASA’s first truly interplanetary spaceship.',
      },
      {
        key: 'cardDawnFact2',
        sourceId: 'nasa-dawn-spacecraft',
        quote:
          'With its wide solar arrays extended, Dawn is about as long as a tractor-trailer at 65 feet (19.7 meters).',
      },
      {
        key: 'cardDawnFact3',
        sourceId: 'nasa-dawn-spacecraft',
        quote: 'The ion thruster is powered by large solar panels.',
      },
    ],
    moons: null,
    sources: [NASA_DAWN, NASA_DAWN_SPACECRAFT],
  },
  {
    id: 'kepler',
    hello: {
      key: 'cardKeplerHello',
      sourceId: 'nasa-kepler',
      quote: 'The Kepler space telescope was NASA’s first planet-hunting mission',
    },
    facts: [
      {
        key: 'cardKeplerFact1',
        sourceId: 'nasa-kepler',
        quote:
          'Originally positioned to stare continuously at 150,000 stars in one star-studded patch of the sky in the constellation Cygnus',
      },
      {
        key: 'cardKeplerFact2',
        sourceId: 'nasa-kepler',
        quote:
          'Kepler detected planets by observing transits, or tiny dips in the brightness of a star that occur when a planet crosses in front of the star.',
      },
      {
        key: 'cardKeplerFact3',
        sourceId: 'nasa-kepler',
        quote: 'They proved that our night sky is filled with more planets than even stars',
      },
    ],
    moons: null,
    sources: [NASA_KEPLER],
  },
  {
    id: 'spitzer',
    hello: {
      key: 'cardSpitzerHello',
      sourceId: 'nasa-spitzer',
      quote:
        'Spitzer uses an ultra-sensitive infrared telescope to study asteroids, comets, planets and distant galaxies.',
    },
    facts: [
      {
        key: 'cardSpitzerFact1',
        sourceId: 'nasa-spitzer',
        quote: 'After more than 16 years studying the universe in infrared light',
      },
      {
        key: 'cardSpitzerFact2',
        sourceId: 'nasa-spitzer',
        quote:
          'In 2009, Spitzer found a ring of Saturn, a wispy, fine structure with 300 times the diameter of the gas giant planet.',
      },
      {
        key: 'cardSpitzerFact3',
        sourceId: 'nasa-spitzer',
        quote: 'the first known star system with seven Earth-sized exoplanets',
      },
    ],
    moons: null,
    sources: [NASA_SPITZER],
  },
  {
    id: 'viking-lander',
    hello: {
      key: 'cardVikingLanderHello',
      sourceId: 'nasa-viking-1',
      quote: "NASA's Viking 1 made the first truly successful landing on Mars.",
    },
    facts: [
      {
        key: 'cardVikingLanderFact1',
        sourceId: 'nasa-viking-1',
        quote:
          'July 20, 1976, when NASA’s Viking 1 lander touched down safely and began transmitting the first images from the surface of the Red Planet',
      },
      {
        key: 'cardVikingLanderFact2',
        sourceId: 'nasa-viking-1',
        quote:
          'Both NASA Viking missions used a combination of orbiter and lander to explore Mars in unprecedented detail.',
      },
      {
        key: 'cardVikingLanderFact3',
        sourceId: 'nasa-viking-1',
        quote: 'The landers returned 4,500 photos of the two landing sites.',
      },
    ],
    moons: null,
    sources: [NASA_VIKING_1],
  },
  {
    id: 'friendship-7',
    hello: {
      key: 'cardFriendship7Hello',
      sourceId: 'nasa-friendship-7',
      quote:
        'An Atlas launch vehicle propelled a Mercury spacecraft into Earth orbit and enabled astronaut John Glenn to circle Earth three times.',
    },
    facts: [
      {
        key: 'cardFriendship7Fact1',
        sourceId: 'nasa-friendship-7',
        quote: 'Launch of the Mercury-Atlas 6 mission on Feb. 20, 1962.',
      },
      {
        key: 'cardFriendship7Fact2',
        sourceId: 'nasa-friendship-7',
        quote:
          'The flight lasted a total of 4 hours, 55 minutes, and 23 seconds before the Friendship 7 spacecraft splashed down in the ocean.',
      },
      {
        key: 'cardFriendship7Fact3',
        sourceId: 'nasa-friendship-7',
        quote:
          'The Noa had the spacecraft aboard 21 minutes after landing and astronaut John Glenn remained in the spacecraft during pickup.',
      },
    ],
    moons: null,
    sources: [NASA_FRIENDSHIP_7],
  },
  {
    id: 'europa-clipper',
    hello: {
      key: 'cardEuropaClipperHello',
      sourceId: 'nasa-europa-clipper',
      quote:
        "Europa Clipper launched Oct. 14, 2024, on a journey to explore Europa, Jupiter's ocean world.",
    },
    facts: [
      {
        key: 'cardEuropaClipperFact1',
        sourceId: 'nasa-europa-clipper',
        quote:
          'The spacecraft will travel 1.8 billion miles (2.9 billion kilometers) to reach Jupiter in April 2030.',
      },
      {
        key: 'cardEuropaClipperFact2',
        sourceId: 'nasa-europa-clipper',
        quote: 'It will orbit Jupiter, and conduct 49 close flybys of Europa.',
      },
      {
        key: 'cardEuropaClipperFact3',
        sourceId: 'nasa-europa-clipper',
        quote:
          'Scientists think that under the icy surface of Jupiter’s moon Europa a saltwater ocean exists that may contain more than twice as much liquid water as all of Earth’s oceans combined.',
      },
    ],
    moons: null,
    sources: [NASA_EUROPA_CLIPPER],
  },
  {
    id: 'canadarm',
    hello: {
      key: 'cardCanadarmHello',
      sourceId: 'csa-canadarm',
      quote: 'This robotic arm supported U.S. space shuttle missions for 30 years (1981–2011).',
    },
    facts: [
      {
        key: 'cardCanadarmFact1',
        sourceId: 'csa-canadarm',
        quote: 'The robotic arm had rotating joints at the shoulder, the elbow and the wrist.',
      },
      {
        key: 'cardCanadarmFact2',
        sourceId: 'csa-canadarm',
        quote: 'Canadarm was deployed in space for the first time on November 13, 1981.',
      },
      {
        key: 'cardCanadarmFact3',
        sourceId: 'csa-canadarm',
        quote:
          'Canadarm could lift over 30,000 kg (up to 266,000 kg in microgravity) using less electricity than a teakettle!',
      },
    ],
    moons: null,
    sources: [CSA_CANADARM],
  },
];
