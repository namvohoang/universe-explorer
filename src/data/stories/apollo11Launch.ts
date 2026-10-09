// The climb of Apollo 11's Saturn V to orbit. The ten places it passes through, and their
// times, are rows of NASA's own table of the flight (see ../paths/apollo11Ascent.ts); the
// curve drawn between them is the app's, so the story is `staged` and says so on screen.
// Earth is turned so that Florida is where it really was at liftoff.
// Seen close up the rocket is NASA's model of the Saturn V at its true size, standing on the
// ground until liftoff; which way it points as it climbs is the app's drawing too. A stage
// that has dropped away is cut off the model; it is not drawn falling. The flame and the blue
// of the sky are drawings as well: when the engines burn and how fast the air thins are real.
// So are the tower, the smoke on the ground, the clouds, and the dropped stage falling behind.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Sourced, Story } from '../types';
import { APOLLO_11_ASCENT, APOLLO_11_ASCENT_TURN } from '../paths/apollo11Ascent';
import { s } from './sourced';
import {
  JPL_HORIZONS_EARTH_TURN_APOLLO_11_ASCENT,
  NASA_SATURN_V_FIRST_STAGE,
  NASA_SATURN_V_MODEL,
  NASA_SATURN_V_STUDENTS,
  NASA_SP4029_APOLLO_11_ASCENT,
  NASA_SP4029_APOLLO_11_TIMELINE,
  NSSDC_EARTH_AIR,
} from './sources';

const TABLE = 'nasa-sp4029-apollo11-ascent';
const TIMELINE = 'nasa-sp4029-apollo11-timeline';
/** Range zero, the instant NASA's tables count from: 13:32:00 UTC on 16 July 1969. */
const RANGE_ZERO_JD = 2440419.063888889;
/** An instant given in the tables as seconds after range zero. */
const at = (seconds: number, sourceId: string, note: string): Sourced<number> =>
  s(RANGE_ZERO_JD + seconds / 86_400, sourceId, note);
const STUDENTS = 'nasa-saturn-v-students';

export const apollo11Launch: Story = {
  id: 'apollo-11-launch',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyApollo11LaunchTitle',
  noteKey: 'storyApollo11LaunchNote',
  actorIds: ['earth', 'sun'],
  craft: [
    {
      id: 'apollo-11',
      nameKey: 'craftApollo11',
      path: APOLLO_11_ASCENT,
      modelOfId: 'saturn-v',
      fromGround: true,
      sheds: [
        {
          atJd: s(
            2440419.065767361,
            TABLE,
            'S-IC/S-II separation, 2 min 42.30 s after range zero.',
          ),
          belowShare: s(
            138 / 363,
            'nasa-saturn-v-first-stage',
            'The first stage: "The 138-foot-long stage", out of the 363 feet the source nasa-saturn-v-students gives for the whole rocket. NASA\'s model has a joint ring at 0.38 of its length too.',
          ),
        },
        {
          atJd: s(
            2440419.070243055,
            TABLE,
            'S-II/S-IVB separation, 9 min 9.00 s after range zero.',
          ),
          belowShare: s(
            0.659,
            'nasa-saturn-v-3d-model',
            "Measured on NASA's model on 2026-10-09: the share of its length at which it has narrowed to the width of the third stage. The cone below that joined the two stages and left with the second.",
          ),
        },
      ],
      // The first stage burns kerosene, with a long bright flame; the other two burn
      // hydrogen, whose flame is pale and hard to see.
      burns: [
        {
          fromJd: at(-6.4, TIMELINE, 'S-IC engine ignition (#5), 6.4 s before range zero.'),
          untilJd: at(161.63, TIMELINE, 'S-IC outboard engine cutoff, 2 min 41.63 s.'),
          flame: 'bright',
        },
        {
          fromJd: at(164.0, TIMELINE, 'S-II ignition, 2 min 44.0 s.'),
          untilJd: at(548.22, TIMELINE, 'S-II outboard engine cutoff, 9 min 8.22 s.'),
          flame: 'faint',
        },
        {
          fromJd: at(552.2, TIMELINE, 'S-IVB 1st burn ignition, 9 min 12.20 s.'),
          untilJd: at(699.33, TIMELINE, 'S-IVB 1st burn cutoff, 11 min 39.33 s.'),
          flame: 'faint',
        },
      ],
      uprightUntilJd: at(13.2, TIMELINE, 'Pitch and roll maneuver started, 13.2 s.'),
      tower: true,
    },
  ],
  air: {
    ofId: 'earth',
    scaleHeightKm: s(8.5, 'nssdc-earth-air', 'Terrestrial atmosphere: "Scale height: 8.5 km".'),
    clouds: true,
  },
  turned: { earth: APOLLO_11_ASCENT_TURN },
  chapters: [
    {
      id: 'liftoff',
      // The first seconds are played slowly, to watch the rocket leave the ground.
      slowStart: { storySeconds: 24, overSeconds: 9 },
      atJd: s(2440419.063896181, TABLE, 'Liftoff, 0.63 s after 13:32:00 UTC on 1969-07-16.'),
      text: {
        key: 'storyApollo11LaunchLiftoff',
        sourceId: STUDENTS,
        quote:
          'The first stage had the most powerful engines, since it had the challenging task of lifting the fully fueled rocket off the ground.',
      },
      lookAtId: 'apollo-11',
      closeUp: true,
    },
    {
      id: 'first-stage-away',
      // So is each stage coming away.
      slowStart: { storySeconds: 14, overSeconds: 6 },
      atJd: s(2440419.065767361, TABLE, 'S-IC/S-II separation, 2 min 42.30 s after range zero.'),
      text: {
        key: 'storyApollo11LaunchFirstStageAway',
        sourceId: STUDENTS,
        quote:
          'Each stage would burn its engines until it was out of fuel and would then separate from the rocket. The engines on the next stage would fire, and the rocket would continue into space.',
      },
      lookAtId: 'apollo-11',
      closeUp: true,
    },
    {
      id: 'second-stage-away',
      slowStart: { storySeconds: 14, overSeconds: 6 },
      atJd: s(2440419.070243055, TABLE, 'S-II/S-IVB separation, 9 min 9.00 s after range zero.'),
      text: {
        key: 'storyApollo11LaunchSecondStageAway',
        sourceId: STUDENTS,
        quote:
          'The second stage carried it from there almost into orbit. The third stage placed the Apollo spacecraft into Earth orbit and pushed it toward the moon.',
      },
      lookAtId: 'apollo-11',
      closeUp: true,
    },
    {
      id: 'in-orbit',
      atJd: s(2440419.071982986, TABLE, 'S-IVB 1st burn cutoff, 11 min 39.33 s after range zero.'),
      text: {
        key: 'storyApollo11LaunchInOrbit',
        sourceId: TABLE,
        quote: 'Earth orbit insertion',
      },
      lookAtId: 'apollo-11',
      closeUp: true,
    },
  ],
  endJd: s(2440419.072098727, TABLE, 'Earth orbit insertion, 11 min 49.33 s after range zero.'),
  sources: [
    NASA_SP4029_APOLLO_11_ASCENT,
    JPL_HORIZONS_EARTH_TURN_APOLLO_11_ASCENT,
    NASA_SATURN_V_STUDENTS,
    NASA_SATURN_V_FIRST_STAGE,
    NASA_SATURN_V_MODEL,
    NASA_SP4029_APOLLO_11_TIMELINE,
    NSSDC_EARTH_AIR,
  ],
};
