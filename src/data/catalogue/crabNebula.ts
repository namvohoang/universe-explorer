// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M1 } from './sources';

export const crabNebula: Nebula = {
  id: 'crab-nebula',
  kind: 'nebula',
  name: 'Crab Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'shell',
    diameterLy: s(6, 'nasa-hubble-m1', 'Source says: a six-light-year-wide remnant'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(6500, 'nasa-hubble-m1', 'Source says: located 6,500 light-years from Earth'),
  },
  media: [
    {
      file: 'public/media/deep/crab-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltCrabNebula',
      credit: 'NASA, ESA, J. Hester and A. Loll (Arizona State University)',
    },
  ],
  sources: [NASA_HUBBLE_M1],
};
