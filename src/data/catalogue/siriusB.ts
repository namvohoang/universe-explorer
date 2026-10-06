// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The width next to the Sun is worked out from the diameter the source gives, in kilometres.
// It is a white dwarf: what is left of a star that has used up its fuel.
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HUBBLE_SIRIUS } from './sources';

export const siriusB: Star = {
  id: 'sirius-b',
  kind: 'star',
  name: 'Sirius B',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source gives the mass only as 98 percent that of the Sun.'),
  effectiveTemperatureK: s(
    25273,
    'esa-hubble-sirius',
    "Source says: Sirius B's surface temperature to be 25,000 degrees C. Converted to kelvin (+273).",
  ),
  radiusInSuns: s(
    6000 / 695700,
    'esa-hubble-sirius',
    'Source says: Sirius B has a diameter of 12,000 kilometres. Half of it, divided by the radius of the Sun in this catalogue (695,700 km).',
  ),
  spectralType: unknown('The source calls it a white dwarf and gives no spectral type.'),
  sky: {
    raDeg: unknown('It goes round Sirius; the source used gives no sky position of its own.'),
    decDeg: unknown('It goes round Sirius; the source used gives no sky position of its own.'),
    distanceLy: s(8.6, 'esa-hubble-sirius', 'Source says: At 8.6 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/sirius-b.webp',
      kind: 'artist-concept',
      role: 'picture',
      altKey: 'pictureAltSiriusB',
      credit: 'ESA and NASA',
    },
  ],
  sources: [ESA_HUBBLE_SIRIUS],
};
