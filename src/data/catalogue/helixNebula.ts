// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Nebula } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C63 } from './sources';

export const helixNebula: Nebula = {
  id: 'helix-nebula',
  kind: 'nebula',
  name: 'Helix Nebula',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'shell',
    diameterLy: s(
      3,
      'nasa-hubble-c63',
      'Source says: its bright ring stretching across nearly three light-years and dimmer, outer features extending even farther. Rough.',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(650, 'nasa-hubble-c63', 'Source says: only about 650 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/helix-nebula.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltHelixNebula',
      credit:
        'NASA, NOAO, ESA, the Hubble Helix Nebula Team, M. Meixner (STScI), and T.A. Rector (NRAO)',
    },
  ],
  sources: [NASA_HUBBLE_C63],
};
