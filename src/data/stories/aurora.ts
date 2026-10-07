// Where auroras are seen: a glowing band round each of Earth's geomagnetic poles. Where the
// poles are, and how far from them the bands lie, are NOAA's figures (the World Magnetic Model
// for 2025.0; "bands of greatest activity occur between 15° and 25° from the geomagnetic
// poles"). How high the green glow is, is NASA's. Earth is turned the way it will face at the
// first instant (JPL Horizons), so the bands lie over the right lands, and the story runs for
// one day from then: a winter's day in the north, when the northern band is in the dark.
// That the bands are drawn evenly bright all the way round is a drawing, and the screen says
// so: a real aurora flickers, comes and goes, and is stronger on the night side.
// Nothing of the wind from the Sun or of Earth's magnetism is drawn: the catalogue holds
// nothing about either.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { AURORA_2027_EARTH_TURN } from '../paths/aurora2027EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_AURORA_2027_EARTH,
  NASA_AURORAS,
  NOAA_GEOMAGNETIC_POLES,
} from './sources';

const DAY = 'jpl-horizons-turn-aurora2027earthturn';
const NOAA = 'noaa-geomagnetic-poles';
const NASA = 'nasa-auroras';

// Where the aurora is watched from the ground, and where in it the look is turned: both on the
// meridian of the geomagnetic north pole (72.76°W, 80.79°N), on the side away from the
// geographic pole. The band is 15° to 25° from that pole; its middle, 20° away, is looked at
// from 27° away, a little outside the band, so that it stands up from the northern horizon.
const UNDER_THE_BAND = s(
  [-72.76, 53.79] as const,
  NOAA,
  '27° from the geomagnetic north pole along its own meridian: 2° outside the band of greatest activity.',
);
// The same on the far side of the world, for the ring round the far south: the geomagnetic
// south pole is the point opposite the north one (107.24°E, 80.79°S).
const UNDER_THE_SOUTHERN_BAND = s(
  [107.24, -53.79] as const,
  NOAA,
  '27° from the geomagnetic south pole along its own meridian: 2° outside the band of greatest activity.',
);
const IN_THE_SOUTHERN_BAND = s(
  [107.24, -60.79, 150] as const,
  NOAA,
  'The middle of the southern band, 20° from the geomagnetic south pole, at 150 km.',
);
const IN_THE_BAND = s(
  [-72.76, 60.79, 150] as const,
  NOAA,
  'The middle of the band, 20° from the geomagnetic north pole, at 150 km, the middle of the heights NASA gives for the green glow.',
);

export const aurora: Story = {
  id: 'aurora',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyAuroraTitle',
  noteKey: 'storyAuroraNote',
  fromEarth: {
    media: {
      file: 'public/media/stories/aurora-from-the-ground.webp',
      kind: 'photo',
      role: 'picture',
      altKey: 'storyAuroraPhotoAlt',
      credit: 'NASA/Ben Smegelsky',
    },
    // The caption says why the photo is red and the drawn rings green. NASA (nasa-auroras):
    // "Green occurs roughly between 60 to 120 miles (100-200 km) altitude" and "Red occurs
    // above 120 miles (200 km)", from "Oxygen excited to different energy levels".
    captionKey: 'storyAuroraPhoto',
  },
  actorIds: ['earth', 'sun'],
  turned: { earth: AURORA_2027_EARTH_TURN },
  aurora: {
    onId: 'earth',
    northPole: s(
      [-72.76, 80.79],
      NOAA,
      'The Geomagnetic North Pole for 2025.0: 72.76°W, 80.79°N measured from Earth’s centre. The south one is the point opposite.',
    ),
    fromPoleDeg: s([15, 25], NOAA, 'Where the bands of greatest activity lie.'),
    heightKm: s([100, 200], NASA, 'Where oxygen glows green.'),
  },
  chapters: [
    {
      id: 'wind-from-the-sun',
      atJd: s(2461420.500800745, DAY, 'Midnight (UTC) at the start of 15 January 2027.'),
      text: {
        key: 'storyAuroraWind',
        sourceId: NASA,
        quote:
          'The Sun continuously produces an outflow of charged particles into the solar system known as the solar wind.',
      },
      lookAtId: 'earth',
      standAtId: 'earth',
      standOn: UNDER_THE_BAND,
      lookUpAt: IN_THE_BAND,
      closeUp: true,
      over: 'north',
    },
    {
      id: 'glowing-air',
      atJd: s(2461420.834134079, DAY, 'Eight hours later.'),
      text: {
        key: 'storyAuroraGlowingAir',
        sourceId: NASA,
        quote:
          'When energetic particles from space collide with atoms and molecules in the atmosphere, they can cause the colorful glow that we call auroras.',
      },
      lookAtId: 'earth',
      standAtId: 'earth',
      standOn: UNDER_THE_BAND,
      lookUpAt: IN_THE_BAND,
      closeUp: true,
      over: 'north',
    },
    {
      id: 'south-too',
      atJd: s(2461421.167467412, DAY, 'Sixteen hours later.'),
      text: {
        key: 'storyAuroraSouthToo',
        sourceId: NASA,
        quote:
          "The most common color is green, which is produced when oxygen is excited by electrons around 60 mi (100 km) above Earth's surface.",
      },
      lookAtId: 'earth',
      standAtId: 'earth',
      standOn: UNDER_THE_SOUTHERN_BAND,
      lookUpAt: IN_THE_SOUTHERN_BAND,
      closeUp: true,
      over: 'south',
    },
  ],
  endJd: s(2461421.500800745, DAY, 'One day later.'),
  sources: [JPL_HORIZONS_TURN_AURORA_2027_EARTH, NOAA_GEOMAGNETIC_POLES, NASA_AURORAS],
};
