// Lightning, at the place on Earth that has the most of it: Lake Maracaibo, in Venezuela,
// which NASA Earth Observatory names in "A New Look at Earth's Lightning" from what lightning
// sensors in space counted over many years (on the TRMM satellite and the space station). How
// a storm makes lightning and thunder rests on NOAA's National Severe Storms Laboratory, and
// what to do when thunder roars on the National Weather Service.
// The pictures are what the MODIS camera on Terra (in the morning) and the VIIRS camera on
// Suomi NPP (in the afternoon) saw on 29 September 2025, from NASA Worldview, in true colour:
// a day picked because the lake shows clearly, with a storm cloud by its western shore.
// Neither picture shows lightning, and no record of that day's flashes was read.
// The close-up is a 3D drawing of a storm cloud over the lake, charged ice and soft hail
// inside it, and flashes drawn at the lake's real average rate (389 a day) as the story's
// clock runs: an average over years, not the flashes of that night, and the screen says so.
// The shape of the cloud and of each flash is a drawing.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { MARACAIBO_2025_EARTH_TURN } from '../paths/maracaibo2025EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_MARACAIBO_2025_EARTH,
  NASA_EARTH_OBSERVATORY_LIGHTNING,
  NASA_WORLDVIEW_MARACAIBO_2025,
  NOAA_NSSL_LIGHTNING,
  NWS_LIGHTNING_SAFETY,
} from './sources';

const LIGHTNING = 'nasa-earth-observatory-new-look-lightning';
const WORLDVIEW = 'nasa-worldview-maracaibo-2025';
const NSSL = 'noaa-nssl-lightning';
const NWS = 'nws-lightning-safety';

/** The square every picture covers: west, south, east, north. */
const BOX = [-73, 8.4, -70.2, 11.2] as const;
/** Noon (UTC) of 29 September 2025, as a Julian date. */
const NOON_29_SEPTEMBER = 2460948;
const HOUR = 1 / 24;
/** The Julian date of an hour (UTC) counted from midnight at the start of 29 September 2025. */
const at = (hour: number): number => NOON_29_SEPTEMBER + (hour - 12) * HOUR;
/** The words for an hour so counted. */
const said = (hour: number): string =>
  hour < 24
    ? `${String(hour)}:00 UTC on 29 September 2025.`
    : `${String(hour - 24)}:00 UTC on 30 September 2025.`;

/** An hour of the story (UTC), counted from midnight at the start of 29 September 2025. */
const hour = (from: number) => ({
  atJd: s(at(from), WORLDVIEW, said(from)),
  untilJd: s(at(from + 1), WORLDVIEW, said(from + 1)),
});

/** One picture, on show from its own part until the next picture takes its place. */
const picture = (name: string, camera: string, fromJd: number, untilJd: number): StormPicture => ({
  media: {
    file: `public/media/stories/maracaibo-${name}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyLightningPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(
    BOX,
    WORLDVIEW,
    `The square asked for: west, south, east, north; ${camera}, 29 September 2025.`,
  ),
  fromJd: s(fromJd, WORLDVIEW, 'When the part that shows the picture begins.'),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/**
 * What the 3D close-up draws from the page: how many flashes the lake has on an average day,
 * counted from the story's first instant.
 */
export const MARACAIBO_LIGHTNING = {
  flashesPerDay: s(
    389,
    LIGHTNING,
    'With an average flash rate of 389 per day, Lake Maracaibo in northern Venezuela (shown above) has the highest',
  ),
  countFromJd: s(at(14), WORLDVIEW, 'The first instant of the story.'),
} as const;

/** The storm up close, beside the globe looking straight down on the lake. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [-71.6, 9.8] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const lightningMaracaibo: Story = {
  id: 'lightning-maracaibo',
  group: 'earth-at-work',
  kind: 'weather',
  path: 'tracked',
  titleKey: 'storyLightningTitle',
  noteKey: 'storyLightningNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: MARACAIBO_2025_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      picture('2025-09-29-morning', 'MODIS on Terra', at(14), at(18)),
      picture('2025-09-29', 'VIIRS on Suomi NPP', at(18), at(26)),
    ],
  },
  chapters: [
    {
      id: 'the-lake',
      ...hour(14),
      text: {
        key: 'storyLightningLake',
        sourceId: LIGHTNING,
        quote:
          'With an average flash rate of 389 per day, Lake Maracaibo in northern Venezuela (shown above) has the highest',
      },
      ...OVER,
    },
    {
      id: 'why-here',
      ...hour(15),
      text: {
        key: 'storyLightningWhy',
        sourceId: LIGHTNING,
        quote:
          'That region’s unique geography fuels weather patterns that make it a magnet for thunderstorms and lightning.',
      },
      ...OVER,
    },
    {
      id: 'inside-the-cloud',
      ...hour(18),
      text: {
        key: 'storyLightningInside',
        sourceId: NSSL,
        quote: 'graupel particles collide and bounce off of smaller ice particles',
      },
      ...OVER,
    },
    {
      id: 'the-spark',
      ...hour(22),
      text: {
        key: 'storyLightningSpark',
        sourceId: NSSL,
        quote:
          'Lightning is a giant spark of electricity in the atmosphere between clouds, the air, or the ground.',
      },
      ...OVER,
    },
    {
      id: 'how-hot',
      ...hour(23),
      text: {
        key: 'storyLightningHot',
        sourceId: NSSL,
        quote: 'heats the air briefly to around 50,000 degrees Fahrenheit',
      },
      ...OVER,
    },
    {
      id: 'thunder',
      ...hour(24),
      text: {
        key: 'storyLightningThunder',
        sourceId: NSSL,
        quote: 'This causes the air to explode outward.',
      },
      ...OVER,
    },
    {
      id: 'go-indoors',
      ...hour(25),
      text: {
        key: 'storyLightningIndoors',
        sourceId: NWS,
        quote: 'If you hear thunder, you are likely within striking distance of the storm.',
      },
      ...OVER,
    },
  ],
  endJd: s(at(26), WORLDVIEW, said(26)),
  sources: [
    NASA_EARTH_OBSERVATORY_LIGHTNING,
    NOAA_NSSL_LIGHTNING,
    NWS_LIGHTNING_SAFETY,
    NASA_WORLDVIEW_MARACAIBO_2025,
    JPL_HORIZONS_TURN_MARACAIBO_2025_EARTH,
  ],
};
