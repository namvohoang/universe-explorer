// The climb of Apollo 11's Saturn V to orbit. The ten places it passes through, and their
// times, are rows of NASA's own table of the flight (see ../paths/apollo11Ascent.ts); the
// curve drawn between them is the app's, so the story is `staged` and says so on screen.
// Earth is turned so that Florida is where it really was at liftoff.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { APOLLO_11_ASCENT, APOLLO_11_ASCENT_TURN } from '../paths/apollo11Ascent';
import { s } from './sourced';
import {
  JPL_HORIZONS_EARTH_TURN_APOLLO_11_ASCENT,
  NASA_SATURN_V_STUDENTS,
  NASA_SP4029_APOLLO_11_ASCENT,
} from './sources';

const TABLE = 'nasa-sp4029-apollo11-ascent';
const STUDENTS = 'nasa-saturn-v-students';

export const apollo11Launch: Story = {
  id: 'apollo-11-launch',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyApollo11LaunchTitle',
  actorIds: ['earth', 'sun'],
  craft: [{ id: 'apollo-11', nameKey: 'craftApollo11', path: APOLLO_11_ASCENT }],
  turned: { earth: APOLLO_11_ASCENT_TURN },
  chapters: [
    {
      id: 'liftoff',
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
  ],
};
