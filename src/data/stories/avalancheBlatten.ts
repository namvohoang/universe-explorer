// An avalanche of rock and ice, in real pictures: the Birch Glacier above Blatten, a village in
// a valley of the Swiss Alps, which broke away on the afternoon of 28 May 2025. NASA Earth
// Observatory wrote it up as "Glacier Collapse Buries Swiss Village". Chosen because it was
// seen well from space before and after, and because people had left the village in time:
// the page tells it as what the rock, the ice and the river did, and names no one hurt.
// Nothing here is drawn. Each part is a picture from NASA's Harmonized Landsat and Sentinel-2
// pictures (30 metres to a pixel), from NASA Worldview, all three from Sentinel-2: 18 May, 30 May
// (two days after; the Landsat picture of 29 May was mostly cloud) and 12 June. The place is
// too small to see on the globe, so each picture is shown flat in the close look, at its real
// shape on the ground, beside the globe with a ring round the valley. The avalanche is the
// grey-brown tongue across the green valley floor. Worldview
// gives the day of each picture and not its minute; the hours each part shows are a choice.
// Each picture is left on show until the next takes its place, so the parts of 19 and 27 May
// still show the picture of 18 May. The place looked down on is the middle of the pictures'
// square, a choice of framing. Earth is turned the way it faced at the first instant (JPL
// Horizons).
// Not shown: the minute the glacier broke, which no picture caught, and the inside of the
// mountain, for which no measured shape was read.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { BLATTEN_2025_EARTH_TURN } from '../paths/blatten2025EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_BLATTEN_2025_EARTH,
  NASA_EARTH_OBSERVATORY_BLATTEN,
  NASA_WORLDVIEW_BLATTEN,
} from './sources';

const BLATTEN = 'nasa-earth-observatory-glacier-collapse-blatten';
const WORLDVIEW = 'nasa-worldview-blatten-2025';

/** The square every picture covers: west, south, east, north. */
const BOX = [7.78, 46.38, 7.86, 46.46] as const;
/** Noon (UTC) of 18 May 2025, as a Julian date. */
const NOON_18_MAY = 2460814;
const HOUR = 1 / 24;
/** The Julian date of an hour (UTC) of a day of May or June 2025. */
const at = (month: 'May' | 'June', day: number, hour: number): number =>
  NOON_18_MAY + (month === 'June' ? 31 : 0) + (day - 18) + (hour - 12) * HOUR;

/** An hour of a day of 2025 (UTC). */
const hour = (month: 'May' | 'June', day: number, from: number) => ({
  atJd: s(
    at(month, day, from),
    WORLDVIEW,
    `${String(from)}:00 UTC on ${String(day)} ${month} 2025.`,
  ),
  untilJd: s(
    at(month, day, from + 1),
    WORLDVIEW,
    `${String(from + 1)}:00 UTC on ${String(day)} ${month} 2025.`,
  ),
});

const SENTINEL_CREDIT =
  'NASA Worldview, NASA Earth Science Data and Information System (ESDIS); HLS from NASA LP DAAC; contains modified Copernicus Sentinel data 2025';

/** One picture, on show from its own part until the next picture takes its place. */
const picture = (
  name: string,
  camera: string,
  credit: string,
  fromJd: number,
  untilJd: number,
  date: string,
): StormPicture => ({
  media: {
    file: `public/media/stories/blatten-${name}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyAvalanchePictureAlt',
    credit,
  },
  box: s(BOX, WORLDVIEW, `The square asked for: west, south, east, north; ${camera}, ${date}.`),
  fromJd: s(fromJd, WORLDVIEW, `When the part that shows the picture of ${date} begins.`),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/**
 * What the 3D close-up draws from the page: how far the avalanche reached along the valley,
 * how high it climbed the far side, and when the glacier broke (the page gives the afternoon
 * of 28 May; the hour drawn, 13:00 UTC, is a choice). Rock is drawn piling on the ice from the
 * first picture on.
 */
export const BLATTEN_AVALANCHE = {
  runoutKm: s(
    2.5,
    BLATTEN,
    'Rock and ice from the avalanche extended 2.5 kilometers (1.6 miles) down the valley',
  ),
  runUpKm: s(
    0.24,
    BLATTEN,
    'debris continued as much as 240 meters (790 feet) up the opposite valley wall',
  ),
  breaksJd: s(at('May', 28, 13), BLATTEN, 'The afternoon of 28 May 2025; the hour is a choice.'),
  pilingFromJd: s(at('May', 18, 10), WORLDVIEW, 'The first picture of the story, 18 May 2025.'),
} as const;

/** The picture up close, beside the globe looking straight down on the middle of its square. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [7.82, 46.42] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const avalancheBlatten: Story = {
  id: 'avalanche-blatten',
  group: 'earth-at-work',
  kind: 'land',
  path: 'tracked',
  titleKey: 'storyAvalancheTitle',
  noteKey: 'storyAvalancheNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: BLATTEN_2025_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      picture(
        '2025-05-18',
        'Sentinel-2',
        SENTINEL_CREDIT,
        at('May', 18, 10),
        at('May', 30, 10),
        '18 May 2025',
      ),
      picture(
        '2025-05-30',
        'Sentinel-2',
        SENTINEL_CREDIT,
        at('May', 30, 10),
        at('June', 12, 10),
        '30 May 2025',
      ),
      picture(
        '2025-06-12',
        'Sentinel-2',
        SENTINEL_CREDIT,
        at('June', 12, 10),
        at('June', 12, 12),
        '12 June 2025',
      ),
    ],
  },
  chapters: [
    {
      id: 'the-valley',
      ...hour('May', 18, 10),
      text: {
        key: 'storyAvalancheValley',
        sourceId: BLATTEN,
        quote:
          'an avalanche of rock and ice from the Birch Glacier (Birchgletscher) in southwestern Switzerland',
      },
      ...OVER,
    },
    {
      id: 'rock-piles-up',
      ...hour('May', 18, 11),
      text: {
        key: 'storyAvalancheRock',
        sourceId: BLATTEN,
        quote: 'rock from a crumbling mountain peak built up on the glacier',
      },
      ...OVER,
    },
    {
      id: 'everyone-leaves',
      ...hour('May', 19, 10),
      text: {
        key: 'storyAvalancheLeave',
        sourceId: BLATTEN,
        quote: 'prompting people to evacuate Blatten by May 19',
      },
      ...OVER,
    },
    {
      id: 'faster',
      ...hour('May', 27, 10),
      text: {
        key: 'storyAvalancheFaster',
        sourceId: BLATTEN,
        quote:
          'the glacier had sped up significantly, moving downhill at an estimated 10 meters (33 feet) per day',
      },
      ...OVER,
    },
    {
      id: 'it-breaks',
      ...hour('May', 30, 10),
      text: {
        key: 'storyAvalancheBreaks',
        sourceId: BLATTEN,
        quote:
          'Debris buried most of the village of Blatten and dammed the Lonza, causing the river to flood.',
      },
      ...OVER,
    },
    {
      id: 'the-river',
      ...hour('June', 12, 10),
      text: {
        key: 'storyAvalancheRiver',
        sourceId: BLATTEN,
        quote:
          'Rock and ice from the avalanche extended 2.5 kilometers (1.6 miles) down the valley',
      },
      ...OVER,
    },
    {
      id: 'still-learning',
      ...hour('June', 12, 11),
      text: {
        key: 'storyAvalancheLearning',
        sourceId: BLATTEN,
        quote: 'Scientists are still investigating what factors contributed to the event.',
      },
      ...OVER,
    },
  ],
  endJd: s(at('June', 12, 12), WORLDVIEW, '12:00 UTC on 12 June 2025.'),
  sources: [
    NASA_EARTH_OBSERVATORY_BLATTEN,
    NASA_WORLDVIEW_BLATTEN,
    JPL_HORIZONS_TURN_BLATTEN_2025_EARTH,
  ],
};
