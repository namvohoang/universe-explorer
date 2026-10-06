// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M81 } from './sources';

export const bodesGalaxy: Galaxy = {
  id: 'bodes-galaxy',
  kind: 'galaxy',
  name: 'Messier 81',
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
    distanceLy: s(
      11.6e6,
      'nasa-hubble-m81',
      'Source says: It is located 11.6 million light-years from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/bodes-galaxy.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltBodesGalaxy',
      credit: 'NASA, ESA and the Hubble Heritage Team (STScI/AURA)',
    },
  ],
  sources: [NASA_HUBBLE_M81],
};
