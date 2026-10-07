// Mars seen from Earth from November 2026 to June 2027, with the track it makes across the
// sky drawn behind it. Both planets follow the catalogue's orbits (JPL's approximate positions
// of the planets). On them, Mars stops its usual drift and turns back at Julian date
// 2461416.125 (15:00 UT on 10 January 2027) and turns forward again at 2461497.083 (14:00 UT
// on 1 April 2027), with Earth passing nearest to it between the two; those two instants are
// worked out from the catalogue, to the hour, not read from a page. A test holds them.
// There are no stars behind the track: the app has no map of the stars for this view.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { JPL_APPROX_POSITIONS, NASA_APOD_RETROGRADE_MARS } from './sources';

const ORBITS = 'jpl-approx-positions-story';
const NASA = 'nasa-apod-retrograde-mars';

export const marsBackwards: Story = {
  id: 'mars-backwards',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyMarsBackwardsTitle',
  actorIds: ['earth', 'mars', 'sun'],
  skyTrack: { ofId: 'mars', fromId: 'earth' },
  chapters: [
    {
      id: 'drifting',
      atJd: s(2461359.5, ORBITS, '15 November 2026, eight weeks before Mars turns back.'),
      text: {
        key: 'storyMarsBackwardsDrifting',
        sourceId: NASA,
        quote:
          "Most of the time, the apparent motion of Mars in Earth's sky is in one direction, slow but steady in front of the far distant stars.",
      },
      lookAtId: 'mars',
      standAtId: 'earth',
    },
    {
      id: 'backwards',
      atJd: s(
        2461416.125,
        ORBITS,
        'The hour Mars stops and turns back in Earth’s sky, 10 January 2027.',
      ),
      text: {
        key: 'storyMarsBackwardsBackwards',
        sourceId: NASA,
        quote:
          'About every two years, however, the Earth passes Mars as they orbit around the Sun.',
      },
      lookAtId: 'mars',
      standAtId: 'earth',
    },
    {
      id: 'forwards-again',
      atJd: s(2461497.083, ORBITS, 'The hour Mars turns forward again, 1 April 2027.'),
      text: {
        key: 'storyMarsBackwardsForwardsAgain',
        sourceId: NASA,
        quote: 'Here, Mars appears to trace out a loop in the sky.',
      },
      lookAtId: 'mars',
      standAtId: 'earth',
    },
  ],
  endJd: s(2461571.5, ORBITS, '15 June 2027, ten weeks after Mars turns forward again.'),
  sources: [JPL_APPROX_POSITIONS, NASA_APOD_RETROGRADE_MARS],
};
