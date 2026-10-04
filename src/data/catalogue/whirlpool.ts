// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M51 } from './sources';

export const whirlpool: Galaxy = {
  id: 'whirlpool',
  kind: 'galaxy',
  name: 'Whirlpool Galaxy',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'spiral',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  seenFromEarth: 'face-on',
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      31e6,
      'nasa-hubble-m51',
      'Source says: a spiral galaxy located 31 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/whirlpool.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltWhirlpool',
      credit: 'NASA, ESA, S. Beckwith (STScI) and the Hubble Heritage Team (STScI/AURA)',
    },
  ],
  sources: [NASA_HUBBLE_M51],
};
