// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { unknown } from './helpers';
import { NASA_MILKY_WAY } from './sources';

export const milkyWay: Galaxy = {
  id: 'milky-way',
  kind: 'galaxy',
  name: 'Milky Way',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'barred-spiral',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: null,
  media: [
    {
      file: 'public/media/deep/milky-way.webp',
      kind: 'artist-concept',
      role: 'picture',
      altKey: 'pictureAltMilkyWay',
      credit: 'NASA/JPL-Caltech/R. Hurt (SSC/Caltech)',
    },
  ],
  sources: [NASA_MILKY_WAY],
};
