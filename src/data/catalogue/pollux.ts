// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_STARS, NASA_NSN_GEMINI } from './sources';

export const pollux: Star = {
  id: 'pollux',
  kind: 'star',
  name: 'Pollux',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as 2 times the Sun's."),
  effectiveTemperatureK: s(
    4892.63,
    'nasa-exoplanet-archive-stars',
    'st_teff of host HD 62509 (Pollux).',
  ),
  radiusInSuns: s(
    8.9,
    'nasa-exoplanet-archive-stars',
    'st_rad of host HD 62509 (Pollux), in radii of the Sun.',
  ),
  spectralType: s(
    'K0IIIvar',
    'nasa-exoplanet-archive-stars',
    'st_spectype of host HD 62509 (Pollux).',
  ),
  sky: {
    raDeg: s(116.33068263, 'esa-hipparcos', 'HIP 37826.'),
    decDeg: s(28.02631031, 'esa-hipparcos', 'HIP 37826.'),
    distanceLy: s(
      34,
      'nasa-nsn-gemini',
      'Source says: located about 34 light-years away from our Solar System',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_STARS, NASA_NSN_GEMINI],
};
