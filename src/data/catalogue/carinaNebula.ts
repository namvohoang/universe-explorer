// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C92 } from './sources';

export const carinaNebula: Nebula = {
  id: 'carina-nebula',
  kind: 'nebula',
  name: 'Carina Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cloud',
    diameterLy: s(
      300,
      'nasa-hubble-c92',
      'Source says: the nebula’s enormous size – about 300 light-years',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(7500, 'nasa-hubble-c92', 'Source says: approximately 7,500 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/carina-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltCarinaNebula',
      credit:
        'NASA, ESA, N. Smith (University of California, Berkeley), and the Hubble Heritage Team (STScI/AURA); CTIO data: N. Smith (University of California, Berkeley) and NOAO/AURA/NSF',
    },
  ],
  sources: [NASA_HUBBLE_C92],
};
