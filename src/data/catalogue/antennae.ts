// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Two spiral galaxies in the middle of a collision, recorded as one object of no regular shape.
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C60_61 } from './sources';

export const antennae: Galaxy = {
  id: 'antennae',
  kind: 'galaxy',
  name: 'Antennae Galaxies',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'irregular',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      65e6,
      'nasa-hubble-c60-61',
      'Source says: They are located about 65 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/antennae.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltAntennae',
      credit: 'ESA/Hubble & NASA',
    },
  ],
  sources: [NASA_HUBBLE_C60_61],
};
