// Halley's Comet on its last pass round the Sun. The comet follows the catalogue's orbit (JPL's
// elements), and on that orbit it is closest to the Sun at Julian date 2446469.974 (11:22 UT on
// 8 February 1986); the parts are counted in days from then. How big the glow and how long the
// tails are drawn at each distance from the Sun is the app's own drawing of what NASA
// describes (src/sim/comet.ts); the note on the comet's card says so.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { JPL_SBDB_HALLEY, NASA_COMETS, NASA_COMETS_FACTS } from './sources';

const ORBIT = 'jpl-sbdb-halley';
const FACTS = 'nasa-comets-facts';

export const halleyTail: Story = {
  id: 'halley-tail',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyHalleyTailTitle',
  actorIds: ['sun', 'halley', 'earth'],
  whole: 'star-and-first',
  chapters: [
    {
      id: 'far-away',
      atJd: s(2446169.974, ORBIT, '300 days before the comet is closest to the Sun on this orbit.'),
      text: {
        key: 'storyHalleyTailFarAway',
        sourceId: FACTS,
        quote: 'Each comet has a frozen part, called a nucleus, often a few miles across.',
      },
      lookAtId: 'halley',
      viewFromId: 'earth',
    },
    {
      id: 'warming-up',
      atJd: s(
        2446196.974,
        ORBIT,
        '273 days before it is closest to the Sun: the last whole day before it comes within the distance at which the app starts to draw its tail.',
      ),
      text: {
        key: 'storyHalleyTailWarmingUp',
        sourceId: FACTS,
        quote: 'A comet warms up as it nears the Sun and develops an atmosphere, or coma.',
      },
      lookAtId: 'halley',
      viewFromId: 'earth',
    },
    {
      id: 'closest',
      atJd: s(2446439.974, ORBIT, '30 days before it is closest to the Sun.'),
      text: {
        key: 'storyHalleyTailClosest',
        sourceId: FACTS,
        quote:
          'The pressure of sunlight and high-speed solar particles (solar wind) can blow the coma dust and gas away from the Sun, sometimes forming a long, bright tail.',
      },
      lookAtId: 'halley',
      viewFromId: 'earth',
    },
    {
      id: 'leaving',
      atJd: s(2446499.974, ORBIT, '30 days after it is closest to the Sun.'),
      text: {
        key: 'storyHalleyTailLeaving',
        sourceId: 'nasa-comets',
        quote:
          'The dust and gases form a tail that stretches away from the Sun for millions of miles.',
      },
      lookAtId: 'halley',
      viewFromId: 'earth',
    },
  ],
  endJd: s(2446719.974, ORBIT, '250 days after it is closest to the Sun.'),
  sources: [JPL_SBDB_HALLEY, NASA_COMETS_FACTS, NASA_COMETS],
};
