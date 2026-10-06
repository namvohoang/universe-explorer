// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C6 } from './sources';

export const catsEyeNebula: Nebula = {
  id: 'cats-eye-nebula',
  kind: 'nebula',
  name: 'Cat’s Eye Nebula',
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
    distanceLy: s(3000, 'nasa-hubble-c6', 'Source says: Located about 3,000 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/cats-eye-nebula.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltCatsEyeNebula',
      credit:
        'NASA, ESA, HEIC, and the Hubble Heritage Team (STScI/AURA); Acknowledgment: R. Corradi (Isaac Newton Group of Telescopes, Spain) and Z. Tsvetanov (NASA)',
    },
  ],
  sources: [NASA_HUBBLE_C6],
};
