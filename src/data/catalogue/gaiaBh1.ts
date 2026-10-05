// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { BlackHole } from '../types';
import { s, unknown } from './helpers';
import { ESA_GAIA_BLACK_HOLES } from './sources';

export const gaiaBh1: BlackHole = {
  id: 'gaia-bh1',
  kind: 'black-hole',
  name: 'Gaia BH1',
  parentId: null,
  orbit: null,
  shape: {
    type: 'horizon',
    massSolarMasses: s(
      10,
      'esa-gaia-black-holes',
      'Source says: approximately ten times more massive than our Sun',
    ),
  },
  emitsLight: s(false, 'esa-gaia-black-holes', 'Source says: they do not seem to emit any light'),
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      1560,
      'esa-gaia-black-holes',
      'Source says: located just 1560 light-years away from us',
    ),
  },
  media: [
    {
      file: 'public/media/deep/gaia-bh1.webp',
      kind: 'diagram',
      role: 'picture',
      altKey: 'pictureAltGaiaBh1',
      credit: 'ESA/Gaia/DPAC; CC BY-SA 3.0 IGO',
    },
  ],
  sources: [ESA_GAIA_BLACK_HOLES],
};
