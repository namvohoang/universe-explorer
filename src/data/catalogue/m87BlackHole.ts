// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { BlackHole } from '../types';
import { s, unknown } from './helpers';
import { NASA_BIGGEST_BLACK_HOLES, NASA_FIRST_BLACK_HOLE_IMAGE } from './sources';

export const m87BlackHole: BlackHole = {
  id: 'm87-black-hole',
  kind: 'black-hole',
  name: 'M87*',
  parentId: null,
  orbit: null,
  shape: {
    type: 'horizon',
    massSolarMasses: s(
      5.4e9,
      'nasa-biggest-black-holes',
      'Source says: M87’s black hole, now with a updated mass of 5.4 billion Suns',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      55e6,
      'nasa-first-black-hole-image',
      'Source says: located about 55 million light years from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/m87-black-hole.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltM87BlackHole',
      credit: 'Event Horizon Telescope Collaboration',
    },
  ],
  sources: [NASA_FIRST_BLACK_HOLE_IMAGE, NASA_BIGGEST_BLACK_HOLES],
};
