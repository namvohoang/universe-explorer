// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M33 } from './sources';

export const triangulum: Galaxy = {
  id: 'triangulum',
  kind: 'galaxy',
  name: 'Triangulum Galaxy',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'spiral',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(3e6, 'nasa-hubble-m33', 'Source says: Distance About 3 million light-years'),
  },
  media: [
    {
      file: 'public/media/deep/triangulum.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltTriangulum',
      credit:
        'NASA, ESA, and M. Durbin, J. Dalcanton and B. F. Williams (University of Washington)',
    },
  ],
  sources: [NASA_HUBBLE_M33],
};
