// The four instants are the US Naval Observatory's times of the Moon's phases (Universal Time,
// to the minute), turned into Julian dates by script. NASA's eclipse and Moon pages give no
// table of phase times; the Naval Observatory is the United States' own almanac office.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { s } from '../catalogue/helpers';
import { NASA_MOON_PHASES, USNO_MOON_PHASES } from '../catalogue/sources';

export const moonPhases: Story = {
  id: 'moon-phases',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyMoonPhasesTitle',
  actorIds: ['earth', 'moon', 'sun'],
  chapters: [
    {
      id: 'new-moon',
      atJd: s(2461324.159722222, 'usno-moon-phases', 'New Moon, 2026-10-10 15:50 UT.'),
      text: {
        key: 'storyMoonPhasesNew',
        sourceId: 'nasa-moon-phases',
        quote:
          'This is the invisible phase of the Moon, with the illuminated side of the Moon facing the Sun and the night side facing Earth.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'first-quarter',
      atJd: s(2461332.175, 'usno-moon-phases', 'First Quarter, 2026-10-18 16:12 UT.'),
      text: {
        key: 'storyMoonPhasesFirstQuarter',
        sourceId: 'nasa-moon-phases',
        quote:
          'The Moon is now a quarter of the way through its monthly journey and you see half of its illuminated side.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'full-moon',
      atJd: s(2461339.675, 'usno-moon-phases', 'Full Moon, 2026-10-26 04:12 UT.'),
      text: {
        key: 'storyMoonPhasesFull',
        sourceId: 'nasa-moon-phases',
        quote: 'The Moon is opposite the Sun, as viewed from Earth, revealing the Moon’s dayside.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
    {
      id: 'last-quarter',
      atJd: s(2461346.3527777777, 'usno-moon-phases', 'Last Quarter, 2026-11-01 20:28 UT.'),
      text: {
        key: 'storyMoonPhasesLastQuarter',
        sourceId: 'nasa-moon-phases',
        quote:
          'The Sun always illuminates half of the Moon while the other half remains dark, but how much we are able to see of that illuminated half changes as the Moon travels through its orbit.',
      },
      lookAtId: 'moon',
      viewFromId: 'earth',
    },
  ],
  endJd: s(2461353.793055556, 'usno-moon-phases', 'The next New Moon, 2026-11-09 07:02 UT.'),
  sources: [USNO_MOON_PHASES, NASA_MOON_PHASES],
};
