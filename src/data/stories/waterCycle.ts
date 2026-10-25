// The water cycle: how water goes round and round between the sea, the air and the land. It is
// not one event but goes on all the time everywhere, so its picture is the whole world on one
// day: what the VIIRS camera on NOAA-20 saw on 20 March 2026, from NASA Worldview, every
// cloud in it water on the move. An equinox was picked so that both poles are in daylight;
// even so a thin strip at each pole is dark.
// The sentences rest on NASA's page for children "What Is the Water Cycle?", and how much of
// the water is in the sea on NOAA's Ocean Service.
// The close-up is a 3D drawing of the cycle: the Sun warming the sea, water vapour rising from
// it and from plants, clouds forming, rain and snow falling on the mountains, and rivers
// carrying the water back to the sea. Every part of it is a drawing; the hours each part shows
// are a choice.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { WATER_CYCLE_2026_EARTH_TURN } from '../paths/waterCycle2026EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_WATER_CYCLE_2026_EARTH,
  NASA_KIDS_WATER_CYCLE,
  NASA_WORLDVIEW_WORLD_2026,
  NOAA_OCEAN_WATER,
} from './sources';

const KIDS = 'nasa-kids-water-cycle';
const OCEAN = 'noaa-ocean-water';
const WORLDVIEW = 'nasa-worldview-world-2026';

/** Noon (UTC) of 20 March 2026, as a Julian date. */
const NOON_20_MARCH = 2461120;
const HOUR = 1 / 24;
const at = (hour: number): number => NOON_20_MARCH + (hour - 12) * HOUR;
/** An hour of 20 March 2026 (UTC). */
const hour = (from: number) => ({
  atJd: s(at(from), WORLDVIEW, `${String(from)}:00 UTC on 20 March 2026.`),
  untilJd: s(at(from + 1), WORLDVIEW, `${String(from + 1)}:00 UTC on 20 March 2026.`),
});

/** When the 3D close-up shows each part of the cycle: the story's parts, in order. */
export const WATER_CYCLE_PARTS = {
  oceanJd: at(13),
  evaporationJd: at(14),
  plantsJd: at(15),
  cloudsJd: at(16),
  rainJd: at(17),
  backJd: at(18),
} as const;

/** The cycle up close, beside the globe with the day's clouds laid on it. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s([0, 20] as const, WORLDVIEW, 'Over Africa and the Atlantic: a choice of framing.'),
} as const;

export const waterCycle: Story = {
  id: 'water-cycle',
  group: 'earth-at-work',
  kind: 'weather',
  path: 'tracked',
  titleKey: 'storyWaterCycleTitle',
  noteKey: 'storyWaterCycleNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: WATER_CYCLE_2026_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      {
        media: {
          file: 'public/media/stories/water-cycle-2026-03-20.webp',
          kind: 'composite',
          role: 'picture',
          altKey: 'storyWaterCyclePictureAlt',
          credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
        },
        box: s(
          [-180, -90, 180, 90] as const,
          WORLDVIEW,
          'The whole world; VIIRS on NOAA-20, 20 March 2026.',
        ),
        fromJd: s(at(12), WORLDVIEW, 'The first instant of the story.'),
        untilJd: s(at(19), WORLDVIEW, 'The end of the story.'),
      },
    ],
  },
  chapters: [
    {
      id: 'the-whole-world',
      ...hour(12),
      text: {
        key: 'storyWaterCycleWorld',
        sourceId: KIDS,
        quote: 'The water cycle is the path that all water follows as it moves around Earth.',
      },
      ...OVER,
    },
    {
      id: 'the-ocean',
      ...hour(13),
      text: {
        key: 'storyWaterCycleOcean',
        sourceId: OCEAN,
        quote: 'About 97 percent of Earth’s water is in the ocean.',
      },
      ...OVER,
    },
    {
      id: 'evaporation',
      ...hour(14),
      text: {
        key: 'storyWaterCycleEvaporation',
        sourceId: KIDS,
        quote: 'Heat from sunlight causes water to evaporate from oceans, lakes, and streams.',
      },
      ...OVER,
    },
    {
      id: 'plants',
      ...hour(15),
      text: {
        key: 'storyWaterCyclePlants',
        sourceId: KIDS,
        quote: 'Water from plants and trees also evaporates into the atmosphere.',
      },
      ...OVER,
    },
    {
      id: 'clouds',
      ...hour(16),
      text: {
        key: 'storyWaterCycleClouds',
        sourceId: KIDS,
        quote:
          'This causes the water vapor to turn back into liquid water in a process known as condensation.',
      },
      ...OVER,
    },
    {
      id: 'rain-and-snow',
      ...hour(17),
      text: {
        key: 'storyWaterCycleRain',
        sourceId: KIDS,
        quote: 'it falls from the sky as rain or snow — also known as precipitation.',
      },
      ...OVER,
    },
    {
      id: 'back-to-the-sea',
      ...hour(18),
      text: {
        key: 'storyWaterCycleBack',
        sourceId: KIDS,
        quote:
          'When temperatures warm up, it melts and water flows into oceans, lakes, and streams.',
      },
      ...OVER,
    },
  ],
  endJd: s(at(19), WORLDVIEW, '19:00 UTC on 20 March 2026.'),
  sources: [
    NASA_KIDS_WATER_CYCLE,
    NOAA_OCEAN_WATER,
    NASA_WORLDVIEW_WORLD_2026,
    JPL_HORIZONS_TURN_WATER_CYCLE_2026_EARTH,
  ],
};
