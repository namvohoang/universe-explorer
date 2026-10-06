// Every sentence on a card is backed by a quote from a NASA page. A script checked that each
// quote appears in the page as fetched on the source's `retrieved` date, then wrote this file.
// The sentences themselves are in src/ui/strings/en.ts under each `key`.
import {
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
        sourceId: 'nasa-facts-comets',
        quote: 'A comet warms up as it nears the Sun and develops an atmosphere, or coma.',
      },
      {
        key: 'cardHalleyFact2',
        sourceId: 'nasa-facts-comets',
        quote:
          'The pressure of sunlight and high-speed solar particles (solar wind) can blow the coma dust and gas away from the Sun, sometimes forming a long, bright tail.',
      },
      {
        key: 'cardHalleyFact3',
        sourceId: 'nasa-facts-comets',
        quote: "Halley's comet gets no closer than 55 million miles (89 million kilometers).",
      },
    ],
    moons: null,
    sources: [NASA_FACTS_COMETS],
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
        sourceId: 'nasa-hubble-proxima',
        quote: 'just over four light-years from Earth',
      },
      {
        key: 'cardProximaCentauriFact2',
        sourceId: 'nasa-hubble-proxima',
        quote: 'Proxima Centauri is not visible to the naked eye',
      },
      {
        key: 'cardProximaCentauriFact3',
        sourceId: 'nasa-hubble-proxima',
        quote: 'at only about an eighth of the mass of the Sun',
      },
    ],
    moons: null,
    sources: [NASA_HUBBLE_PROXIMA],
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
        sourceId: 'nasa-milky-way',
        quote: "The annotated artist's concept illustrates the new view of the Milky Way.",
      },
    ],
    moons: null,
    sources: [NASA_MILKY_WAY],
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
        sourceId: 'nasa-first-black-hole-image',
        quote: 'There is a supermassive black hole at the center of our galaxy',
      },
    ],
    moons: null,
    sources: [NASA_FIRST_BLACK_HOLE_IMAGE],
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
];
