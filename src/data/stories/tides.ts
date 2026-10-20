// The tides, worked out from where the catalogue puts the Moon and the Sun: nothing here is
// fetched for the story. Each body raises a tide in proportion to its mass over the cube of
// its distance (NOAA: "Tidal generating forces vary inversely as the cube of the distance from
// the tide generating object"), and the sea is drawn as it would settle on a smooth world with
// no land: swollen towards each body and away from it (src/sim/tides.ts). On the catalogue's
// own masses and orbits the Sun's tide comes out at about half the Moon's, as NOAA says, and a
// test holds it there. The swelling is drawn enormously bigger than life, and the screen says
// so. The drawn bulges point straight at the Moon, as NOAA's own pictures have them ("the two
// bulges stay aligned with the moon as the Earth rotates"); NASA adds that on the real Earth
// they run a little ahead of it, and that land and the depth of the sea change everything at
// any one shore, which the last part tells.
// The instants are the US Naval Observatory's for the Moon's phases of October and November
// 2026, the ones the Moon's phases story uses.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from './sourced';
import { NASA_TIDES, NOAA_TIDES_VARIATIONS, USNO_MOON_PHASES } from './sources';

const USNO = 'usno-moon-phases';
const NASA = 'nasa-tides';
const NOAA = 'noaa-tides-variations';

const FIRST_QUARTER = 2461332.175;
const FULL_MOON = 2461339.675;
const LAST_QUARTER = 2461346.3527777777;
/** Seen with the 3D ocean tides and island simulation beside the enlarged Earth-Moon orbit picture. */
const TIDE_VIEW = {
  lookAtId: 'earth',
  closeUp: true,
  slice: true,
} as const;

export const tides: Story = {
  id: 'tides',
  group: 'earth-at-work',
  path: 'orbits',
  titleKey: 'storyTidesTitle',
  noteKey: 'storyTidesNote',
  actorIds: ['earth', 'moon', 'sun'],
  diagram: 'earth-moon',
  tide: { onId: 'earth', raiserIds: ['moon', 'sun'] },
  chapters: [
    {
      id: 'two-bulges',
      atJd: s(FIRST_QUARTER, USNO, 'First Quarter, 2026-10-18 16:12 UT.'),
      text: {
        key: 'storyTidesTwoBulges',
        sourceId: NASA,
        quote:
          'On Earth, the Moon’s gravitational pull causes the oceans to bulge out on both the side closest to the Moon and the side farthest from the Moon.',
      },
      ...TIDE_VIEW,
    },
    {
      id: 'two-a-day',
      atJd: s(FIRST_QUARTER + 0.125, USNO, 'Three hours after First Quarter.'),
      untilJd: s(FIRST_QUARTER + 1.125, USNO, 'One day after that.'),
      text: {
        key: 'storyTidesTwoADay',
        sourceId: NASA,
        quote:
          'As Earth rotates within this layer of water, its landmasses pass through the two bulges. These bulges are Earth’s high tides. Most shorelines experience two high and low tides per day.',
      },
      ...TIDE_VIEW,
    },
    {
      id: 'spring-tides',
      atJd: s(FULL_MOON, USNO, 'Full Moon, 2026-10-26 04:12 UT.'),
      untilJd: s(FULL_MOON + 0.5, USNO, 'Twelve hours after Full Moon.'),
      text: {
        key: 'storyTidesSpring',
        sourceId: NOAA,
        quote:
          'When the sun, moon, and Earth are in alignment (at the time of the new or full moon), the solar tide has an additive effect on the lunar tide, creating extra-high high tides, and very low, low tides—both commonly called spring tides.',
      },
      ...TIDE_VIEW,
    },
    {
      id: 'neap-tides',
      atJd: s(LAST_QUARTER, USNO, 'Last Quarter, 2026-11-01 20:28 UT.'),
      text: {
        key: 'storyTidesNeap',
        sourceId: NOAA,
        quote:
          'One week later, when the sun and moon are at right angles to each other, the solar tide partially cancels out the lunar tide and produces moderate tides known as neap tides.',
      },
      ...TIDE_VIEW,
    },
    {
      id: 'real-seas',
      atJd: s(LAST_QUARTER + 0.5, USNO, 'Twelve hours after Last Quarter.'),
      text: {
        key: 'storyTidesRealSeas',
        sourceId: NASA,
        quote:
          'Of course, in reality the Earth isn’t a smooth ball, so tides are also affected by the presence of continents, the shape of the Earth, the depth of the ocean in different locations, and more.',
      },
      ...TIDE_VIEW,
    },
  ],
  endJd: s(LAST_QUARTER + 1, USNO, 'One day after Last Quarter.'),
  sources: [USNO_MOON_PHASES, NASA_TIDES, NOAA_TIDES_VARIATIONS],
};
