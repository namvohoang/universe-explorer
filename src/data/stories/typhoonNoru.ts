// A typhoon that reached Vietnam, from the record of a real one: Typhoon Noru, which crossed
// the Philippines on 25 September 2022 and came ashore in central Vietnam on 28 September. It
// was chosen because NASA wrote it up, because it grew faster than almost any storm on record,
// and because of what was done before it came: NASA says "Hundreds of thousands of people in
// Vietnam were preparing to evacuate in advance of the storm." It was not harmless: people
// died in the Philippines and in Vietnam. As the owner decided for these stories, it is told
// as what the sea and the air did and what kept people safe, with no count of the dead.
// Where the storm's middle is, and the line of where it has been, are the Japan
// Meteorological Agency's best track, one record every six hours. Its wind is the mean over
// ten minutes, which reads lower than the 250 km/h NASA's page gives from an American agency
// for the same storm at its strongest (a mean over one minute); the story names no number.
// Earth is turned the way it faced at the first instant (JPL Horizons). The dates are clock
// time (UTC), as the track's are.
// In each part the storm is a real picture: what the VIIRS camera on the NOAA-20 satellite saw
// that day, from NASA Worldview, laid on the globe at its true place and size. The satellite
// passes at about half past one in the afternoon by the Sun, which over these seas is between
// 05:00 and 06:30 UTC; each part shows 03:00 to 06:00 UTC. Between the days there is no
// picture, and the cloud is a drawing, which the screen says.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { NORU_2022_EARTH_TURN } from '../paths/noru2022EarthTurn';
import { NORU_2022_TRACK } from '../paths/noru2022Track';
import { s } from './sourced';
import {
  JMA_BEST_TRACK_NORU,
  JPL_HORIZONS_TURN_NORU_2022_EARTH,
  NASA_EARTH_OBSERVATORY_NORU,
  NASA_SPACE_PLACE_HURRICANES,
  NASA_WORLDVIEW_NORU,
} from './sources';

const TRACK = 'jma-best-track-2216';
const NORU = 'nasa-earth-observatory-noru';
const NASA = 'nasa-space-place-hurricanes';
const WORLDVIEW = 'nasa-worldview-noru-2022';

/**
 * Three hours of a day of the track, given the Julian date of its record for 00:00 UTC: from
 * 03:00, half way to the next record, until that record at 06:00.
 */
const midday = (midnightJd: number, day: string) => ({
  atJd: s(midnightJd + 0.125, TRACK, `03:00 UTC on ${day}, half way between two records.`),
  untilJd: s(midnightJd + 0.25, TRACK, `The record of 06:00 UTC on ${day}.`),
});

/** The picture of one day, shown for the same three hours as the part of the story of that day. */
const picture = (
  day: string,
  box: readonly [number, number, number, number],
  midnightJd: number,
  date: string,
): StormPicture => ({
  media: {
    file: `public/media/stories/noru-${day}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyTyphoonPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(box, WORLDVIEW, `The square asked for: west, south, east, north, on ${date}.`),
  fromJd: s(midnightJd + 0.125, TRACK, `03:00 UTC on ${date}.`),
  untilJd: s(midnightJd + 0.25, TRACK, `06:00 UTC on ${date}.`),
});

const OVER_THE_STORM = { lookAtId: 'earth', closeUp: true, overStorm: true, slice: true } as const;

export const typhoonNoru: Story = {
  id: 'typhoon-noru',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyTyphoonTitle',
  noteKey: 'storyTyphoonNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: NORU_2022_EARTH_TURN },
  storm: {
    onId: 'earth',
    track: NORU_2022_TRACK,
    pictures: [
      picture('2022-09-23', [116, 3, 146, 33], 2459845.5, '23 September 2022'),
      picture('2022-09-24', [112, 1, 142, 31], 2459846.5, '24 September 2022'),
      picture('2022-09-25', [107, 0, 137, 30], 2459847.5, '25 September 2022'),
      picture('2022-09-26', [102, 1, 132, 31], 2459848.5, '26 September 2022'),
      picture('2022-09-27', [96, 1, 126, 31], 2459849.5, '27 September 2022'),
      picture('2022-09-28', [92, 1, 122, 31], 2459850.5, '28 September 2022'),
    ],
  },
  chapters: [
    {
      id: 'far-out-at-sea',
      ...midday(2459845.5, '23 September 2022'),
      text: {
        key: 'storyTyphoonFarOut',
        sourceId: NASA,
        quote:
          'People call these storms by other names, such as typhoons or cyclones, depending on where they occur.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'grows-fast',
      ...midday(2459846.5, '24 September 2022'),
      text: {
        key: 'storyTyphoonGrowsFast',
        sourceId: NORU,
        quote:
          'Meteorologists have only recorded a handful of storms that have ever intensified so much so quickly.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'the-philippines',
      ...midday(2459847.5, '25 September 2022'),
      text: {
        key: 'storyTyphoonPhilippines',
        sourceId: NORU,
        quote: 'Noru made landfall in the Philippines in the evening on September 25',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'over-the-sea-again',
      ...midday(2459848.5, '26 September 2022'),
      text: {
        key: 'storyTyphoonSeaAgain',
        sourceId: NORU,
        quote:
          'Noru weakened as it passed over the mountainous terrain of Luzon, but forecasters expected it to strengthen again to the equivalent of a category 3 storm as it passed over warm waters in the South China Sea.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'getting-ready',
      ...midday(2459849.5, '27 September 2022'),
      text: {
        key: 'storyTyphoonGettingReady',
        sourceId: NORU,
        quote:
          'Hundreds of thousands of people in Vietnam were preparing to evacuate in advance of the storm.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'ashore',
      ...midday(2459850.5, '28 September 2022'),
      text: {
        key: 'storyTyphoonAshore',
        sourceId: NASA,
        quote:
          'Tropical cyclones usually weaken when they hit land, because they are no longer being "fed" by the energy from the warm ocean waters.',
      },
      ...OVER_THE_STORM,
    },
  ],
  endJd: s(2459850.75, TRACK, 'The record of 06:00 UTC on 28 September 2022.'),
  sources: [
    JMA_BEST_TRACK_NORU,
    NASA_EARTH_OBSERVATORY_NORU,
    NASA_SPACE_PLACE_HURRICANES,
    NASA_WORLDVIEW_NORU,
    JPL_HORIZONS_TURN_NORU_2022_EARTH,
  ],
};
