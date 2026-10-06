// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The source calls it a peculiar elliptical galaxy.
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C77 } from './sources';

export const centaurusA: Galaxy = {
  id: 'centaurus-a',
  kind: 'galaxy',
  name: 'Centaurus A',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'elliptical',
    diameterLy: s(
      60000,
      'nasa-hubble-c77',
      'Source says: The galaxy is about 60,000 light-years wide',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(11e6, 'nasa-hubble-c77', 'Source says: about 11 million light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/centaurus-a.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltCentaurusA',
      credit:
        'NASA, ESA, and the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration; Acknowledgment: R. O’Connell (University of Virginia) and the WFC3 Scientific Oversight Committee',
    },
  ],
  sources: [NASA_HUBBLE_C77],
};
