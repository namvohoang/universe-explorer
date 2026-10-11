// A hurricane, from the record of a real one: Hurricane Sam, which crossed the Atlantic from
// 22 September to 5 October 2021 and stayed out at sea. It was chosen because it was measured
// well (aircraft flew into it, and a sail drone went through its wall) and because the US
// National Hurricane Center's report on it says "There were no casualties associated with Sam."
// Where the storm's middle is, and the line of where it has been, are the hurricane centre's
// best track, one record every six hours; between two records the middle is moved along the
// ground. Earth is turned the way it faced at the first instant (JPL Horizons), so the storm
// is over the right sea. The dates here are clock time (UTC), as the track's are; Horizons'
// own clock was 69 s ahead, which is nothing to a storm that is on record every six hours.
// In each part the storm itself is a real picture: what the VIIRS camera on one of two
// satellites saw that afternoon, from NASA Worldview, laid on the globe at its true place and
// size. Each is a picture of one moment (the satellites pass at about half past one in the
// afternoon, by the Sun, which over the middle of the Atlantic is between 16:00 and 18:00 UTC)
// shown for three hours, while the line of the storm's middle goes on along its record. Of the
// two satellites, the one whose passes do not join across the storm was picked for each day.
// Between the days there is no picture, and the cloud is a drawing, which the screen says: a
// spiral as wide as the record says gales reached, turning the way storms north of the equator
// turn, with an eye drawn big enough to see. A real hurricane's cloud spreads much wider than
// its gales, as the pictures show.
// Each part shows three hours round the middle of the day over the storm, 15:00 to 18:00 UTC,
// when the Sun is high over the middle of the Atlantic; the days between are run through quickly.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { SAM_2021_EARTH_TURN } from '../paths/sam2021EarthTurn';
import { SAM_2021_TRACK } from '../paths/sam2021Track';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_SAM_2021_EARTH,
  NASA_SPACE_PLACE_HURRICANES,
  NASA_WORLDVIEW_SAM,
  NHC_HURDAT2_SAM,
  NHC_REPORT_SAM,
} from './sources';

const TRACK = 'nhc-hurdat2-al182021';
const REPORT = 'nhc-tcr-al182021';
const NASA = 'nasa-space-place-hurricanes';
const WORLDVIEW = 'nasa-worldview-sam-2021';

/**
 * Three hours of a day of the track, given the Julian date of its record for 12:00 UTC: from
 * 15:00, half way to the next record, until that record at 18:00.
 */
const afternoon = (noonJd: number, day: string) => ({
  atJd: s(noonJd + 0.125, TRACK, `15:00 UTC on ${day}, half way between two records.`),
  untilJd: s(noonJd + 0.25, TRACK, `The record of 18:00 UTC on ${day}.`),
});
/** The picture of one day, shown for the same three hours as the part of the story of that day. */
const picture = (
  day: string,
  box: readonly [number, number, number, number],
  noonJd: number,
  date: string,
): StormPicture => ({
  media: {
    file: `public/media/stories/sam-${day}.webp`,
    kind: 'composite',
    role: 'picture',
    altKey: 'storyHurricanePictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(box, WORLDVIEW, `The square asked for: west, south, east, north, on ${date}.`),
  fromJd: s(noonJd + 0.125, TRACK, `15:00 UTC on ${date}.`),
  untilJd: s(noonJd + 0.25, TRACK, `18:00 UTC on ${date}.`),
});

const OVER_THE_STORM = { lookAtId: 'earth', closeUp: true, overStorm: true } as const;

export const hurricaneSam: Story = {
  id: 'hurricane-sam',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyHurricaneTitle',
  noteKey: 'storyHurricaneNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: SAM_2021_EARTH_TURN },
  storm: {
    onId: 'earth',
    track: SAM_2021_TRACK,
    slice: {
      atJd: s(2459484.25, TRACK, 'The record of 18:00 UTC on 26 September 2021.'),
      eyeRadiusKm: s(
        6.482,
        REPORT,
        'Half of "a diameter of near 7 n mi late on 26 September": 3.5 nautical miles of 1.852 km.',
      ),
      wallReachKm: s(
        39.355,
        TRACK,
        'The same file’s record for 18:00 UTC on 26 September gives winds of hurricane force (64 knots) out to 25, 20, 20 and 20 nautical miles in its four quarters: their mean, 21.25, times 1.852 km.',
      ),
    },
    pictures: [
      picture('2021-09-23', [-54, -4, -24, 26], 2459481, '23 September 2021'),
      picture('2021-09-24', [-59, -3, -29, 27], 2459482, '24 September 2021'),
      picture('2021-09-25', [-63, -2, -33, 28], 2459483, '25 September 2021'),
      picture('2021-09-26', [-65, -1, -35, 29], 2459484, '26 September 2021'),
      picture('2021-09-28', [-70, 3, -40, 33], 2459486, '28 September 2021'),
      picture('2021-09-30', [-75, 8, -45, 38], 2459488, '30 September 2021'),
      picture('2021-10-02', [-74, 20, -44, 50], 2459490, '2 October 2021'),
      picture('2021-10-04', [-59, 29, -29, 59], 2459492, '4 October 2021'),
    ],
  },
  chapters: [
    {
      id: 'born',
      ...afternoon(2459481, '23 September 2021'),
      text: {
        key: 'storyHurricaneBorn',
        sourceId: REPORT,
        quote:
          'Sam formed from a well-defined tropical wave that moved off the west coast of Africa late on 19 September.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'warm-sea',
      ...afternoon(2459482, '24 September 2021'),
      text: {
        key: 'storyHurricaneWarmSea',
        sourceId: NASA,
        quote:
          "The whole system of clouds and wind spins and grows, fed by the ocean's heat and water evaporating from the surface.",
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'spins',
      ...afternoon(2459483, '25 September 2021'),
      text: {
        key: 'storyHurricaneSpins',
        sourceId: NASA,
        quote:
          "Storms that form north of the equator spin counterclockwise. Storms south of the equator spin clockwise. This difference is because of Earth's rotation on its axis.",
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'the-eye',
      atJd: s(2459484.125, TRACK, '15:00 UTC on 26 September 2021, half way between two records.'),
      text: {
        key: 'storyHurricaneEye',
        sourceId: NASA,
        quote:
          'As the storm system rotates faster and faster, an eye forms in the center. It is very calm and clear in the eye, with very low air pressure.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'cut-in-half',
      atJd: s(2459484.166667, TRACK, '16:00 UTC on 26 September 2021, between two records.'),
      text: {
        key: 'storyHurricaneCut',
        sourceId: NASA,
        quote:
          "The small red arrows show warm, moist air rising from the ocean's surface, and forming clouds in bands around the eye. The blue arrows show how cool, dry air sinks in the eye and between the bands of clouds.",
      },
      ...OVER_THE_STORM,
      slice: true,
    },
    {
      id: 'strongest',
      atJd: s(2459484.208333, TRACK, '17:00 UTC on 26 September 2021, between two records.'),
      untilJd: s(2459484.25, TRACK, 'The record of 18:00 UTC on 26 September 2021.'),
      text: {
        key: 'storyHurricaneStrongest',
        sourceId: REPORT,
        // 135 knots is 250 km/h (a knot is 1.852 km/h); the track gives the same wind at 18:00.
        quote: 'reached its peak intensity of 135 kt around 1800 UTC that day',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'names',
      ...afternoon(2459486, '28 September 2021'),
      text: {
        key: 'storyHurricaneNames',
        sourceId: NASA,
        quote:
          'People call these storms by other names, such as typhoons or cyclones, depending on where they occur.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'flying-in',
      ...afternoon(2459488, '30 September 2021'),
      text: {
        key: 'storyHurricaneFlyingIn',
        sourceId: REPORT,
        quote:
          'The saildrone, which encountered the northeastern eyewall of the hurricane and came within about 17 n mi east-northeast of the center on 30 September',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'out-at-sea',
      ...afternoon(2459490, '2 October 2021'),
      text: {
        key: 'storyHurricaneOutAtSea',
        sourceId: REPORT,
        // The report's first page: "its core remained east of the island, well out to sea".
        quote: 'There were no casualties associated with Sam.',
      },
      ...OVER_THE_STORM,
    },
    {
      id: 'fades',
      ...afternoon(2459492, '4 October 2021'),
      text: {
        key: 'storyHurricaneFades',
        sourceId: REPORT,
        quote:
          'gradually weakening but maintaining hurricane-force winds. By 0600 UTC 5 October, the system’s cloud pattern became highly asymmetric and elongated which indicated that Sam had become an extratropical cyclone.',
      },
      ...OVER_THE_STORM,
    },
  ],
  endJd: s(2459492.25, TRACK, 'The record of 18:00 UTC on 4 October 2021.'),
  sources: [
    NHC_HURDAT2_SAM,
    NHC_REPORT_SAM,
    NASA_SPACE_PLACE_HURRICANES,
    NASA_WORLDVIEW_SAM,
    JPL_HORIZONS_TURN_SAM_2021_EARTH,
  ],
};
