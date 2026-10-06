// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_NGC5264 } from './sources';

export const ngc5264: Galaxy = {
  id: 'ngc-5264',
  kind: 'galaxy',
  name: 'NGC 5264',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'irregular',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      15e6,
      'nasa-hubble-ngc5264',
      'Source says: a dwarf galaxy located just over 15 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/ngc-5264.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltNgc5264',
      credit: 'ESA/Hubble & NASA',
    },
  ],
  sources: [NASA_HUBBLE_NGC5264],
};
