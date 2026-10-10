// The launch of Artemis I: the Space Launch System climbing from Florida, in the night, with
// the Orion spaceship on top. Liftoff is JPL Horizons' time; the events after it are NASA's
// mission elapsed times, which NASA says "may vary by several seconds". Three heights on the
// way up are NASA's too, but NASA gives no track over the ground: the line the rocket is drawn
// along is a drawing (see ../paths/artemis1Ascent.ts), so the story is `staged` and says so.
// Earth is turned so that Florida is where it really was at liftoff.
// Seen close up the rocket is NASA's model of the SLS at its true size. The boosters are let
// go as the part of the model's file they are; the escape tower is cut off at the top of the
// capsule's cover, which really went with it. The flame, the smoke, the tower, the clouds and
// the lean are drawings. The story stops when the core stage lets go: there the drawn line ends.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Sourced, Story } from '../types';
import { ARTEMIS_1_ASCENT, ARTEMIS_1_ASCENT_TURN } from '../paths/artemis1Ascent';
import { s } from './sourced';
import {
  JPL_HORIZONS_ARTEMIS_1,
  JPL_HORIZONS_EARTH_TURN_ARTEMIS_1_ASCENT,
  NASA_ARTEMIS_I_LIFTOFF,
  NASA_ARTEMIS_I_PRESS_KIT,
  NASA_SLS_MODEL,
  NASA_SLS_REFERENCE_GUIDE_ASCENT,
  NASA_SLS_STUDENTS,
  NASA_SP4029_APOLLO_10_ASCENT,
  NSSDC_EARTH_AIR,
} from './sources';

const BLOG = 'nasa-artemis-i-liftoff';
const STUDENTS = 'nasa-sls-students';
/** Liftoff, 06:47:44 UTC on 16 November 2022: "Launched November 16 @ 06:47:44 UTC". */
const LIFTOFF_JD = 2459899.783148148;
/** An instant given as seconds after liftoff (NASA's mission elapsed time). */
const at = (seconds: number, sourceId: string, note: string): Sourced<number> =>
  s(LIFTOFF_JD + seconds / 86_400, sourceId, note);

const liftoff = s(
  LIFTOFF_JD,
  'jpl-horizons-artemis-1',
  'Major events: "Launched November 16 @ 06:47:44 UTC from pad 39B at the Kennedy Space Center."',
);
const boostersAway = at(
  132,
  BLOG,
  'Solid rocket booster separation (Mission Elapsed Time 00:02:12).',
);
const towerAway = at(196, BLOG, 'Launch abort system jettison (MET 00:03:16).');
const enginesOff = at(483, BLOG, 'Core stage main engine cutoff commanded (MET 00:08:03).');
const coreStageAway = at(495, BLOG, 'Core stage/ICPS separation (MET 00:08:15).');

export const artemis1Launch: Story = {
  id: 'artemis-1-launch',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyArtemis1LaunchTitle',
  noteKey: 'storyArtemis1LaunchNote',
  actorIds: ['earth', 'sun'],
  craft: [
    {
      id: 'artemis-1-sls',
      nameKey: 'craftArtemis1Sls',
      path: ARTEMIS_1_ASCENT,
      modelOfId: 'sls',
      fromGround: true,
      letsGo: [
        { atJd: boostersAway, part: 'boosters' },
        {
          atJd: towerAway,
          aboveShare: s(
            0.893,
            'nasa-sls-3d-model',
            "Measured on NASA's model on 2026-10-10: the share of its length at which the thin tower on its nose starts, above the cone over the capsule. The real tower took that cone with it; here the cone is left drawn.",
          ),
        },
      ],
      sheds: [
        {
          atJd: coreStageAway,
          belowShare: s(
            0.738,
            'nasa-sls-3d-model',
            "Measured on NASA's model on 2026-10-10: the share of its length at which it has narrowed to the width of the upper stage. The cone below that went with the core stage.",
          ),
        },
      ],
      // The four core engines burn hydrogen, with a pale flame; while the two solid boosters
      // burn, theirs is the bright one that is seen.
      burns: [
        {
          fromJd: at(
            -6.36,
            'nasa-artemis-i-press-kit',
            'Launch countdown: "RS-25 engines startup (T-6.36S)".',
          ),
          untilJd: liftoff,
          flame: 'faint',
        },
        {
          fromJd: s(
            LIFTOFF_JD,
            'nasa-artemis-i-press-kit',
            'Launch countdown: "T-0 • Booster ignition, umbilical separation, and liftoff".',
          ),
          untilJd: boostersAway,
          flame: 'bright',
        },
        { fromJd: boostersAway, untilJd: enginesOff, flame: 'faint' },
      ],
      tower: true,
    },
  ],
  air: {
    ofId: 'earth',
    scaleHeightKm: s(8.5, 'nssdc-earth-air', 'Terrestrial atmosphere: "Scale height: 8.5 km".'),
    clouds: true,
  },
  turned: { earth: ARTEMIS_1_ASCENT_TURN },
  chapters: [
    {
      id: 'liftoff',
      // The first seconds are played slowly, to watch the rocket leave the ground.
      slowStart: { storySeconds: 24, overSeconds: 9 },
      atJd: liftoff,
      text: {
        key: 'storyArtemis1LaunchLiftoff',
        sourceId: STUDENTS,
        quote:
          'SLS launches from Launch Pad 39B at NASA’s Kennedy Space Center in Florida. On launch day, countdown clocks tick down toward zero. Then the rocket’s boosters ignite, carrying Orion and its payload into space.',
      },
      lookAtId: 'artemis-1-sls',
      closeUp: true,
    },
    {
      id: 'boosters-away',
      // So is each part coming away.
      slowStart: { storySeconds: 14, overSeconds: 6 },
      atJd: boostersAway,
      text: {
        key: 'storyArtemis1LaunchBoostersAway',
        sourceId: STUDENTS,
        quote:
          'The rocket is high above Earth. The solid rocket boosters fall off when the fuel inside them is used.',
      },
      lookAtId: 'artemis-1-sls',
      closeUp: true,
    },
    {
      id: 'tower-away',
      slowStart: { storySeconds: 14, overSeconds: 6 },
      atJd: towerAway,
      text: {
        key: 'storyArtemis1LaunchTowerAway',
        sourceId: STUDENTS,
        quote:
          'SLS is 57 miles (91 km) above Earth. Orion is safely in orbit and no longer needs the launch abort system.',
      },
      lookAtId: 'artemis-1-sls',
      closeUp: true,
    },
    {
      id: 'core-stage-away',
      atJd: enginesOff,
      text: {
        key: 'storyArtemis1LaunchCoreStageAway',
        sourceId: STUDENTS,
        quote:
          'The orange core stage is no longer needed and drops off. Only the upper stage of SLS remains to push Orion higher.',
      },
      lookAtId: 'artemis-1-sls',
      closeUp: true,
    },
  ],
  endJd: coreStageAway,
  sources: [
    JPL_HORIZONS_ARTEMIS_1,
    NASA_ARTEMIS_I_LIFTOFF,
    NASA_ARTEMIS_I_PRESS_KIT,
    NASA_SLS_REFERENCE_GUIDE_ASCENT,
    NASA_SLS_STUDENTS,
    NASA_SP4029_APOLLO_10_ASCENT,
    JPL_HORIZONS_EARTH_TURN_ARTEMIS_1_ASCENT,
    NASA_SLS_MODEL,
    NSSDC_EARTH_AIR,
  ],
};
