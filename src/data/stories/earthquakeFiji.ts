// An earthquake, from the record of a real one: the magnitude 8.2 earthquake of 19 August 2018
// (UTC) near Fiji, which began about 600 km down inside a plate that has sunk into the Earth.
// It was chosen because it was one of the biggest ever measured at such a depth, so its first
// wave was picked cleanly on stations all round the world, and because, being so deep, it did
// little on the ground: USGS's own estimate of harm for it was its lowest ("green").
// Every dot is a station of the USGS record, put where its distance and direction from the
// earthquake put it, and lit at the instant its recording was picked. The yellow ring is the
// front of the wave that came straight through the rock, drawn through those instants
// (src/sim/seismic.ts): that is worked out, and the screen says so. The record follows that
// wave to 97 degrees round the world, 12 minutes after the start. Beyond is a gap where the
// record has no station (bar one picked as bent round the core), and from 115 degrees on the
// stations felt a wave that had gone through the core, 17 to 19 minutes after the start: they
// are lit in blue. A test holds the gap and the order.
// In the parts over where it began, the close look is a block of ground cut open
// (src/scene/quakeBlock.ts): a drawing, in which the break is as deep as the catalogue's 600 km
// against the width of the block, and the wave is as far from the break as the nearest
// stations say (src/sim/seismic.ts, `waveReachKm`). Before the nearest station felt it, 81 s
// after the start, the wave is drawn going out evenly. The world with its stations is then
// the whole picture beside it.
// The record has only the first wave. The slower wave that follows, which shakes the ground
// more, was not picked in it, and is not drawn or told.
// USGS's own text gives the depth as "approximately 560 km"; its catalogue has 600 km. The
// sentence uses the text's figure.
// Earth is turned the way it faced 40 s before the start (JPL Horizons); the dates are clock
// time (UTC).
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { FIJI_2018_EARTH_TURN } from '../paths/fiji2018EarthTurn';
import { FIJI_2018_QUAKE } from '../paths/fiji2018Quake';
import { s } from './sourced';
import {
  JPL_HORIZONS_TURN_FIJI_2018_EARTH,
  USGS_EARTHQUAKES_HOW,
  USGS_EVENT_FIJI_2018,
  USGS_INTERIOR_OF_THE_EARTH,
} from './sources';

const EVENT = 'usgs-event-us1000gcii';
const INTERIOR = 'usgs-interior-of-the-earth';
const HOW = 'usgs-earthquakes-how';

const START_JD = FIJI_2018_QUAKE.originJd.value;
const SECONDS_PER_DAY = 86_400;
/** An instant so many seconds after the earthquake began. */
const after = (seconds: number, note: string) =>
  s(START_JD + seconds / SECONDS_PER_DAY, EVENT, note);

/** Looking straight down on a place: a choice of framing. */
const over = (lonDegEast: number, latDegNorth: number, why: string) =>
  ({
    lookAtId: 'earth',
    closeUp: true,
    overPlace: s([lonDegEast, latDegNorth] as const, EVENT, why),
  }) as const;
const OVER_THE_START = over(-178.153, -18.1125, 'The place on the ground over where it began.');
/** With the ground cut open over where it began as the close look, and the world beside it. */
const CUT_OPEN = { ...OVER_THE_START, slice: true } as const;

export const earthquakeFiji: Story = {
  id: 'earthquake-fiji',
  group: 'earth-at-work',
  path: 'tracked',
  titleKey: 'storyQuakeTitle',
  noteKey: 'storyQuakeNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: FIJI_2018_EARTH_TURN },
  quake: { onId: 'earth', record: FIJI_2018_QUAKE },
  chapters: [
    {
      id: 'plates',
      atJd: after(-30, 'Half a minute before the earthquake began.'),
      text: {
        key: 'storyQuakePlates',
        sourceId: INTERIOR,
        quote:
          'they move over a hot, yielding upper mantle zone at very slow rates of a few centimeters per year, slower than the rate at which fingernails grow.',
      },
      ...CUT_OPEN,
    },
    {
      id: 'it-breaks',
      atJd: after(0, 'The instant the earthquake began: 00:19:40.67 UTC.'),
      text: {
        key: 'storyQuakeBreaks',
        sourceId: EVENT,
        quote:
          'occurred as the result of deep, normal faulting approximately 560 km beneath the South Pacific Ocean',
      },
      ...CUT_OPEN,
    },
    {
      id: 'the-waves',
      atJd: after(150, 'Two and a half minutes after it began.'),
      text: {
        key: 'storyQuakeWaves',
        sourceId: HOW,
        quote:
          'In the process of breaking, vibrations called "seismic waves" are generated. These waves travel outward from the source of the earthquake along the surface and through the Earth at varying speeds depending on the material through which they move.',
      },
      ...over(-170, 20, 'Over the middle of the Pacific, where the front passes in these minutes.'),
    },
    {
      id: 'the-core',
      atJd: after(760, 'Just after the last station the wave reached straight had felt it.'),
      text: {
        key: 'storyQuakeCore',
        sourceId: INTERIOR,
        quote:
          'The core was the first internal structural element to be identified. It was discovered in 1906 by R.D. Oldham, from his study of earthquake records',
      },
      ...over(5, 25, 'Over the far side of the world from the earthquake.'),
    },
    {
      id: 'so-deep',
      atJd: after(1150, 'Just after the last station of the record had felt it.'),
      text: {
        key: 'storyQuakeDeep',
        sourceId: EVENT,
        quote:
          'Deep-focus earthquakes cause less damage on the ground surface above their foci than similar-magnitude shallow-focus earthquakes',
      },
      ...CUT_OPEN,
    },
  ],
  endJd: after(1260, 'Twenty-one minutes after it began.'),
  sources: [
    USGS_EVENT_FIJI_2018,
    USGS_INTERIOR_OF_THE_EARTH,
    USGS_EARTHQUAKES_HOW,
    JPL_HORIZONS_TURN_FIJI_2018_EARTH,
  ],
};
