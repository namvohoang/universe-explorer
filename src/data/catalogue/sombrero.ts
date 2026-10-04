// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M104 } from './sources';

export const sombrero: Galaxy = {
  id: 'sombrero',
  kind: 'galaxy',
  name: 'Sombrero Galaxy',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'spiral',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  seenFromEarth: 'edge-on',
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      28e6,
      'nasa-hubble-m104',
      'Source says: M104 is located 28 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/sombrero.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltSombrero',
      credit: 'NASA and The Hubble Heritage Team (STScI/AURA)',
    },
  ],
  sources: [NASA_HUBBLE_M104],
};
