// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_STARS } from './sources';

export const aldebaran: Star = {
  id: 'aldebaran',
  kind: 'star',
  name: 'Aldebaran',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as 1.13 times the Sun's."),
  effectiveTemperatureK: s(
    4055,
    'nasa-exoplanet-archive-stars',
    'st_teff of host alf Tau (Aldebaran).',
  ),
  radiusInSuns: s(
    45.1,
    'nasa-exoplanet-archive-stars',
    'st_rad of host alf Tau (Aldebaran), in radii of the Sun.',
  ),
  spectralType: s(
    'K5 III',
    'nasa-exoplanet-archive-stars',
    'st_spectype of host alf Tau (Aldebaran).',
  ),
  sky: {
    raDeg: s(68.98000195, 'esa-hipparcos', 'HIP 21421.'),
    decDeg: s(16.50976164, 'esa-hipparcos', 'HIP 21421.'),
    distanceLy: s(
      65.1,
      'esa-hipparcos',
      'Worked out from the parallax of HIP 21421 (50.09 ± 0.95 milliarcseconds): 1000 / parallax parsecs, in light-years.',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_STARS],
};
