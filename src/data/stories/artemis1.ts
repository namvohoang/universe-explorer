// Orion's path and the Moon's are JPL Horizons' own, sampled by tools/horizons/fetchPath.ts.
// The instants of the two passes of the Moon and of the farthest point are worked out from
// those samples (the minute Orion is nearest the Moon, or farthest from Earth), and agree with
// what NASA's pages say: within 80 miles of the Moon, and 268,563 miles from Earth's surface.
// Times are TDB, about a minute ahead of clock time (UTC). The path starts two hours after
// launch and stops 40 minutes before splashdown: Horizons holds no more.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_ARTEMIS_1_MOON,
  JPL_HORIZONS_PATH_ARTEMIS_1_ORION,
  NASA_ARTEMIS_I,
  NASA_ARTEMIS_I_SPLASHDOWN,
} from './sources';
import { ARTEMIS_1_MOON } from '../paths/artemis1Moon';
import { ARTEMIS_1_ORION } from '../paths/artemis1Orion';

const PATH = 'jpl-horizons-path-artemis1orion';

export const artemis1: Story = {
  id: 'artemis-1',
  group: 'space-flights',
  path: 'tracked',
  titleKey: 'storyArtemis1Title',
  actorIds: ['earth', 'moon', 'sun'],
  craft: [{ id: 'orion-spacecraft', nameKey: 'craftOrion', path: ARTEMIS_1_ORION }],
  tracked: { moon: ARTEMIS_1_MOON },
  chapters: [
    {
      id: 'on-its-way',
      atJd: s(
        2459899.875,
        PATH,
        'The first sample, 2022-11-16 09:00, about two hours after launch.',
      ),
      text: {
        key: 'storyArtemis1OnItsWay',
        sourceId: 'nasa-artemis-i',
        quote:
          'In late 2022, the uncrewed Artemis I mission launched from Kennedy Space Center in Florida, orbited thousands of miles beyond the Moon, then returned to Earth.',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'first-pass',
      atJd: s(
        2459904.915972222,
        PATH,
        'Three hours before Orion is nearest the Moon in the samples (2022-11-21 12:59).',
      ),
      text: {
        key: 'storyArtemis1FirstPass',
        sourceId: 'nasa-artemis-i-splashdown',
        quote:
          'During the mission, Orion performed two lunar flybys, coming within 80 miles of the lunar surface.',
      },
      lookAtId: 'moon',
      closeUp: true,
    },
    {
      id: 'far-orbit',
      atJd: s(2459905.165972222, PATH, 'Three hours after Orion is nearest the Moon.'),
      text: {
        key: 'storyArtemis1FarOrbit',
        sourceId: 'nasa-artemis-i',
        quote:
          'Artemis I flew thousands of miles beyond and around the Moon and splashed down to Earth off the coast of San Diego at 12:40 p.m. EST on Dec. 11, 2022.',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'farthest',
      atJd: s(
        2459912.3798611113,
        PATH,
        'The minute Orion is farthest from Earth in the samples (2022-11-28 21:07).',
      ),
      text: {
        key: 'storyArtemis1Farthest',
        sourceId: 'nasa-artemis-i-splashdown',
        quote:
          'While in a distant lunar orbit, Orion surpassed the record for distance traveled by a spacecraft designed to carry humans, previously set during Apollo 13.',
      },
      lookAtId: 'orion-spacecraft',
    },
    {
      id: 'second-pass',
      atJd: s(
        2459919.0729166665,
        PATH,
        'Three hours before Orion is nearest the Moon the second time (2022-12-05 16:45).',
      ),
      text: {
        key: 'storyArtemis1SecondPass',
        sourceId: 'nasa-artemis-i-splashdown',
        quote:
          'During the mission, Orion performed two lunar flybys, coming within 80 miles of the lunar surface.',
      },
      lookAtId: 'moon',
      closeUp: true,
    },
    {
      id: 'home',
      atJd: s(2459919.3229166665, PATH, 'Three hours after the second pass.'),
      text: {
        key: 'storyArtemis1Home',
        sourceId: 'nasa-artemis-i-splashdown',
        quote:
          'Within about 20 minutes, Orion slowed from nearly 25,000 mph to about 20 mph for its parachute-assisted splashdown.',
      },
      lookAtId: 'orion-spacecraft',
    },
  ],
  endJd: s(
    2459925.208333333,
    PATH,
    'The last sample, 2022-12-11 17:00, 40 minutes before splashdown.',
  ),
  sources: [
    JPL_HORIZONS_PATH_ARTEMIS_1_ORION,
    JPL_HORIZONS_PATH_ARTEMIS_1_MOON,
    NASA_ARTEMIS_I,
    NASA_ARTEMIS_I_SPLASHDOWN,
  ],
};
