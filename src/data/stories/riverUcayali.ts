// A river that moves: the Ucayali, in the Amazon of Peru beside the city of Pucallpa, as
// satellites saw it in the dry season of 2016, 2022 and 2025. Its bends slide across the land
// and loops are cut off; the pictures are real (NASA's Harmonized Landsat and Sentinel-2,
// through NASA Worldview: Sentinel-2 on 15 July 2016, Landsat on 28 July 2022 and on 4 July
// 2025), and what makes a river do it rests on NASA Earth Observatory's pages ("Deforestation
// Follows a Road Through Ucayali", "Mud from the Andes Carried by the Amazon", "The Forested
// Floodplains of Congaree National Park", "Meandering in the Amazon"). Two parts look at
// rivers on other worlds: the dry river channels of Mars (NASA, Jezero Crater) and the
// methane rivers of Titan (NASA, Titan facts).
// The 3D close-up is a drawing of a winding river: the faster water on the outside of each
// bend, sand on the inside, the bends sliding, and a loop cut off into an oxbow lake. How fast
// it is drawn to happen is a drawing; the pictures show how it really went.
// The story's instants are the days of the pictures, part by part, with the years between
// skipped; Worldview gives the day and not the minute, and the hours are a choice.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { UCAYALI_2016_EARTH_TURN } from '../paths/ucayali2016EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_UCAYALI_2016_EARTH,
  NASA_EARTH_OBSERVATORY_CONGAREE,
  NASA_EARTH_OBSERVATORY_MEANDERING_AMAZON,
  NASA_EARTH_OBSERVATORY_MUD_ANDES,
  NASA_EARTH_OBSERVATORY_UCAYALI_ROAD,
  NASA_EARTH_OBSERVATORY_WATER_CYCLE,
  NASA_EARTH_OBSERVATORY_YELLOW_RIVER_DELTA,
  NASA_JEZERO_CRATER,
  NASA_TITAN_FACTS,
  NASA_WORLDVIEW_UCAYALI,
} from './sources';

const ROAD = 'nasa-earth-observatory-ucayali-road';
const MUD = 'nasa-earth-observatory-mud-andes';
const CONGAREE = 'nasa-earth-observatory-congaree';
const AMAZON = 'nasa-earth-observatory-meandering-amazon';
const JEZERO = 'nasa-jezero-crater';
const TITAN = 'nasa-titan-facts';
const WORLDVIEW = 'nasa-worldview-ucayali';
const WATER_CYCLE = 'nasa-earth-observatory-water-cycle';
const YELLOW = 'nasa-earth-observatory-yellow-river-delta';

/** The square every picture covers: west, south, east, north. */
const BOX = [-74.6, -8.75, -74.1, -8.25] as const;
const HOUR = 1 / 24;
/** Noon (UTC) of each day of a picture, as a Julian date. */
const NOON = { 2016: 2457585, 2022: 2459789, 2025: 2460861 } as const;
const DAY = { 2016: '15 July 2016', 2022: '28 July 2022', 2025: '4 July 2025' } as const;
type Year = keyof typeof NOON;
const at = (year: Year, hour: number): number => NOON[year] + (hour - 12) * HOUR;
/** An hour of the day of a picture (UTC), the part stopping there. */
const hour = (year: Year, from: number) => ({
  atJd: s(at(year, from), WORLDVIEW, `${String(from)}:00 UTC on ${DAY[year]}.`),
  untilJd: s(at(year, from + 1), WORLDVIEW, `${String(from + 1)}:00 UTC on ${DAY[year]}.`),
});

const SENTINEL_CREDIT =
  'NASA Worldview, NASA Earth Science Data and Information System (ESDIS); HLS from NASA LP DAAC; contains modified Copernicus Sentinel data 2016';
const LANDSAT_CREDIT =
  'NASA Worldview, NASA Earth Science Data and Information System (ESDIS); HLS from NASA LP DAAC; Landsat data from the U.S. Geological Survey';

/** One picture, on show from its own part until the next picture takes its place. */
const picture = (year: Year, camera: string, credit: string, untilJd: number): StormPicture => ({
  media: {
    file: `public/media/stories/ucayali-${String(year)}-${year === 2016 ? '07-15' : year === 2022 ? '07-28' : '07-04'}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyRiverPictureAlt',
    credit,
  },
  box: s(
    BOX,
    WORLDVIEW,
    `The square asked for: west, south, east, north; ${camera}, ${DAY[year]}.`,
  ),
  fromJd: s(
    at(year, 15),
    WORLDVIEW,
    `When the part that shows the picture of ${DAY[year]} begins.`,
  ),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/**
 * When the 3D close-up shows each thing: the bend's outside and inside, the years it is drawn
 * over (the first picture to the last), and the other worlds.
 */
export const UCAYALI_PARTS = {
  outsideJd: at(2016, 18),
  insideJd: at(2016, 19),
  fromJd: at(2016, 15),
  untilJd: at(2025, 15),
  deltaJd: at(2025, 16),
  marsJd: at(2025, 17),
  titanJd: at(2025, 18),
} as const;

/** The river up close, beside the globe looking straight down on the middle of the square. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [-74.35, -8.5] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const riverUcayali: Story = {
  id: 'river-ucayali',
  group: 'earth-at-work',
  kind: 'land',
  path: 'tracked',
  titleKey: 'storyRiverTitle',
  noteKey: 'storyRiverNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: UCAYALI_2016_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      picture(2016, 'Sentinel-2', SENTINEL_CREDIT, at(2022, 15)),
      picture(2022, 'Landsat', LANDSAT_CREDIT, at(2025, 15)),
      picture(2025, 'Landsat', LANDSAT_CREDIT, at(2025, 19)),
    ],
  },
  chapters: [
    {
      id: 'the-river',
      ...hour(2016, 15),
      text: {
        key: 'storyRiverRiver',
        sourceId: ROAD,
        quote:
          'Loggers harvested mahogany and cedar from the area, transporting the timber to the Ucayali River and floating it to the Peruvian city of Pucallpa.',
      },
      ...OVER,
    },
    {
      id: 'the-rain',
      ...hour(2016, 16),
      text: {
        key: 'storyRiverRain',
        sourceId: WATER_CYCLE,
        quote:
          'Some of it evaporates, returning to the atmosphere; some seeps into the ground as soil moisture or groundwater; and some runs off into rivers and streams.',
      },
      ...OVER,
    },
    {
      id: 'mud-from-the-andes',
      ...hour(2016, 17),
      text: {
        key: 'storyRiverMud',
        sourceId: MUD,
        quote: 'much of it from the foothills of the Andes Mountains in Peru and Bolivia.',
      },
      ...OVER,
    },
    {
      id: 'the-outside',
      ...hour(2016, 18),
      text: {
        key: 'storyRiverOutside',
        sourceId: CONGAREE,
        quote:
          'Water typically flows faster on the outside of bends, leading to more rapid erosion as the channel carves into the outer riverbank.',
      },
      ...OVER,
    },
    {
      id: 'the-inside',
      ...hour(2016, 19),
      text: {
        key: 'storyRiverInside',
        sourceId: CONGAREE,
        quote:
          'It moves more slowly on the inside of bends, resulting in the deposition of sediment and the growth of sandy features called point bars.',
      },
      ...OVER,
    },
    {
      id: 'the-bends-move',
      ...hour(2022, 15),
      text: {
        key: 'storyRiverMove',
        sourceId: AMAZON,
        quote: 'working their way across their valley floors, recycling floodplain sediment.',
      },
      ...OVER,
    },
    {
      id: 'cut-off',
      ...hour(2025, 15),
      text: {
        key: 'storyRiverCutOff',
        sourceId: AMAZON,
        quote: 'where crescent-shaped oxbow lakes are formed',
      },
      ...OVER,
    },
    {
      id: 'the-delta',
      ...hour(2025, 16),
      text: {
        key: 'storyRiverDelta',
        sourceId: YELLOW,
        quote: 'large amounts of sediment drop to the shallow bottom, building up new land',
      },
      ...OVER,
    },
    {
      id: 'mars',
      ...hour(2025, 17),
      text: {
        key: 'storyRiverMars',
        sourceId: JEZERO,
        quote:
          'More than 3.5 billion years ago, river channels spilled over the crater wall and created a lake.',
      },
      ...OVER,
    },
    {
      id: 'titan',
      ...hour(2025, 18),
      text: {
        key: 'storyRiverTitan',
        sourceId: TITAN,
        quote:
          'Titan’s surface is sculpted by flowing methane and ethane, which carves river channels',
      },
      ...OVER,
    },
  ],
  endJd: s(at(2025, 19), WORLDVIEW, `19:00 UTC on ${DAY[2025]}.`),
  sources: [
    NASA_EARTH_OBSERVATORY_UCAYALI_ROAD,
    NASA_EARTH_OBSERVATORY_MUD_ANDES,
    NASA_EARTH_OBSERVATORY_CONGAREE,
    NASA_EARTH_OBSERVATORY_MEANDERING_AMAZON,
    NASA_EARTH_OBSERVATORY_WATER_CYCLE,
    NASA_EARTH_OBSERVATORY_YELLOW_RIVER_DELTA,
    NASA_JEZERO_CRATER,
    NASA_TITAN_FACTS,
    NASA_WORLDVIEW_UCAYALI,
    JPL_HORIZONS_TURN_UCAYALI_2016_EARTH,
  ],
};
