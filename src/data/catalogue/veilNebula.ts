// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C34 } from './sources';

export const veilNebula: Nebula = {
  id: 'veil-nebula',
  kind: 'nebula',
  name: 'Veil Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'shell',
    diameterLy: s(110, 'nasa-hubble-c34', 'Source says: extending 110 light-years across'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      2000,
      'nasa-hubble-c34',
      'Source says: the Veil Nebula lies about 2,000 light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/veil-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltVeilNebula',
      credit: 'ESA/Hubble & NASA, R. Sankrit',
    },
  ],
  sources: [NASA_HUBBLE_C34],
};
