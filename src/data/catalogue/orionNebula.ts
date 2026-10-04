// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M42 } from './sources';

export const orionNebula: Nebula = {
  id: 'orion-nebula',
  kind: 'nebula',
  name: 'Orion Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cloud',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      1500,
      'nasa-hubble-m42',
      'Source says: The nebula is only 1,500 light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/orion-nebula.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltOrionNebula',
      credit:
        'NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team',
    },
  ],
  sources: [NASA_HUBBLE_M42],
};
