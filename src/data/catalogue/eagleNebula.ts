// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M16 } from './sources';

export const eagleNebula: Nebula = {
  id: 'eagle-nebula',
  kind: 'nebula',
  name: 'Eagle Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cloud',
    diameterLy: s(
      70,
      'nasa-hubble-m16',
      'Source says: the entire Eagle Nebula, which spans 70 by 55 light-years. The longer span is used.',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(7000, 'nasa-hubble-m16', 'Source says: is located 7,000 light-years from Earth'),
  },
  media: [
    {
      file: 'public/media/deep/eagle-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltEagleNebula',
      credit: 'NASA, ESA and the Hubble Heritage Team (STScI/AURA)',
    },
  ],
  sources: [NASA_HUBBLE_M16],
};
