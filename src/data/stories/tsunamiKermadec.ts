// A tsunami, from the record of a real one: the tsunami of 4 March 2021 (UTC), set off by a
// magnitude 8.1 earthquake under the sea near Raoul Island in the Kermadec Islands, north of
// New Zealand. It was chosen because its arrival was timed at 121 gauges, right across the
// Pacific and beyond, and because it stayed small: the highest any of those gauges measured
// was 0.56 m, and NOAA's database records no deaths.
// Every dot is one of those gauges, lit at the instant the wave was measured arriving there.
// The pale band is the sea the front has just crossed, worked out by
// tools/tsunami/travel_times.py from the depth of the sea (NOAA's DEM Global Mosaic, on a
// grid of an eighth of a degree): a tsunami goes at the square root of gravity times depth,
// as NOAA says. The two do not always agree, and the screen says so. The worked-out time is
// within 6 per cent of the measured one at half the gauges and within 18 per cent at nine in
// ten, mostly too early: the wave is taken to begin at one point, and most gauges stand in
// harbours, far smaller than a cell of the grid, where the real wave comes later than in the
// open sea beside them. A test holds those figures (src/data/paths/kermadec2021Tsunami.test.ts).
// Two smaller earthquakes had set off smaller tsunamis in the hours before; they are not told.
// Earth is turned the way it faced 31 s before the start (JPL Horizons); the dates are clock
// time (UTC).
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { KERMADEC_2021_EARTH_TURN } from '../paths/kermadec2021EarthTurn';
import { KERMADEC_2021_TSUNAMI } from '../paths/kermadec2021Tsunami';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_KERMADEC_2021_EARTH,
  NOAA_DEM_GLOBAL_MOSAIC,
  NOAA_JETSTREAM_TSUNAMI_GENERATION,
  NOAA_JETSTREAM_TSUNAMI_PROPAGATION,
  NOAA_JETSTREAM_TSUNAMI_WARNING,
  NOAA_TSUNAMI_KERMADEC_2021,
} from './sources';

const RECORD = 'noaa-tsunami-5771';
const GENERATION = 'noaa-jetstream-tsunami-generation';
const PROPAGATION = 'noaa-jetstream-tsunami-propagation';
const WARNING = 'noaa-jetstream-tsunami-warning';

const START_JD = KERMADEC_2021_TSUNAMI.originJd.value;
const MINUTES_PER_DAY = 1440;
/** An instant so many minutes after the tsunami began. */
const after = (minutes: number, note: string) =>
  s(START_JD + minutes / MINUTES_PER_DAY, RECORD, note);

/** Looking straight down on a place: a choice of framing. */
const over = (lonDegEast: number, latDegNorth: number, why: string) =>
  ({
    lookAtId: 'earth',
    closeUp: true,
    overPlace: s([lonDegEast, latDegNorth] as const, RECORD, why),
  }) as const;
/** With the sea cut open as the close look, and the Pacific / Earth beside it. */
const CUT_OPEN = (lonDegEast: number, latDegNorth: number, why: string) =>
  ({ ...over(lonDegEast, latDegNorth, why), slice: true }) as const;

export const tsunamiKermadec: Story = {
  id: 'tsunami-kermadec',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyTsunamiTitle',
  noteKey: 'storyTsunamiNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: KERMADEC_2021_EARTH_TURN },
  tsunami: {
    onId: 'earth',
    record: KERMADEC_2021_TSUNAMI,
    arrivalMap: {
      file: KERMADEC_2021_TSUNAMI.arrivalMap.file,
      kind: 'simulation',
      role: 'picture',
      altKey: 'storyTsunamiMapAlt',
    },
    depths: s(
      'A grid of an eighth of a degree over the whole world.',
      'noaa-dem-global-mosaic',
      'Asked of the image service on 2026-10-12 by tools/tsunami/travel_times.py.',
    ),
  },
  chapters: [
    {
      id: 'sea-floor',
      atJd: after(0, 'The instant the tsunami began: 19:28:31 UTC.'),
      text: {
        key: 'storyTsunamiSeaFloor',
        sourceId: GENERATION,
        quote:
          'An earthquake along a subduction zone happens when the leading edge of the overriding plate breaks free and springs seaward, raising the sea floor and the water above it. This uplift starts a tsunami.',
      },
      ...CUT_OPEN(-177.267, -29.74, 'The place the tsunami began.'),
    },
    {
      id: 'every-direction',
      atJd: after(20, 'Twenty minutes after it began.'),
      text: {
        key: 'storyTsunamiEveryDirection',
        sourceId: PROPAGATION,
        quote: 'Once generated, tsunamis radiate outward in all directions from their source.',
      },
      ...CUT_OPEN(-177.267, -29.74, 'The place the tsunami began.'),
    },
    {
      id: 'fast-and-slow',
      atJd: after(90, 'An hour and a half after it began.'),
      text: {
        key: 'storyTsunamiFastAndSlow',
        sourceId: PROPAGATION,
        quote:
          'The deeper the water, the faster they move. In the deep ocean, tsunamis can move as fast as a jet plane, over 500 mph (800 km/h), and can cross entire oceans in less than a day.',
      },
      ...CUT_OPEN(-168, -22, 'East of where it began, where the band is crossing deep sea.'),
    },
    {
      id: 'gauges',
      atJd: after(180, 'Three hours after it began.'),
      text: {
        key: 'storyTsunamiGauges',
        sourceId: PROPAGATION,
        quote:
          'a tsunami is barely noticeable in the deep ocean and rarely more than three feet (one meter) high. Mariners at sea will not normally notice a tsunami as it passes beneath their hulls.',
      },
      ...CUT_OPEN(-165, -15, 'Over the islands of the south Pacific, where many gauges stand.'),
    },
    {
      id: 'across-the-ocean',
      atJd: after(360, 'Six hours after it began.'),
      text: {
        key: 'storyTsunamiAcross',
        sourceId: PROPAGATION,
        quote:
          'As a tsunami enters shallow water near land, it slows down, wavelengths decrease, waves grow in height, and currents intensify.',
      },
      ...CUT_OPEN(-135, 0, 'Over the middle of the Pacific.'),
    },
    {
      id: 'warnings',
      atJd: after(720, 'Twelve hours after it began.'),
      text: {
        key: 'storyTsunamiWarnings',
        sourceId: WARNING,
        quote:
          'These centers monitor for tsunamis and the earthquakes that cause them, forecast tsunami impacts, and prepare and issue tsunami messages.',
      },
      ...CUT_OPEN(-110, 5, 'Off the coast of the Americas.'),
    },
  ],
  endJd: after(
    975,
    'Sixteen and a quarter hours after it began, when the last gauge of the Americas had timed it.',
  ),
  sources: [
    NOAA_TSUNAMI_KERMADEC_2021,
    NOAA_DEM_GLOBAL_MOSAIC,
    NOAA_JETSTREAM_TSUNAMI_GENERATION,
    NOAA_JETSTREAM_TSUNAMI_PROPAGATION,
    NOAA_JETSTREAM_TSUNAMI_WARNING,
    JPL_HORIZONS_TURN_KERMADEC_2021_EARTH,
  ],
};
