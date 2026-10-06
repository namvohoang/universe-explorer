// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The source gives the width only in words (almost three times the Sun's), so the model drawn
// from it is rough, and the card says almost three.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_APOD_VEGA } from './sources';

export const vega: Star = {
  id: 'vega',
  kind: 'star',
  name: 'Vega',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass for this star.'),
  effectiveTemperatureK: unknown('The sources used give no temperature for this star.'),
  radiusInSuns: s(
    3,
    'nasa-apod-vega',
    'Source says: has a diameter almost three times that of our Sun. Rough: see the note at the top of this file.',
  ),
  colourBV: s(-0.001, 'esa-hipparcos', 'B−V of HIP 91262 in the Hipparcos Catalogue.'),
  spectralType: s(
    'A0Vvar',
    'esa-hipparcos',
    'Spectral type of HIP 91262 in the Hipparcos Catalogue.',
  ),
  sky: {
    raDeg: s(279.23410832, 'esa-hipparcos'),
    decDeg: s(38.78299311, 'esa-hipparcos'),
    distanceLy: s(
      25,
      'nasa-apod-vega',
      'Source says: Vega is a bright blue star 25 light years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/vega.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltVega',
      credit:
        'NASA, ESA, CSA, STScI, S. Wolff (University of Arizona), K. Su (University of Arizona), A. Gáspár (University of Arizona)',
    },
  ],
  sources: [ESA_HIPPARCOS, NASA_APOD_VEGA],
};
