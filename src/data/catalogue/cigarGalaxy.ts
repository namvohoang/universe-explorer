// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// That we see it edge-on is from the NASA Webb page cited on its card (nasa-webb-m82).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M82 } from './sources';

export const cigarGalaxy: Galaxy = {
  id: 'cigar-galaxy',
  kind: 'galaxy',
  name: 'Messier 82',
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
      12e6,
      'nasa-hubble-m82',
      'Source says: Located 12 million light-years from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/cigar-galaxy.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltCigarGalaxy',
      credit:
        'NASA, ESA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: J. Gallagher (University of Wisconsin), M. Mountain (STScI) and P. Puxley (National Science Foundation)',
    },
  ],
  sources: [NASA_HUBBLE_M82],
};
