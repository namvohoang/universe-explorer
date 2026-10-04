// Every sentence on a card is backed by a quote from a NASA page. A script checked that each
// quote appears in the page as fetched on the source's `retrieved` date, then wrote this file.
// The sentences themselves are in src/ui/strings/en.ts under each `key`.
import {
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
  NASA_HUBBLE_M104,
  NASA_HUBBLE_NUMBERS,
  NASA_ISS_FACTS,
  NASA_HUBBLE_M31,
  NASA_HUBBLE_M33,
  NASA_HUBBLE_M51,
  NASA_HUBBLE_M42,
  NASA_HUBBLE_M45,
  NASA_HUBBLE_M87,
  NASA_BETELGEUSE,
  NASA_HUBBLE_PROXIMA,
  NASA_MILKY_WAY,
  NASA_TRAPPIST1,
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
];
