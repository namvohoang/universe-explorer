// The total solar eclipse of 2 August 2027. The Moon and Earth are where JPL Horizons has them
// (see ../paths/), and Earth is turned the way it will face, so the shadow falls on the right
// countries. The four instants are worked out from those positions: when the pale edge of the
// shadow (the penumbra) first touches Earth and last leaves it, when the shadow's middle line
// reaches Earth and leaves it, and when that line passes nearest Earth's centre. The shadow is
// taken from where the Moon was when the light passed it, 1.3 s before it lands. NASA's eclipse
// pages give the last instant as 10:07:49, two seconds from the one here, and a table of where
// the middle line falls; tests hold the story to both. Times are on Horizons' clock (TDB), 69 s
// ahead of clock time.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { ECLIPSE_2027_EARTH } from '../paths/eclipse2027Earth';
import { ECLIPSE_2027_EARTH_TURN } from '../paths/eclipse2027EarthTurn';
import { ECLIPSE_2027_MOON } from '../paths/eclipse2027Moon';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_ECLIPSE_2027_EARTH,
  JPL_HORIZONS_PATH_ECLIPSE_2027_MOON,
  JPL_HORIZONS_TURN_ECLIPSE_2027_EARTH,
  NASA_ECLIPSE_TYPES,
} from './sources';

const PATH = 'jpl-horizons-path-eclipse2027moon';
const NASA = 'nasa-eclipse-types';

export const solarEclipse: Story = {
  id: 'solar-eclipse',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storySolarEclipseTitle',
  actorIds: ['earth', 'moon', 'sun'],
  diagram: 'in-line',
  tracked: { moon: ECLIPSE_2027_MOON, earth: ECLIPSE_2027_EARTH },
  turned: { earth: ECLIPSE_2027_EARTH_TURN },
  shadows: [{ casterId: 'moon', onId: 'earth' }],
  chapters: [
    {
      id: 'shadow-arrives',
      atJd: s(2461619.813391, PATH, 'The penumbra first touches Earth, 2027-08-02 07:31:16.'),
      text: {
        key: 'storySolarEclipseShadowArrives',
        sourceId: NASA,
        quote:
          'A solar eclipse happens when the Moon passes between the Sun and Earth, casting a shadow on Earth that either fully or partially blocks the Sun’s light in some areas.',
      },
      lookAtId: 'earth',
      viewFromId: 'moon',
    },
    {
      id: 'dark-spot',
      atJd: s(2461619.851481, PATH, 'The middle line of the shadow reaches Earth, 08:26:07.'),
      text: {
        key: 'storySolarEclipseDarkSpot',
        sourceId: NASA,
        quote:
          'People located in the center of the Moon’s shadow when it hits Earth will experience a total eclipse.',
      },
      lookAtId: 'earth',
      viewFromId: 'moon',
    },
    {
      id: 'pale-ring',
      atJd: s(2461619.922083, PATH, 'The middle line passes nearest Earth’s centre, 10:07:47.'),
      text: {
        key: 'storySolarEclipsePaleRing',
        sourceId: NASA,
        quote:
          'During a total or annular solar eclipse, people outside the area covered by the Moon’s inner shadow see a partial solar eclipse.',
      },
      lookAtId: 'earth',
      viewFromId: 'moon',
    },
    {
      id: 'leaving',
      atJd: s(2461619.992696, PATH, 'The middle line of the shadow leaves Earth, 11:49:28.'),
      text: {
        key: 'storySolarEclipseLeaving',
        sourceId: NASA,
        quote:
          'Except for the fleeting moments of totality during a total solar eclipse, observers should always use eclipse glasses or an alternative safe solar viewing method, such as a pinhole projector, to view the Sun.',
      },
      lookAtId: 'earth',
      viewFromId: 'moon',
    },
  ],
  endJd: s(2461620.030786, PATH, 'The penumbra leaves Earth, 12:44:19.'),
  sources: [
    JPL_HORIZONS_PATH_ECLIPSE_2027_MOON,
    JPL_HORIZONS_PATH_ECLIPSE_2027_EARTH,
    JPL_HORIZONS_TURN_ECLIPSE_2027_EARTH,
    NASA_ECLIPSE_TYPES,
  ],
};
