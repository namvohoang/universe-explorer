// Two full Moons of 2026 seen from Earth through the same telescope: the one farthest from
// Earth (31 May) and the one nearest (24 December), so that the nearer one is seen bigger by as
// much as it really looks. The instants of the two full Moons are the US Naval Observatory's
// (Universal Time). For those hours the Moon is where JPL Horizons has it, since how near and
// how far it gets changes from month to month and the catalogue's one ellipse cannot show that:
// of the year's thirteen full Moons these two are, by Horizons, the farthest (406,135 km) and
// the nearest (356,739 km). The months between are skipped, so the two sets of samples are
// joined into one path that is never drawn across the gap.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { SUPERMOON_FAR } from '../paths/supermoonFar';
import { SUPERMOON_NEAR } from '../paths/supermoonNear';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_SUPERMOON_FAR,
  JPL_HORIZONS_PATH_SUPERMOON_NEAR,
  NASA_SUPERMOONS,
  USNO_MOON_PHASES_2026,
} from './sources';

const USNO = 'usno-moon-phases-2026';
const NASA = 'nasa-supermoons';

export const supermoon: Story = {
  id: 'supermoon',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storySupermoonTitle',
  actorIds: ['earth', 'moon', 'sun'],
  diagram: 'in-line',
  diagramPaths: 'true-shape',
  tracked: {
    moon: {
      centreId: 'earth',
      samples: s(
        [...SUPERMOON_FAR.samples.value, ...SUPERMOON_NEAR.samples.value],
        'jpl-horizons-path-supermoonfar',
        'With the samples of the December night after them, from the source of that name.',
      ),
    },
  },
  chapters: [
    {
      id: 'far-moon',
      atJd: s(2461191.864583, USNO, 'Full Moon, 2026-05-31 08:45 UT.'),
      untilJd: s(
        2461192.114583,
        'jpl-horizons-path-supermoonfar',
        'Six hours later, within the samples.',
      ),
      text: {
        key: 'storySupermoonFar',
        sourceId: NASA,
        quote:
          'During every 27-day orbit around Earth, the Moon reaches both its perigee, about 226,000 miles (363,300 km) from Earth, and its farthest point, or apogee, about 251,000 miles (405,500 km) from Earth.',
      },
      lookAtId: 'moon',
      standAtId: 'earth',
    },
    {
      id: 'near-moon',
      atJd: s(2461398.561111, USNO, 'Full Moon, 2026-12-24 01:28 UT.'),
      untilJd: s(
        2461398.811111,
        'jpl-horizons-path-supermoonnear',
        'Six hours later, within the samples.',
      ),
      text: {
        key: 'storySupermoonNear',
        sourceId: NASA,
        quote:
          '“Supermoon" isn’t an official astronomical term, but typically it’s used to describe a full Moon that comes within at least 90 percent of perigee.',
      },
      lookAtId: 'moon',
      standAtId: 'earth',
    },
  ],
  endJd: s(
    2461398.811111,
    'jpl-horizons-path-supermoonnear',
    'Six hours after the December full Moon.',
  ),
  sources: [
    USNO_MOON_PHASES_2026,
    JPL_HORIZONS_PATH_SUPERMOON_FAR,
    JPL_HORIZONS_PATH_SUPERMOON_NEAR,
    NASA_SUPERMOONS,
  ],
};
