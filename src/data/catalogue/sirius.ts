// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The width next to the Sun is worked out from the diameter the source gives, in kilometres.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, ESA_HUBBLE_SIRIUS } from './sources';

export const sirius: Star = {
  id: 'sirius',
  kind: 'star',
  name: 'Sirius',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source gives the mass only as two times that of the Sun.'),
  effectiveTemperatureK: s(
    10273,
    'esa-hubble-sirius',
    'Source says: Sirius itself has a surface temperature of 10,000 degrees C. Converted to kelvin (+273).',
  ),
  radiusInSuns: s(
    1.2e6 / 695700,
    'esa-hubble-sirius',
    'Source says: a diameter of 2.4 million kilometres. Half of it, divided by the radius of the Sun in this catalogue (695,700 km).',
  ),
  spectralType: s(
    'A0m...',
    'esa-hipparcos',
    'Spectral type of HIP 32349 in the Hipparcos Catalogue.',
  ),
  sky: {
    raDeg: s(101.28854105, 'esa-hipparcos'),
    decDeg: s(-16.71314306, 'esa-hipparcos'),
    distanceLy: s(8.6, 'esa-hubble-sirius', 'Source says: At 8.6 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/sirius.webp',
      kind: 'photo',
      role: 'picture',
      altKey: 'pictureAltSirius',
      credit: 'NASA, ESA, H. Bond (STScI), and M. Barstow (University of Leicester)',
    },
  ],
  sources: [ESA_HIPPARCOS, ESA_HUBBLE_SIRIUS],
};
