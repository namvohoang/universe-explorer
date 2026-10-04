// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M87 } from './sources';

export const m87: Galaxy = {
  id: 'm87',
  kind: 'galaxy',
  name: 'Messier 87',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'elliptical',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      54e6,
      'nasa-hubble-m87',
      'Source says: this galaxy is located 54 million light-years away from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/m87.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltM87',
      credit:
        'NASA, ESA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: P. Cote (Herzberg Institute of Astrophysics) and E. Baltz (Stanford University)',
    },
  ],
  sources: [NASA_HUBBLE_M87],
};
