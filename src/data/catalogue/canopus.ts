// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The source gives the width as a multiple of the Sun's (65 times wider), which is the same
// multiple for the radius.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_JSC_CANOPUS } from './sources';

export const canopus: Star = {
  id: 'canopus',
  kind: 'star',
  name: 'Canopus',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass for this star.'),
  effectiveTemperatureK: s(
    7800,
    'nasa-jsc-canopus',
    'Source says: a rare class “F” yellow-white (7800 Kelvin) super giant',
  ),
  radiusInSuns: s(
    65,
    'nasa-jsc-canopus',
    'Source says: It is 65 times wider and 15,000 times more luminous than the Sun',
  ),
  colourBV: s(0.164, 'esa-hipparcos', 'B−V of HIP 30438 in the Hipparcos Catalogue.'),
  spectralType: s(
    'F0Ib',
    'esa-hipparcos',
    'Spectral type of HIP 30438 in the Hipparcos Catalogue.',
  ),
  sky: {
    raDeg: s(95.98787763, 'esa-hipparcos'),
    decDeg: s(-52.69571799, 'esa-hipparcos'),
    distanceLy: s(
      300,
      'nasa-jsc-canopus',
      'Source says: Canopus is about 300 light years from Earth',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_JSC_CANOPUS],
};
