// Orion's path and the Moon's are JPL Horizons' own, sampled by tools/horizons/fetchPath.ts.
// The instants of the farthest point and of the passes of the Moon are worked out from those
// samples (the minute Orion is nearest the Moon, or farthest from Earth), and agree with what
// NASA's pages say: within 80 miles of the Moon, and 268,563 miles from Earth's surface.
// Times are TDB, about a minute ahead of clock time (UTC): 69.18 s, as Horizons gives it for
// these weeks. The path starts two hours after launch and stops 40 minutes before splashdown:
// Horizons holds no more.
// Close up Orion is NASA's model of it at its true size. It fires its main engine four times
// near the Moon, at the clock times and for as long as NASA's mission blog gives; Horizons'
// own path shows each one, Orion's speed jumping in the very minute. Which way it points is a
// drawing: nose first the way it moves as seen from the Moon, and tail first in the one burn
// that slowed it (Horizons: its speed seen from the Moon fell by 76 m/s in that minute).
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Sourced, Story } from '../types';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_ARTEMIS_1_MOON,
  JPL_HORIZONS_PATH_ARTEMIS_1_ORION,
  NASA_ARTEMIS_I,
  NASA_ARTEMIS_I_DRO_DEPARTURE,
  NASA_ARTEMIS_I_DRO_INSERTION,
  NASA_ARTEMIS_I_OUTBOUND_FLYBY,
  NASA_ARTEMIS_I_RETURN_FLYBY,
  NASA_ARTEMIS_I_SPLASHDOWN,
} from './sources';
import { ARTEMIS_1_MOON } from '../paths/artemis1Moon';
import { ARTEMIS_1_ORION } from '../paths/artemis1Orion';

const PATH = 'jpl-horizons-path-artemis1orion';
/** How far Horizons' clock (TDB) runs ahead of clock time (UTC) in these weeks, in days. */
const TDB_AHEAD_DAYS = 69.18 / 86_400;
/** A clock time (UTC) as a Julian date on the story's clock (TDB). */
const utc = (jdUtc: number, sourceId: string, note: string): Sourced<number> =>
  s(jdUtc + TDB_AHEAD_DAYS, sourceId, note);
/** An instant `seconds` after another. */
const after = (from: Sourced<number>, seconds: number, note: string): Sourced<number> =>
  s(from.value + seconds / 86_400, from.sourceId, note);

const outboundBurn = utc(
  2459905.030555556,
  'nasa-artemis-i-outbound-flyby',
  'The outbound powered flyby burn "at 7:44 a.m. EST" (12:44 UTC) on 2022-11-21.',
);
const insertionBurn = utc(
  2459909.411111111,
  'nasa-artemis-i-dro-insertion',
  "The distant retrograde orbit insertion burn at 4:52 p.m. on 2022-11-25. The page says CST, but its own note of NASA TV coverage and the flyby post give 4:52 p.m. EST (21:52 UTC), and Horizons shows Orion's speed jumping between 21:52 and 21:54 UTC, not an hour later.",
);
const departureBurn = utc(
  2459915.411805556,
  'nasa-artemis-i-dro-departure',
  'The distant retrograde departure burn "at 3:53 p.m. CST" (21:53 UTC) on 2022-12-01; Horizons shows the jump in that minute.',
);
const returnBurn = utc(
  2459919.196527778,
  'nasa-artemis-i-return-flyby',
  'The close approach "at 10:43 a.m. CST" (16:43 UTC) on 2022-12-05, "just before its return powered flyby burn"; Horizons shows the jump from that minute.',
);

export const artemis1: Story = {
  id: 'artemis-1',
  group: 'space-flights',
  path: 'tracked',
  titleKey: 'storyArtemis1Title',
  noteKey: 'storyArtemis1Note',
  actorIds: ['earth', 'moon', 'sun'],
  craft: [
    {
      id: 'orion-spacecraft',
      nameKey: 'craftOrion',
      path: ARTEMIS_1_ORION,
      modelOfId: 'orion-craft',
      movesBy: 'moon',
      // Orion's main engine burns hypergolic propellants: in the vacuum of space its flame is
      // pale and hard to see.
      burns: [
        {
          fromJd: outboundBurn,
          untilJd: after(outboundBurn, 150, '"for 2 minutes and 30 seconds".'),
          flame: 'faint',
        },
        {
          fromJd: insertionBurn,
          untilJd: after(insertionBurn, 88, '"for 1 minutes and 28 seconds".'),
          flame: 'faint',
        },
        {
          fromJd: departureBurn,
          untilJd: after(departureBurn, 105, '"firing its main engine for 1 minute 45 seconds".'),
          flame: 'faint',
          backwards: s(
            true,
            PATH,
            "Orion's speed as seen from the Moon, from Horizons' positions minute by minute on 2022-12-01, fell by 76 m/s between 21:53 and 21:54 UTC: the burn slowed it.",
          ),
        },
        {
          fromJd: returnBurn,
          untilJd: after(returnBurn, 207, '"lasted 3 minutes, 27 seconds".'),
          flame: 'faint',
        },
      ],
    },
  ],
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
      // The burn and the pass just after it are played slowly, to watch them.
      slowStart: { storySeconds: 1200, overSeconds: 16 },
      atJd: outboundBurn,
      text: {
        key: 'storyArtemis1FirstPass',
        sourceId: 'nasa-artemis-i-outbound-flyby',
        quote:
          'after successfully performing the outbound powered flyby burn at 7:44 a.m. EST with a firing of the orbital maneuvering system engine for 2 minutes and 30 seconds to accelerate the spacecraft at a rate of more than 580 mph. At the time of the burn, Orion was 328 miles above the Moon, travelling at 5,023 mph. Shortly after the burn, Orion passed 81 miles above the Moon',
      },
      lookAtId: 'orion-spacecraft',
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
      id: 'into-orbit',
      slowStart: { storySeconds: 240, overSeconds: 8 },
      atJd: insertionBurn,
      text: {
        key: 'storyArtemis1IntoOrbit',
        sourceId: 'nasa-artemis-i-dro-insertion',
        quote:
          'successfully performed a burn to insert Orion into a distant retrograde orbit by firing the orbital maneuvering system engine for 1 minutes and 28 seconds',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
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
      id: 'out-of-orbit',
      slowStart: { storySeconds: 240, overSeconds: 8 },
      atJd: departureBurn,
      text: {
        key: 'storyArtemis1OutOfOrbit',
        sourceId: 'nasa-artemis-i-dro-departure',
        quote:
          'The spacecraft successfully completed the distant retrograde departure burn at 3:53 p.m. CST, firing its main engine for 1 minute 45 seconds to set the spacecraft on course for a close lunar flyby before its return home.',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
    },
    {
      id: 'second-pass',
      slowStart: { storySeconds: 600, overSeconds: 12 },
      atJd: returnBurn,
      text: {
        key: 'storyArtemis1SecondPass',
        sourceId: 'nasa-artemis-i-return-flyby',
        quote:
          'The burn, which used the spacecraft’s main engine on the European-built service module, lasted 3 minutes, 27 seconds, and changed the velocity of the spacecraft by about 655 mph (961 feet per second). It was the final major engine maneuver of the flight test.',
      },
      lookAtId: 'orion-spacecraft',
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
    NASA_ARTEMIS_I_OUTBOUND_FLYBY,
    NASA_ARTEMIS_I_DRO_INSERTION,
    NASA_ARTEMIS_I_DRO_DEPARTURE,
    NASA_ARTEMIS_I_RETURN_FLYBY,
  ],
};
