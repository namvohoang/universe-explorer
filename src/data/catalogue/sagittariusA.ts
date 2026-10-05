// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { BlackHole } from '../types';
import { s, unknown } from './helpers';
import { ESO_SGR_A } from './sources';

export const sagittariusA: BlackHole = {
  id: 'sagittarius-a',
  kind: 'black-hole',
  name: 'Sagittarius A*',
  parentId: null,
  orbit: null,
  shape: {
    type: 'horizon',
    massSolarMasses: s(
      4e6,
      'eso-sgr-a',
      'Source says: four million times more massive than our Sun',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(27000, 'eso-sgr-a', 'Source says: about 27 000 light-years away from Earth'),
  },
  media: [
    {
      file: 'public/media/deep/sagittarius-a.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltSagittariusA',
      credit: 'EHT Collaboration',
    },
  ],
  sources: [ESO_SGR_A],
};
