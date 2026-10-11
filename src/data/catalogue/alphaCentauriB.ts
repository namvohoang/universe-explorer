// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The archive keeps one row per study of this star, and they differ a little; the radius is
// Takeda et al. 2007's, the one row that gives its error (0.88 ± 0.02 Suns), and the
// temperature Turnbull 2015's, as for Alpha Centauri A.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_CHANDRA_ALF_CEN, NASA_EXOPLANET_ARCHIVE_ALF_CEN } from './sources';

export const alphaCentauriB: Star = {
  id: 'alpha-centauri-b',
  kind: 'star',
  name: 'Alpha Centauri B',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources give the mass only in Suns, and the studies differ.'),
  effectiveTemperatureK: s(
    5178,
    'nasa-exoplanet-archive-alf-cen',
    'st_teff of alf Cen B, the row from Turnbull 2015.',
  ),
  radiusInSuns: s(
    0.88,
    'nasa-exoplanet-archive-alf-cen',
    'st_rad of alf Cen B, the row from Takeda et al. 2007 (error 0.02).',
  ),
  colourBV: s(0.9, 'esa-hipparcos', 'B−V of HIP 71681 in the Hipparcos Catalogue.'),
  spectralType: s('K1V', 'esa-hipparcos', 'Spectral type of HIP 71681 in the Hipparcos Catalogue.'),
  sky: {
    raDeg: s(219.91412833, 'esa-hipparcos'),
    decDeg: s(-60.83947139, 'esa-hipparcos'),
    distanceLy: s(
      4,
      'nasa-chandra-alf-cen',
      'Source says: Alpha Centauri is a triple star system located just over four light years, or about 25 trillion miles, from Earth.',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_ALF_CEN, NASA_CHANDRA_ALF_CEN],
};
