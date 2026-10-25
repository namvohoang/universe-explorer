// The monsoon, in real pictures: northern India in the summer of 2005, from before the rains
// to the end of August, which NASA Earth Observatory showed in "Monsoon Flooding in India"
// (the pictures of 19 June and 29 August). What a monsoon is, and why it rains, rests on
// NOAA's SciJinks page "What Is a Monsoon?".
// Each part is what the MODIS camera on NASA's Aqua satellite saw that day, from NASA
// Worldview, in the same false colour as the page's own pictures (bands 7, 2 and 1): water
// dark blue, plants green, clouds pale blue and white, and the snow on the Himalaya bright
// blue. The screen says the colours are changed. The picture of 10 July, under the monsoon's
// clouds, is one more of Aqua's; the page does not show it. Worldview gives the day of each
// picture and not its minute; Aqua passes in the early afternoon, and the hours each part shows
// keep to that and are otherwise a choice.
// The close-up is a 3D drawing of land and sea: the land warming, the wind turning round and
// blowing in from the sea, clouds and rain over the land, the land turning green, and the wind
// turning back in winter. Which part shows which is the story's choice; how the air moves is
// a drawing.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { MONSOON_2005_EARTH_TURN } from '../paths/monsoon2005EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_MONSOON_2005_EARTH,
  NASA_EARTH_OBSERVATORY_MONSOON_2005,
  NASA_WORLDVIEW_MONSOON_2005,
  NOAA_SCIJINKS_MONSOON,
} from './sources';

const MONSOON = 'nasa-earth-observatory-monsoon-2005';
const WORLDVIEW = 'nasa-worldview-monsoon-2005';
const SCIJINKS = 'noaa-scijinks-monsoon';

/** The square every picture covers: west, south, east, north. */
const BOX = [80, 24, 87, 31] as const;
/** Noon (UTC) of 19 June 2005, as a Julian date. */
const NOON_19_JUNE = 2453541;
const HOUR = 1 / 24;
type Month = 'June' | 'July' | 'August';
const DAYS_BEFORE: Readonly<Record<Month, number>> = { June: -19, July: 11, August: 42 };
/** The Julian date of an hour (UTC) of a day of June, July or August 2005. */
const at = (month: Month, day: number, hour: number): number =>
  NOON_19_JUNE + DAYS_BEFORE[month] + day + (hour - 12) * HOUR;

/** An hour of a day of 2005 (UTC). */
const hour = (month: Month, day: number, from: number) => ({
  atJd: s(
    at(month, day, from),
    WORLDVIEW,
    `${String(from)}:00 UTC on ${String(day)} ${month} 2005.`,
  ),
  untilJd: s(
    at(month, day, from + 1),
    WORLDVIEW,
    `${String(from + 1)}:00 UTC on ${String(day)} ${month} 2005.`,
  ),
});

/** One picture, on show from its own part until the next picture takes its place. */
const picture = (name: string, fromJd: number, untilJd: number, date: string): StormPicture => ({
  media: {
    file: `public/media/stories/monsoon-${name}.webp`,
    kind: 'false-colour',
    role: 'picture',
    altKey: 'storyMonsoonPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(BOX, WORLDVIEW, `The square asked for: west, south, east, north; MODIS on Aqua, ${date}.`),
  fromJd: s(fromJd, WORLDVIEW, `When the part that shows the picture of ${date} begins.`),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/**
 * When the 3D close-up shows each turn of the season: the land warming, the wind turning, the
 * rain, the green land, and the dry winter wind. These are the story's parts, not dates of the
 * real monsoon.
 */
export const MONSOON_PARTS = {
  warmsJd: at('June', 19, 10),
  windTurnsJd: at('July', 10, 8),
  rainJd: at('July', 10, 9),
  greenJd: at('August', 29, 8),
  winterJd: at('August', 29, 9),
} as const;

/** The land and sea up close, beside the globe looking straight down on the pictures' middle. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [83.5, 27.5] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const monsoonIndia: Story = {
  id: 'monsoon-india',
  group: 'earth-at-work',
  kind: 'weather',
  path: 'tracked',
  titleKey: 'storyMonsoonTitle',
  noteKey: 'storyMonsoonNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: MONSOON_2005_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      picture('2005-06-19', at('June', 19, 8), at('July', 10, 8), '19 June 2005'),
      picture('2005-07-10', at('July', 10, 8), at('August', 29, 8), '10 July 2005'),
      picture('2005-08-29', at('August', 29, 8), at('August', 29, 10), '29 August 2005'),
    ],
  },
  chapters: [
    {
      id: 'before-the-rains',
      ...hour('June', 19, 8),
      text: {
        key: 'storyMonsoonBefore',
        sourceId: MONSOON,
        quote:
          'Shown in false color, the image depicts water as dark blue, clouds as pale blue and white,',
      },
      ...OVER,
    },
    {
      id: 'what-is-a-monsoon',
      ...hour('June', 19, 9),
      text: {
        key: 'storyMonsoonWhat',
        sourceId: SCIJINKS,
        quote:
          'A monsoon is a shift in winds that often causes a very rainy season or a very dry season.',
      },
      ...OVER,
    },
    {
      id: 'the-land-warms',
      ...hour('June', 19, 10),
      text: {
        key: 'storyMonsoonWarms',
        sourceId: SCIJINKS,
        quote:
          'For example, at the beginning of summer, the land warms up faster than bodies of water.',
      },
      ...OVER,
    },
    {
      id: 'the-wind-turns',
      ...hour('July', 10, 8),
      text: {
        key: 'storyMonsoonWind',
        sourceId: SCIJINKS,
        quote:
          'In the summer, warm air rising off the land creates conditions that reverse the direction of the wind.',
      },
      ...OVER,
    },
    {
      id: 'the-rain',
      ...hour('July', 10, 9),
      text: {
        key: 'storyMonsoonRain',
        sourceId: SCIJINKS,
        quote: 'The warm, moist air then condenses and becomes rain.',
      },
      ...OVER,
    },
    {
      id: 'green',
      ...hour('August', 29, 8),
      text: {
        key: 'storyMonsoonGreen',
        sourceId: MONSOON,
        quote:
          'In addition to filling the rivers, the rainfall has turned the landscape green as plants flourish.',
      },
      ...OVER,
    },
    {
      id: 'winter',
      ...hour('August', 29, 9),
      text: {
        key: 'storyMonsoonWinter',
        sourceId: SCIJINKS,
        quote: 'Winter monsoons in these regions near the Indian Ocean are usually dry.',
      },
      ...OVER,
    },
  ],
  endJd: s(at('August', 29, 10), WORLDVIEW, '10:00 UTC on 29 August 2005.'),
  sources: [
    NASA_EARTH_OBSERVATORY_MONSOON_2005,
    NOAA_SCIJINKS_MONSOON,
    NASA_WORLDVIEW_MONSOON_2005,
    JPL_HORIZONS_TURN_MONSOON_2005_EARTH,
  ],
};
