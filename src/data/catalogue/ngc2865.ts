// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_NGC2865 } from './sources';

export const ngc2865: Galaxy = {
  id: 'ngc-2865',
  kind: 'galaxy',
  name: 'NGC 2865',
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
      100e6,
      'nasa-hubble-ngc2865',
      'Source says: It lies just over 100 million light-years away from us',
    ),
  },
  media: [
    {
      file: 'public/media/deep/ngc-2865.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltNgc2865',
      credit: 'ESA/Hubble & NASA; Acknowledgement: Judy Schmidt',
    },
  ],
  sources: [NASA_HUBBLE_NGC2865],
};
