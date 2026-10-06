// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_APOD_RIGEL } from './sources';

export const rigel: Star = {
  id: 'rigel',
  kind: 'star',
  name: 'Rigel',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for this star.'),
  effectiveTemperatureK: unknown('The source says only that it is hotter than the Sun.'),
  radiusInSuns: s(74, 'nasa-apod-rigel', 'Source says: extends to about 74 times the solar radius'),
  colourBV: s(-0.03, 'esa-hipparcos', 'B−V of HIP 24436 in the Hipparcos Catalogue.'),
  spectralType: s(
    'B8Ia',
    'esa-hipparcos',
    'Spectral type of HIP 24436 in the Hipparcos Catalogue.',
  ),
  sky: {
    raDeg: s(78.63446353, 'esa-hipparcos'),
    decDeg: s(-8.20163919, 'esa-hipparcos'),
    distanceLy: s(860, 'nasa-apod-rigel', 'Source says: Some 860 light-years away'),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_APOD_RIGEL],
};
