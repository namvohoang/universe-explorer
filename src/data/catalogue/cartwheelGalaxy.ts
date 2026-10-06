// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The source calls it a ring galaxy, made when a smaller galaxy passed through a spiral one.
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_WEBB_CARTWHEEL } from './sources';

export const cartwheelGalaxy: Galaxy = {
  id: 'cartwheel-galaxy',
  kind: 'galaxy',
  name: 'Cartwheel Galaxy',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'ring',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      500e6,
      'nasa-webb-cartwheel',
      'Source says: located about 500 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/cartwheel-galaxy.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltCartwheelGalaxy',
      credit: 'NASA, ESA, CSA, STScI, Webb ERO Production Team',
    },
  ],
  sources: [NASA_WEBB_CARTWHEEL],
};
