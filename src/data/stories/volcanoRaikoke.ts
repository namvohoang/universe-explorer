// A volcano's cloud of ash, in real pictures: Raikoke, a small island of the Kuril Islands,
// which erupted on 22 June 2019 after being quiet since 1924, and which NASA Earth Observatory
// wrote up as "Raikoke Erupts". Chosen because it was seen well from space on the day and
// because the page tells it as what the ash and the air did.
// Nothing here is drawn. Each part is what a satellite's camera saw that day, from NASA
// Worldview, laid on the globe at its true place and size: the day before, under cloud; the
// morning of the eruption, from the MODIS camera on Terra; a few hours later, from the VIIRS
// camera on Suomi NPP; and the day after. The ash is the brown streak over the white cloud.
// Worldview gives the day of each picture and not its minute. The page says the Terra picture
// is of "the morning of June 22" and the VIIRS one "a few hours later"; the hours each part
// shows keep that order and are otherwise a choice. Each picture is left on show until the
// next takes its place. The place looked down on is the middle of the pictures' square, a
// choice of framing: no number for where the island lies is written here. Earth is turned the
// way it faced at the first instant (JPL Horizons).
// Not shown: the photograph astronauts took of the rising column, the cloud of gas that went
// on round the north of the world, and a slice through the mountain, for which no measured
// shape was read.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { RAIKOKE_2019_EARTH_TURN } from '../paths/raikoke2019EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_RAIKOKE_2019_EARTH,
  NASA_EARTH_OBSERVATORY_RAIKOKE,
  NASA_WORLDVIEW_RAIKOKE,
} from './sources';

const RAIKOKE = 'nasa-earth-observatory-raikoke-erupts';
const WORLDVIEW = 'nasa-worldview-raikoke-2019';

/** The square every picture covers: west, south, east, north. */
const BOX = [150, 42, 162, 54] as const;
/** Noon (UTC) of 21 June 2019, as a Julian date. */
const NOON_21_JUNE = 2458656;
const HOUR = 1 / 24;
/** The Julian date of an hour (UTC) of a day of June 2019. */
const at = (day: number, hour: number): number => NOON_21_JUNE + (day - 21) + (hour - 12) * HOUR;

/** Some hours of a day of June 2019 (UTC). */
const hours = (day: number, from: number, until: number) => ({
  atJd: s(at(day, from), WORLDVIEW, `${String(from)}:00 UTC on ${String(day)} June 2019.`),
  untilJd: s(at(day, until), WORLDVIEW, `${String(until)}:00 UTC on ${String(day)} June 2019.`),
});

/** One picture, on show from its own part until the next picture takes its place. */
const picture = (
  name: string,
  camera: string,
  fromJd: number,
  untilJd: number,
  date: string,
): StormPicture => ({
  media: {
    file: `public/media/stories/raikoke-${name}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyVolcanoPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(BOX, WORLDVIEW, `The square asked for: west, south, east, north; ${camera}, ${date}.`),
  fromJd: s(fromJd, WORLDVIEW, `When the part that shows the picture of ${date} begins.`),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/** Looking straight down on the middle of the pictures' square. */
const over = {
  lookAtId: 'earth',
  closeUp: true,
  overPlace: s(
    [156, 48] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

/** Looking straight down on the middle of the pictures' square, with dynamic 3D close up simulation beside it. */
const CUT_OPEN = {
  ...over,
  slice: true,
} as const;

export const volcanoRaikoke: Story = {
  id: 'volcano-raikoke',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyVolcanoTitle',
  noteKey: 'storyVolcanoNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: RAIKOKE_2019_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    pictures: [
      picture('2019-06-21', 'VIIRS on Suomi NPP', at(21, 2), at(22, 0), '21 June 2019'),
      picture('2019-06-22-morning', 'MODIS on Terra', at(22, 0), at(22, 3), '22 June 2019'),
      picture('2019-06-22', 'VIIRS on Suomi NPP', at(22, 3), at(23, 2), '22 June 2019'),
      picture('2019-06-23', 'VIIRS on Suomi NPP', at(23, 2), at(23, 4), '23 June 2019'),
    ],
  },
  chapters: [
    {
      id: 'quiet',
      ...hours(21, 2, 4),
      text: {
        key: 'storyVolcanoQuiet',
        sourceId: RAIKOKE,
        quote: 'The small, oval-shaped island most recently exploded in 1924 and in 1778.',
      },
      ...CUT_OPEN,
    },
    {
      id: 'erupts',
      ...hours(22, 0, 2),
      text: {
        key: 'storyVolcanoErupts',
        sourceId: RAIKOKE,
        quote:
          'The dormant period ended around 4:00 a.m. local time on June 22, 2019, when a vast plume of ash and volcanic gases shot up from its 700-meter-wide crater.',
      },
      ...CUT_OPEN,
    },
    {
      id: 'the-wind',
      ...hours(22, 3, 4),
      text: {
        key: 'storyVolcanoWind',
        sourceId: RAIKOKE,
        quote:
          'After an initial surge of activity that included several distinct explosive pulses, activity subsided and strong winds spread the ash across the Pacific.',
      },
      ...CUT_OPEN,
    },
    {
      id: 'how-high',
      ...hours(22, 4, 5),
      text: {
        key: 'storyVolcanoHowHigh',
        sourceId: RAIKOKE,
        quote:
          'have issued several notes to aviators indicating that ash had reached an altitude of 13 kilometers (8 miles). Meanwhile, data from the CALIPSO satellite indicate that parts of the plume may have reached 17 kilometers (10 miles).',
      },
      ...CUT_OPEN,
    },
    {
      id: 'a-day-later',
      ...hours(23, 2, 3),
      text: {
        key: 'storyVolcanoDayLater',
        sourceId: RAIKOKE,
        quote: 'By the next day, just a faint remnant of the ash remained visible to MODIS.',
      },
      ...CUT_OPEN,
    },
    {
      id: 'pilots',
      ...hours(23, 3, 4),
      text: {
        key: 'storyVolcanoPilots',
        sourceId: RAIKOKE,
        quote:
          'Since ash contains sharp fragments of rock and volcanic glass, it poses a serious hazard to aircraft. The Tokyo and Anchorage Volcanic Ash Advisory Centers have been tracking the plume closely and have issued several notes to aviators',
      },
      ...CUT_OPEN,
    },
  ],
  endJd: s(at(23, 4), WORLDVIEW, '4:00 UTC on 23 June 2019.'),
  sources: [
    NASA_EARTH_OBSERVATORY_RAIKOKE,
    NASA_WORLDVIEW_RAIKOKE,
    JPL_HORIZONS_TURN_RAIKOKE_2019_EARTH,
  ],
};
