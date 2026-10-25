// A river flood, in real pictures: the Gandak (also called the Narayani), which runs out of
// the mountains of Nepal into India, swollen by storms at the end of September 2026. NASA
// Earth Observatory wrote it up as "Rains Swamp the Gandak River". Chosen because it was seen
// well from space before, during and after, and because the page tells it as what the rain
// and the river did.
// Each part is what the MODIS camera on NASA's Terra or Aqua satellite saw that day, from
// NASA Worldview, in the same false colour as the page's own pictures (bands 7, 2 and 1):
// water is blue, plants bright green, clouds pale blue. The screen says the colours are
// changed. Worldview gives the day of each picture and not its minute; Terra passes in the
// morning and Aqua in the afternoon, and the hours each part shows keep to that and are
// otherwise a choice. The square is about 240 km across; it is shown up close, beside the
// globe, as the avalanche's is.
// The close-up is a 3D drawing of the river between its banks, rising and spilling over, with
// a measuring post whose highest mark is the one the page gives. How the water rose day by
// day is not on the page and is a drawing.
// The last two parts rest on NOAA's pages: what a flood is and how long one lasts (the
// National Severe Storms Laboratory), and why no one should go into flood water (the National
// Weather Service).
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { StormPicture, Story } from '../types';
import { GANDAK_2026_EARTH_TURN } from '../paths/gandak2026EarthTurn';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_GANDAK_2026_EARTH,
  NASA_EARTH_OBSERVATORY_GANDAK,
  NASA_WORLDVIEW_GANDAK,
  NOAA_NSSL_FLOODS,
  NWS_TURN_AROUND_DONT_DROWN,
} from './sources';

const GANDAK = 'nasa-earth-observatory-gandak-2026';
const WORLDVIEW = 'nasa-worldview-gandak-2026';
const NSSL = 'noaa-nssl-floods';
const NWS = 'nws-turn-around-dont-drown';

/** The square every picture covers: west, south, east, north. */
const BOX = [83.4, 25.6, 85.6, 27.8] as const;
/** Noon (UTC) of 20 September 2026, as a Julian date. */
const NOON_20_SEPTEMBER = 2461304;
const HOUR = 1 / 24;
type Month = 'September' | 'October';
/** The Julian date of an hour (UTC) of a day of September or October 2026. */
const at = (month: Month, day: number, hour: number): number =>
  NOON_20_SEPTEMBER + (month === 'October' ? 10 : -20) + day + (hour - 12) * HOUR;

/** An hour of a day of 2026 (UTC). */
const hour = (month: Month, day: number, from: number) => ({
  atJd: s(
    at(month, day, from),
    WORLDVIEW,
    `${String(from)}:00 UTC on ${String(day)} ${month} 2026.`,
  ),
  untilJd: s(
    at(month, day, from + 1),
    WORLDVIEW,
    `${String(from + 1)}:00 UTC on ${String(day)} ${month} 2026.`,
  ),
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
    file: `public/media/stories/gandak-${name}.webp`,
    kind: 'false-colour',
    role: 'picture',
    altKey: 'storyFloodPictureAlt',
    credit: 'NASA Worldview, NASA Earth Science Data and Information System (ESDIS)',
  },
  box: s(BOX, WORLDVIEW, `The square asked for: west, south, east, north; ${camera}, ${date}.`),
  fromJd: s(fromJd, WORLDVIEW, `When the part that shows the picture of ${date} begins.`),
  untilJd: s(untilJd, WORLDVIEW, 'When the next picture takes its place, or the story ends.'),
});

/**
 * What the 3D close-up draws from the page: the highest the water stood on the measuring
 * post at Devghat, and when; and the stretch of the storms.
 */
export const GANDAK_FLOOD = {
  gaugePeakM: s(
    11.94,
    GANDAK,
    'a gauge in Devghāṭ reached as high as 11.94 meters on September 27',
  ),
  peakJd: s(at('September', 27, 6), GANDAK, '27 September 2026; the hour is a choice.'),
  rainFromJd: s(at('September', 24, 0), GANDAK, 'The storms of 24 to 27 September 2026.'),
  rainUntilJd: s(at('September', 28, 0), GANDAK, 'The storms of 24 to 27 September 2026.'),
} as const;

/** The river up close, beside the globe looking straight down on the middle of its square. */
const OVER = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
  overPlace: s(
    [84.5, 26.7] as const,
    WORLDVIEW,
    'The middle of the square asked for: a choice of framing.',
  ),
} as const;

export const floodGandak: Story = {
  id: 'flood-gandak',
  group: 'earth-at-work',
  kind: 'weather',
  path: 'tracked',
  titleKey: 'storyFloodTitle',
  noteKey: 'storyFloodNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: GANDAK_2026_EARTH_TURN },
  groundPictures: {
    onId: 'earth',
    upClose: true,
    pictures: [
      picture(
        '2026-09-20',
        'MODIS on Terra',
        at('September', 20, 5),
        at('September', 25, 5),
        '20 September 2026',
      ),
      picture(
        '2026-09-25',
        'MODIS on Terra',
        at('September', 25, 5),
        at('September', 27, 8),
        '25 September 2026',
      ),
      picture(
        '2026-09-27',
        'MODIS on Aqua',
        at('September', 27, 8),
        at('September', 29, 8),
        '27 September 2026',
      ),
      picture(
        '2026-09-29',
        'MODIS on Aqua',
        at('September', 29, 8),
        at('October', 12, 5),
        '29 September 2026',
      ),
      picture(
        '2026-10-12',
        'MODIS on Terra',
        at('October', 12, 5),
        at('October', 12, 7),
        '12 October 2026',
      ),
    ],
  },
  chapters: [
    {
      id: 'the-river',
      ...hour('September', 20, 5),
      text: {
        key: 'storyFloodRiver',
        sourceId: GANDAK,
        quote: 'Floodwater appears blue; vegetation is bright green; clouds are light blue.',
      },
      ...OVER,
    },
    {
      id: 'what-is-a-flood',
      ...hour('September', 20, 6),
      text: {
        key: 'storyFloodWhat',
        sourceId: NSSL,
        quote: 'Flooding is an overflowing of water onto land that is normally dry.',
      },
      ...OVER,
    },
    {
      id: 'the-rain',
      ...hour('September', 25, 5),
      text: {
        key: 'storyFloodRain',
        sourceId: GANDAK,
        quote:
          'Storms drenched Nepal’s mountainous Lumbini and Gandaki provinces with waves of torrential rain',
      },
      ...OVER,
    },
    {
      id: 'the-river-rises',
      ...hour('September', 27, 8),
      text: {
        key: 'storyFloodRises',
        sourceId: GANDAK,
        quote: 'a gauge in Devghāṭ reached as high as 11.94 meters on September 27',
      },
      ...OVER,
    },
    {
      id: 'over-the-banks',
      ...hour('September', 29, 8),
      text: {
        key: 'storyFloodBanks',
        sourceId: GANDAK,
        quote:
          'water overtopped and breached embankments in several areas, inundating farmland and settlements',
      },
      ...OVER,
    },
    {
      id: 'the-water-goes',
      ...hour('October', 12, 5),
      text: {
        key: 'storyFloodGoes',
        sourceId: NSSL,
        quote:
          'Floods can occur within minutes or over a long period, and may last days, weeks, or longer.',
      },
      ...OVER,
    },
    {
      id: 'stay-safe',
      ...hour('October', 12, 6),
      text: {
        key: 'storyFloodSafe',
        sourceId: NWS,
        quote: 'A mere 6 inches of fast-moving flood water can knock over an adult.',
      },
      ...OVER,
    },
  ],
  endJd: s(at('October', 12, 7), WORLDVIEW, '07:00 UTC on 12 October 2026.'),
  sources: [
    NASA_EARTH_OBSERVATORY_GANDAK,
    NASA_WORLDVIEW_GANDAK,
    NOAA_NSSL_FLOODS,
    NWS_TURN_AROUND_DONT_DROWN,
    JPL_HORIZONS_TURN_GANDAK_2026_EARTH,
  ],
};
