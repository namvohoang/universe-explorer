// Earth on the four days of 2027 when a season begins, seen from the Sun, so that the part of
// Earth turned to the camera is the part the Sun shines on most directly. Each day is shown
// by itself, Earth turning once, and the months between are skipped. The four instants are the
// US Naval Observatory's (Universal Time, to the minute). Which countries face the Sun at each
// hour is not real here: the catalogue knows how fast Earth turns but not which side faced
// where. The tilt, and which pole leans to the Sun, are.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { NASA_EARTH_FACTS, NASA_SPACE_PLACE_SEASONS, USNO_SEASONS_2027 } from './sources';

const USNO = 'usno-seasons-2027';

export const seasons: Story = {
  id: 'seasons',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storySeasonsTitle',
  actorIds: ['earth', 'sun'],
  diagram: 'round-the-star',
  chapters: [
    {
      id: 'march-equinox',
      atJd: s(2461485.350694444, USNO, 'March equinox, 2027-03-20 20:25 UT.'),
      untilJd: s(2461486.350694444, USNO, 'One day later: Earth is shown turning once.'),
      text: {
        key: 'storySeasonsMarch',
        sourceId: 'nasa-earth-facts',
        quote:
          'When spring and fall begin, both hemispheres receive roughly equal amounts of heat from the Sun.',
      },
      lookAtId: 'earth',
      viewFromId: 'sun',
    },
    {
      id: 'june-solstice',
      atJd: s(2461578.090972222, USNO, 'June solstice, 2027-06-21 14:11 UT.'),
      untilJd: s(2461579.090972222, USNO, 'One day later: Earth is shown turning once.'),
      text: {
        key: 'storySeasonsJune',
        sourceId: 'nasa-space-place-seasons',
        quote:
          "So, when the North Pole tilts toward the Sun, it's summer in the Northern Hemisphere.",
      },
      lookAtId: 'earth',
      viewFromId: 'sun',
    },
    {
      id: 'september-equinox',
      atJd: s(2461671.751388889, USNO, 'September equinox, 2027-09-23 06:02 UT.'),
      untilJd: s(2461672.751388889, USNO, 'One day later: Earth is shown turning once.'),
      text: {
        key: 'storySeasonsSeptember',
        sourceId: 'nasa-space-place-seasons',
        quote: 'As Earth orbits the Sun, its tilted axis always points in the same direction.',
      },
      lookAtId: 'earth',
      viewFromId: 'sun',
    },
    {
      id: 'december-solstice',
      atJd: s(2461761.6125, USNO, 'December solstice, 2027-12-22 02:42 UT.'),
      untilJd: s(2461762.6125, USNO, 'One day later: Earth is shown turning once.'),
      text: {
        key: 'storySeasonsDecember',
        sourceId: 'nasa-space-place-seasons',
        quote:
          "And when the South Pole tilts toward the Sun, it's winter in the Northern Hemisphere.",
      },
      lookAtId: 'earth',
      viewFromId: 'sun',
    },
  ],
  endJd: s(2461762.6125, USNO, 'One day after the December solstice.'),
  sources: [USNO_SEASONS_2027, NASA_SPACE_PLACE_SEASONS, NASA_EARTH_FACTS],
};
