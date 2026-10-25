// How a canyon is made: the Grand Canyon, told over 300 million years and ending on the real
// canyon today. Nobody saw it happen, so the story is `rebuilt`. What happened and when rests
// on NASA Earth Observatory's pages ("Grand Canyon", "Canyonlands' Grabens", "The Colorado
// River Cuts a Canyon", "Grand Canyon Geology Lessons on View"), and the comparison with Mars
// on NASA's "Valles Marineris: The Grand Canyon of Mars". NASA's own pages disagree on when the
// river began cutting (about 5 and about 10 million years ago), and the story says scientists
// are still working it out; USGS's own publications disagree too (PLAN.md 14.15).
// The years of the first part, from 300 million years ago, are the age of the canyon's
// exposed bedrock as "The Colorado River Cuts a Canyon" gives it; the layers are older at the
// bottom, which the drawing does not count.
// The last parts are today: the real canyon built from its measured heights (the USGS 3D
// Elevation Program, about 120 metres to a cell as asked for) with what Sentinel-2 saw on 21 May 2025 laid over it (NASA's Harmonized
// Landsat and Sentinel-2, through NASA Worldview).
// The story's instants are 21 May 2025, the day of the picture, one hour to a part; they only
// drive its clock, which counts the years.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { GRAND_CANYON_2025_EARTH_TURN } from '../paths/grandCanyon2025EarthTurn';
import { GRAND_CANYON_HEIGHTS } from '../paths/grandCanyonHeights';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_GRAND_CANYON_2025_EARTH,
  NASA_EARTH_OBSERVATORY_CANYONLANDS,
  NASA_EARTH_OBSERVATORY_COLORADO_CUTS,
  NASA_EARTH_OBSERVATORY_GRAND_CANYON,
  NASA_EARTH_OBSERVATORY_GRAND_CANYON_LESSONS,
  NASA_VALLES_MARINERIS,
  NASA_WORLDVIEW_GRAND_CANYON_2025,
  USGS_3DEP,
} from './sources';

const CANYON = 'nasa-earth-observatory-grand-canyon';
const CANYONLANDS = 'nasa-earth-observatory-canyonlands';
const CUTS = 'nasa-earth-observatory-colorado-cuts';
const LESSONS = 'nasa-earth-observatory-grand-canyon-lessons';
const VALLES = 'nasa-valles-marineris';
const WORLDVIEW = 'nasa-worldview-grand-canyon-2025';

/** Noon (UTC) of 21 May 2025, as a Julian date. */
const NOON_21_MAY = 2460817;
const HOUR = 1 / 24;
const at = (hour: number): number => NOON_21_MAY + (hour - 12) * HOUR;
/** An hour of the story's own clock, on the day of the picture (UTC). */
const hour = (from: number) => ({
  atJd: s(at(from), WORLDVIEW, `${String(from)}:00 UTC on 21 May 2025: the story's clock.`),
  untilJd: s(at(from + 1), WORLDVIEW, `${String(from + 1)}:00 UTC on 21 May 2025.`),
});
/** The years a part plays, from its source. */
const years = (fromYearsAgo: number, untilYearsAgo: number, sourceId: string, note: string) => ({
  yearsAgo: s([fromYearsAgo, untilYearsAgo] as const, sourceId, note),
});

/** When the 3D close-up lays the layers, lifts the land and cuts the canyon, in years ago. */
export const GRAND_CANYON_DRAWING = {
  layersFromYearsAgo: s(300e6, CUTS, 'The age of the exposed bedrock, roughly 300 million years.'),
  liftFromYearsAgo: s(
    60e6,
    CANYONLANDS,
    'About 60 million years ago, the oceanic plates in the Pacific began sliding underneath North America',
  ),
  cutFromYearsAgo: s(
    10e6,
    CANYONLANDS,
    'Starting about 10 million years ago, the Colorado River started chiseling into the plateau, carving a deep canyon.',
  ),
  todayFromJd: s(at(21), WORLDVIEW, 'The first part that is today.'),
} as const;

/** The canyon up close, beside the globe looking straight down on the middle of the square. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [-112.1, 36.15] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const canyonGrandCanyon: Story = {
  id: 'canyon-grand-canyon',
  group: 'earth-at-work',
  kind: 'land',
  path: 'rebuilt',
  titleKey: 'storyCanyonTitle',
  actorIds: ['earth', 'sun'],
  turned: { earth: GRAND_CANYON_2025_EARTH_TURN },
  land: GRAND_CANYON_HEIGHTS,
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      {
        media: {
          file: 'public/media/stories/grandcanyon-2025-05-21.webp',
          kind: 'composite',
          role: 'picture',
          altKey: 'storyCanyonPictureAlt',
          credit:
            'NASA Worldview, NASA Earth Science Data and Information System (ESDIS); HLS from NASA LP DAAC; contains modified Copernicus Sentinel data 2025',
        },
        box: s(
          [-112.3, 35.95, -111.9, 36.35] as const,
          WORLDVIEW,
          'The square asked for: west, south, east, north; Sentinel-2, 21 May 2025.',
        ),
        fromJd: s(at(16), WORLDVIEW, 'The first instant of the story.'),
        untilJd: s(at(23), WORLDVIEW, 'The end of the story.'),
      },
    ],
  },
  chapters: [
    {
      id: 'the-layers',
      ...years(300e6, 60e6, CUTS, 'From the age of the exposed bedrock.'),
      ...hour(16),
      text: {
        key: 'storyCanyonLayers',
        sourceId: CANYON,
        quote:
          'The multi-colored rock formations that reveal the millions of years of geologic history of the Canyon',
      },
      ...OVER,
    },
    {
      id: 'the-land-rises',
      ...years(60e6, 10e6, CANYONLANDS, 'From when the plates began sliding under North America.'),
      ...hour(17),
      text: {
        key: 'storyCanyonRises',
        sourceId: CANYONLANDS,
        quote:
          'About 60 million years ago, the oceanic plates in the Pacific began sliding underneath North America',
      },
      ...OVER,
    },
    {
      id: 'the-river-cuts',
      ...years(10e6, 1e6, CUTS, 'Over millions of years, as the land kept rising.'),
      ...hour(18),
      text: {
        key: 'storyCanyonCuts',
        sourceId: CUTS,
        quote:
          'Over millions of years, the mighty river carved through old sedimentary rocks even as the landmass was rising.',
      },
      ...OVER,
    },
    {
      id: 'why-it-cuts',
      ...years(1e6, 0, LESSONS, 'Up to today.'),
      ...hour(19),
      text: {
        key: 'storyCanyonWhy',
        sourceId: LESSONS,
        quote:
          'Geologists now know that a river can cut a canyon only if the Earth surface rises vertically.',
      },
      ...OVER,
    },
    {
      id: 'still-arguing',
      ...years(0, 0, CANYONLANDS, 'Today.'),
      ...hour(20),
      text: {
        key: 'storyCanyonArguing',
        sourceId: CANYONLANDS,
        quote:
          'Starting about 10 million years ago, the Colorado River started chiseling into the plateau, carving a deep canyon.',
      },
      ...OVER,
    },
    {
      id: 'the-real-canyon',
      ...years(0, 0, VALLES, 'Today.'),
      ...hour(21),
      text: {
        key: 'storyCanyonReal',
        sourceId: VALLES,
        quote:
          'By comparison, the Earth’s Grand Canyon in Arizona, USA is 800 kilometers long, 30 kilometers across, and 1.8 kilometers deep',
      },
      ...OVER,
    },
    {
      id: 'on-mars',
      ...years(0, 0, VALLES, 'Today.'),
      ...hour(22),
      text: {
        key: 'storyCanyonMars',
        sourceId: VALLES,
        quote: 'extends about 2,400 miles (3,870 kilometers) in length.',
      },
      ...OVER,
    },
  ],
  endJd: s(at(23), WORLDVIEW, '23:00 UTC on 21 May 2025.'),
  sources: [
    NASA_EARTH_OBSERVATORY_GRAND_CANYON,
    NASA_EARTH_OBSERVATORY_CANYONLANDS,
    NASA_EARTH_OBSERVATORY_COLORADO_CUTS,
    NASA_EARTH_OBSERVATORY_GRAND_CANYON_LESSONS,
    NASA_VALLES_MARINERIS,
    USGS_3DEP,
    NASA_WORLDVIEW_GRAND_CANYON_2025,
    JPL_HORIZONS_TURN_GRAND_CANYON_2025_EARTH,
  ],
};
