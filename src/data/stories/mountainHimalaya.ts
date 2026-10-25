// How a mountain range is made: the Himalaya, told over 80 million years and ending on the real
// land around Mount Everest today. Nobody saw it happen, so the story is `rebuilt`: the years
// and what happened in them are from the USGS ("The Himalayas: Two continents collide") and
// NASA Earth Observatory ("The World's Tallest Mountain"); the 3D drawing of the plates and
// the rising ground is a drawing, and the screen says so.
// The last three parts are today. The land is built from its measured heights (NOAA's ETOPO
// 2022, about 460 metres to a cell, so the summit itself is smoothed: the highest cell is
// 8,586 m) with what the MODIS camera on Terra saw on 15 November 2025 laid over it, from
// NASA Worldview. Beside it, the tallest mountain of the solar system, Olympus Mons on Mars,
// 27 km by JPL's page, drawn by the same factor; the catalogue holds no height for it. 27 km
// is 3.1 times the highest cell, so the sentence says "more than three times".
// The story's instants are 15 November 2025, the day of the picture, one hour to a part; they
// only drive its clock, which counts the years.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { HIMALAYA_2025_EARTH_TURN } from '../paths/himalaya2025EarthTurn';
import { HIMALAYA_HEIGHTS } from '../paths/himalayaHeights';
import { s } from './sourced';
import {
  JPL_OLYMPUS_MONS_2024,
  JPL_HORIZONS_TURN_HIMALAYA_2025_EARTH,
  NASA_EARTH_OBSERVATORY_TALLEST_MOUNTAIN,
  NASA_WORLDVIEW_HIMALAYA_2025,
  NASA_EARTH_OBSERVATORY_8000_METER_PEAKS,
  NOAA_ETOPO_2022,
  USGS_EVENT_NEPAL_2015,
  USGS_HIMALAYAS_COLLIDE,
} from './sources';

const USGS = 'usgs-himalayas-two-continents-collide';
const TALLEST = 'nasa-earth-observatory-tallest-mountain';
const JPL = 'jpl-mars-odyssey-olympus-mons-2024';
const WORLDVIEW = 'nasa-worldview-himalaya-2025';
const PEAKS = 'nasa-earth-observatory-8000-meter-peaks';
const NEPAL = 'usgs-event-us20002926';

/** Noon (UTC) of 15 November 2025, as a Julian date. */
const NOON_15_NOVEMBER = 2460995;
const HOUR = 1 / 24;
const at = (hour: number): number => NOON_15_NOVEMBER + (hour - 12) * HOUR;
/** An hour of the story's own clock, on the day of the picture (UTC). */
const hour = (from: number) => ({
  atJd: s(at(from), WORLDVIEW, `${String(from)}:00 UTC on 15 November 2025: the story's clock.`),
  untilJd: s(at(from + 1), WORLDVIEW, `${String(from + 1)}:00 UTC on 15 November 2025.`),
});
/** The years a part plays, from its source. */
const years = (fromYearsAgo: number, untilYearsAgo: number, sourceId: string, note: string) => ({
  yearsAgo: s([fromYearsAgo, untilYearsAgo] as const, sourceId, note),
});

/**
 * What the 3D close-up draws from the pages: when the plates are drawn starting to close and
 * when they meet, from when the real range is shown and the bars beside it, and the two
 * heights of the bars.
 */
export const HIMALAYA_DRAWING = {
  startYearsAgo: s(80e6, USGS, 'About 80 million years ago, India far to the south of Asia.'),
  meetYearsAgo: s(50e6, USGS, 'When India rammed into Asia about 40 to 50 million years ago'),
  todayFromJd: s(at(10), WORLDVIEW, 'The first part that is today.'),
  barsFromJd: s(at(13), WORLDVIEW, 'The part that sets the two heights side by side.'),
  tallestKm: s(
    27,
    JPL,
    'With a base that sprawls across 373 miles (600 kilometers), the shield volcano rises to a height of 17 miles (27 kilometers).',
  ),
} as const;

/** The land up close, beside the globe looking straight down on the middle of the square. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [86.9, 28] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const mountainHimalaya: Story = {
  id: 'mountain-himalaya',
  group: 'earth-at-work',
  kind: 'land',
  path: 'rebuilt',
  titleKey: 'storyMountainTitle',
  actorIds: ['earth', 'sun'],
  turned: { earth: HIMALAYA_2025_EARTH_TURN },
  land: HIMALAYA_HEIGHTS,
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      {
        media: {
          file: 'public/media/stories/himalaya-2025-11-15.webp',
          kind: 'composite',
          role: 'picture',
          altKey: 'storyMountainPictureAlt',
          credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
        },
        box: s(
          [86.2, 27.3, 87.6, 28.7] as const,
          WORLDVIEW,
          'The square asked for: west, south, east, north; MODIS on Terra, 15 November 2025.',
        ),
        fromJd: s(at(4), WORLDVIEW, 'The first instant of the story.'),
        untilJd: s(at(14), WORLDVIEW, 'The end of the story.'),
      },
    ],
  },
  chapters: [
    {
      id: 'far-apart',
      ...hour(4),
      ...years(
        80e6,
        60e6,
        USGS,
        'About 80 million years ago; the drawing closes the sea from then.',
      ),
      text: {
        key: 'storyMountainFarApart',
        sourceId: USGS,
        quote: 'a vast ocean (called Tethys Sea) separated India from the Asian continent.',
      },
      ...OVER,
    },
    {
      id: 'moving-north',
      ...hour(5),
      ...years(60e6, 50e6, USGS, 'Until India met Asia, 40 to 50 million years ago.'),
      text: {
        key: 'storyMountainMoving',
        sourceId: USGS,
        quote: 'moving northward at a rate of about 9 m a century',
      },
      ...OVER,
    },
    {
      id: 'they-meet',
      ...hour(6),
      ...years(50e6, 40e6, USGS, 'When India rammed into Asia about 40 to 50 million years ago'),
      text: {
        key: 'storyMountainMeet',
        sourceId: USGS,
        quote: 'When India rammed into Asia about 40 to 50 million years ago',
      },
      ...OVER,
    },
    {
      id: 'pushed-up',
      ...hour(7),
      ...years(40e6, 10e6, TALLEST, 'Since the collision began, 40 million years ago.'),
      text: {
        key: 'storyMountainPushed',
        sourceId: TALLEST,
        quote:
          'The edges of two continents jammed together and pushed up the massive ridges that make up the Himalayas today.',
      },
      ...OVER,
    },
    {
      id: 'carved-by-ice',
      ...hour(8),
      ...years(10e6, 1e6, TALLEST, 'The page gives no years for the glaciers.'),
      text: {
        key: 'storyMountainIce',
        sourceId: TALLEST,
        quote:
          'Meanwhile, glaciers have chiseled Mount Everest’s summit into a huge, triangular pyramid',
      },
      ...OVER,
    },
    {
      id: 'worn-down',
      ...hour(9),
      ...years(1e6, 0, PEAKS, 'Up to today; the page gives no years.'),
      text: {
        key: 'storyMountainWorn',
        sourceId: PEAKS,
        quote:
          'a constant fight between the rate of uplift and the erosive power of wind, rain, snow, and glacial ice.',
      },
      ...OVER,
    },
    {
      id: 'still-rising',
      ...hour(10),
      ...years(0, 0, USGS, 'Today.'),
      text: {
        key: 'storyMountainRising',
        sourceId: USGS,
        quote: 'The Himalayas continue to rise more than 1 cm a year',
      },
      ...OVER,
    },
    {
      id: 'still-pushing',
      ...hour(11),
      ...years(0, 0, NEPAL, 'Today.'),
      text: {
        key: 'storyMountainPushing',
        sourceId: NEPAL,
        quote:
          'the India plate is converging with Eurasia at a rate of 45 mm/yr towards the north-northeast',
      },
      ...OVER,
    },
    {
      id: 'the-real-range',
      ...hour(12),
      ...years(0, 0, TALLEST, 'Today.'),
      text: {
        key: 'storyMountainReal',
        sourceId: TALLEST,
        quote:
          'The tallest of these ‘eight-thousanders’ is Mount Everest, the standard to which all other mountains are compared.',
      },
      ...OVER,
    },
    {
      id: 'tallest-of-all',
      ...hour(13),
      ...years(0, 0, JPL, 'Today.'),
      text: {
        key: 'storyMountainTallest',
        sourceId: JPL,
        quote:
          'With a base that sprawls across 373 miles (600 kilometers), the shield volcano rises to a height of 17 miles (27 kilometers).',
      },
      ...OVER,
    },
  ],
  endJd: s(at(14), WORLDVIEW, '14:00 UTC on 15 November 2025.'),
  sources: [
    USGS_HIMALAYAS_COLLIDE,
    NASA_EARTH_OBSERVATORY_TALLEST_MOUNTAIN,
    NASA_EARTH_OBSERVATORY_8000_METER_PEAKS,
    USGS_EVENT_NEPAL_2015,
    JPL_OLYMPUS_MONS_2024,
    NOAA_ETOPO_2022,
    NASA_WORLDVIEW_HIMALAYA_2025,
    JPL_HORIZONS_TURN_HIMALAYA_2025_EARTH,
  ],
};
