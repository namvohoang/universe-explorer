// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M57 } from './sources';

export const ringNebula: Nebula = {
  id: 'ring-nebula',
  kind: 'nebula',
  name: 'Ring Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'shell',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(2000, 'nasa-hubble-m57', 'Source says: is about 2,000 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/ring-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltRingNebula',
      credit: 'NASA, ESA and the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration',
    },
  ],
  sources: [NASA_HUBBLE_M57],
};
