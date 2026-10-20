// A tornado, from the survey of a real one: the tornado of the evening of 1 May 2018 south of
// Tescott, Kansas, in the middle of the United States, rated EF-3. It was chosen because the
// US National Weather Service surveyed it, it crossed open farmland, "was well documented by
// dozens of storm chasers", and hurt nobody: the survey gives "Injuries/Deaths 0/0".
// Where it touched down and where it lifted are from NOAA's Storm Prediction Center's
// database of tornadoes; the straight line between them is 23.3 km long, the 14.5 miles of the
// weather service's survey (the database gives 15.78 miles for the path as walked, which was
// not quite straight). The times, 7:41 to 8:10 in the evening by the clocks of Kansas (00:41
// to 01:10 UTC on 2 May), and the greatest width, 880 yards (805 m), are the survey's.
// The drawing shows the funnel that wide at the ground, going the length of that line the way
// it ran, at a steady pace, in those 29 minutes, and leaving a track as wide behind it. A
// real tornado is not always at its widest and does not keep one pace. How tall and wide the
// cloud is, and the shape of the funnel above the ground, are a drawing, and the screen says so.
// On the globe a ring marks the place. It was nearly sunset there.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { TESCOTT_2018_EARTH_TURN } from '../paths/tescott2018EarthTurn';
import { s } from './sourced';
import {
  BRITANNICA_WIND_SHEAR,
  JPL_HORIZONS_TURN_TESCOTT_2018_EARTH,
  NOAA_NSSL_TORNADOES,
  NOAA_NSSL_TORNADO_FAQ,
  NOAA_SPC_TORNADOES,
  NWS_TOPEKA_2018_05_01,
  UCAR_HOW_TORNADOES_FORM,
} from './sources';

const SURVEY = 'nws-topeka-2018-05-01';
const DATABASE = 'noaa-spc-tornadoes';
const NSSL = 'noaa-nssl-tornadoes';
const FAQ = 'noaa-nssl-tornado-faq';
const UCAR = 'ucar-how-tornadoes-form';
const BRITANNICA = 'britannica-wind-shear';

/** 00:41 UTC on 2 May 2018: 7:41 in the evening of 1 May by the clocks of Kansas. */
const TOUCHED_DOWN_JD = 2458240.528472222;
const MINUTES_PER_DAY = 1440;
const after = (minutes: number, note: string) =>
  s(TOUCHED_DOWN_JD + minutes / MINUTES_PER_DAY, SURVEY, note);

/** Looking down on where it touched down, with the drawing of the tornado beside it. */
const BESIDE_THE_DRAWING = {
  lookAtId: 'earth',
  closeUp: true,
  overPlace: s([-97.883, 38.94] as const, DATABASE, 'Where the tornado touched down.'),
  slice: true,
} as const;

export const tornadoTescott: Story = {
  id: 'tornado-tescott',
  group: 'earth-at-work',
  path: 'staged',
  titleKey: 'storyTornadoTitle',
  noteKey: 'storyTornadoNote',
  actorIds: ['earth', 'sun'],
  turned: { earth: TESCOTT_2018_EARTH_TURN },
  tornado: {
    onId: 'earth',
    ends: s(
      [-97.883, 38.94, -97.7559, 39.1244],
      DATABASE,
      'The row of 1 May 2018, 18:41 Central Standard Time, Kansas: slon, slat, elon, elat.',
    ),
    fromJd: after(0, 'Time (CDT) 7:41pm.'),
    untilJd: after(29, 'Time (CDT) 8:10pm.'),
    widthKm: s(0.8047, SURVEY, 'Max Width 880 yards (1/2 mi): 880 yards of 0.9144 m.'),
  },
  chapters: [
    {
      id: 'wind-shear',
      atJd: after(-8, 'Eight minutes before touchdown: wind shear forms horizontal spinning tube.'),
      text: {
        key: 'storyTornadoWindShear',
        sourceId: BRITANNICA,
        quote:
          'Differences in wind speed and direction with altitude—wind shear—create an invisible horizontal spinning tube of air near the ground.',
      },
      ...BESIDE_THE_DRAWING,
    },
    {
      id: 'updraft-tilt',
      atJd: after(
        -4,
        'Four minutes before touchdown: convective updraft tilts spinning tube upright.',
      ),
      text: {
        key: 'storyTornadoUpdraftTilt',
        sourceId: UCAR,
        quote:
          'A powerful thunderstorm updraft tilts the horizontally rotating air into a vertical column, creating a rotating updraft called a mesocyclone.',
      },
      ...BESIDE_THE_DRAWING,
    },
    {
      id: 'touches-down',
      atJd: after(0, 'The time the survey gives for its start.'),
      text: {
        key: 'storyTornadoTouchesDown',
        sourceId: SURVEY,
        quote:
          'The longer-tracked, strong tornado developed in far northern Saline County and tracked NE through SW Ottawa County.',
      },
      ...BESIDE_THE_DRAWING,
    },
    {
      id: 'its-path',
      atJd: after(8, 'Eight minutes after it touched down.'),
      text: {
        key: 'storyTornadoItsPath',
        sourceId: SURVEY,
        quote: 'Path Length 14.5 miles Max Width 880 yards (1/2 mi) Injuries/Deaths 0/0',
      },
      ...BESIDE_THE_DRAWING,
    },
    {
      id: 'rope-out',
      atJd: after(23, 'Twenty-three minutes after touchdown: downdrafts choke warm inflow.'),
      text: {
        key: 'storyTornadoRopeOut',
        sourceId: FAQ,
        quote:
          'Although the process by which tornadoes form is not completely understood, scientific research has revealed that tornadoes usually form under certain types of atmospheric conditions. When forecasters see those conditions, they can predict that tornadoes are likely to occur.',
      },
      ...BESIDE_THE_DRAWING,
    },
    {
      id: 'how-strong',
      atJd: after(29, 'Twenty-nine minutes after touchdown: survey and rating.'),
      text: {
        key: 'storyTornadoHowStrong',
        sourceId: NSSL,
        quote:
          'To determine the strength of a tornado, experts examine the damage it caused. From this information, we can estimate the wind speeds.',
      },
      ...BESIDE_THE_DRAWING,
    },
  ],
  endJd: after(31, 'Two minutes after the time the survey gives for its end.'),
  sources: [
    NWS_TOPEKA_2018_05_01,
    NOAA_SPC_TORNADOES,
    NOAA_NSSL_TORNADOES,
    NOAA_NSSL_TORNADO_FAQ,
    UCAR_HOW_TORNADOES_FORM,
    BRITANNICA_WIND_SHEAR,
    JPL_HORIZONS_TURN_TESCOTT_2018_EARTH,
  ],
};
