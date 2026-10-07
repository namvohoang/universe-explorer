// Orion's path and the Moon's are JPL Horizons' own, sampled by tools/horizons/fetchPath.ts.
// The times of the engine burn, the pass of the Moon and the dropping of the service module
// are the ones in Horizons' data sheet for the flight (UTC, to the minute); the samples agree
// with it: nearest the Moon's centre at 8,282 km, and farthest from Earth four minutes later.
// The path's own times are TDB, about a minute ahead of UTC. It starts three and a half hours
// after launch and stops 17 minutes before splashdown: Horizons holds no more.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { ARTEMIS_2_MOON } from '../paths/artemis2Moon';
import { ARTEMIS_2_ORION } from '../paths/artemis2Orion';
import { s } from './sourced';
import {
  JPL_HORIZONS_ARTEMIS_2,
  JPL_HORIZONS_PATH_ARTEMIS_2_MOON,
  JPL_HORIZONS_PATH_ARTEMIS_2_ORION,
  NASA_ARTEMIS_II,
} from './sources';

const PATH = 'jpl-horizons-path-artemis2orion';
const SHEET = 'jpl-horizons-artemis-2';

export const artemis2: Story = {
  id: 'artemis-2',
  group: 'space-flights',
  path: 'tracked',
  titleKey: 'storyArtemis2Title',
  actorIds: ['earth', 'moon', 'sun'],
  craft: [{ id: 'orion-spacecraft', nameKey: 'craftOrion', path: ARTEMIS_2_ORION }],
  tracked: { moon: ARTEMIS_2_MOON },
  chapters: [
    {
      id: 'round-earth',
      atJd: s(2461132.590277778, PATH, 'The first sample, 2026-04-02 02:10.'),
      text: {
        key: 'storyArtemis2RoundEarth',
        sourceId: 'nasa-artemis-ii',
        quote:
          'NASA’s SLS (Space Launch System) rocket launched the Orion spacecraft carrying NASA astronauts Reid Wiseman, Victor Glover, and Christina Koch, along with CSA (Canadian Space Agency) astronaut Jeremy Hansen, on the Artemis II mission on April 1, 2026, from Operations and Support Building II at Kennedy Space Center in Florida.',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'to-the-moon',
      atJd: s(
        2461133.492361111,
        SHEET,
        'Start of the translunar injection burn, 2026-04-02 23:49 UTC.',
      ),
      text: {
        key: 'storyArtemis2ToTheMoon',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Start Translunar Injection burn (5m 55s)',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'round-the-moon',
      atJd: s(
        2461137.334027778,
        SHEET,
        'Three hours before the closest approach to the Moon, 2026-04-06 23:01 UTC.',
      ),
      text: {
        key: 'storyArtemis2RoundTheMoon',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Maximum distance Earth center (413146.2 km)',
      },
      lookAtId: 'moon',
      closeUp: true,
    },
    {
      id: 'coming-home',
      atJd: s(2461137.584027778, SHEET, 'Three hours after the closest approach to the Moon.'),
      text: {
        key: 'storyArtemis2ComingHome',
        sourceId: 'nasa-artemis-ii',
        quote:
          'Meet the astronauts who ventured around the Moon on Artemis II, the first crewed flight aboard NASA’s human deep space capabilities, paving the way for future lunar surface missions.',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'landing',
      atJd: s(2461141.48125, SHEET, 'Crew and service module separation, 2026-04-10 23:33 UTC.'),
      text: {
        key: 'storyArtemis2Landing',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Splashdown, Pacific Ocean, off Baja Cali.',
      },
      lookAtId: 'orion-spacecraft',
    },
  ],
  endJd: s(
    2461141.493055556,
    PATH,
    'The last sample, 2026-04-10 23:50, 17 minutes before splashdown.',
  ),
  sources: [
    JPL_HORIZONS_PATH_ARTEMIS_2_ORION,
    JPL_HORIZONS_PATH_ARTEMIS_2_MOON,
    JPL_HORIZONS_ARTEMIS_2,
    NASA_ARTEMIS_II,
  ],
};
