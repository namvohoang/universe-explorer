// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, ESO_ANTARES } from './sources';

export const antares: Star = {
  id: 'antares',
  kind: 'star',
  name: 'Antares',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as about 12 times the Sun's."),
  effectiveTemperatureK: unknown(
    'The source calls it comparatively cool and gives no temperature.',
  ),
  radiusInSuns: s(
    700,
    'eso-antares',
    'Source says: a diameter about 700 times larger than the Sun’s',
  ),
  colourBV: s(1.865, 'esa-hipparcos', 'B−V of HIP 80763 in the Hipparcos Catalogue.'),
  spectralType: unknown('The source calls it a red supergiant and gives no spectral type.'),
  sky: {
    raDeg: s(247.35194804, 'esa-hipparcos'),
    decDeg: s(-26.43194608, 'esa-hipparcos'),
    distanceLy: s(
      604,
      'esa-hipparcos',
      'Worked out from the parallax of HIP 80763 (5.4 ± 1.68 milliarcseconds): 1000 / parallax parsecs, in light-years.',
    ),
  },
  media: [
    {
      file: 'public/media/deep/antares.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltAntares',
      credit: 'ESO/K. Ohnaka',
    },
  ],
  sources: [ESA_HIPPARCOS, ESO_ANTARES],
};
