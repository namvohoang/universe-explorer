// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The archive keeps one row per study of this star; the radius is Takeda et al. 2007's, the one
// row that gives its error (1.25 ± 0.03 Suns), and the temperature Turnbull 2015's.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_CHANDRA_ALF_CEN, NASA_EXOPLANET_ARCHIVE_ALF_CEN } from './sources';

export const alphaCentauriA: Star = {
  id: 'alpha-centauri-a',
  kind: 'star',
  name: 'Alpha Centauri A',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources give the mass only in Suns, and the studies differ.'),
  effectiveTemperatureK: s(
    5801,
    'nasa-exoplanet-archive-alf-cen',
    'st_teff of alf Cen A, the row from Turnbull 2015.',
  ),
  radiusInSuns: s(
    1.25,
    'nasa-exoplanet-archive-alf-cen',
    'st_rad of alf Cen A, the row from Takeda et al. 2007 (error 0.03).',
  ),
  colourBV: s(0.71, 'esa-hipparcos', 'B−V of HIP 71683 in the Hipparcos Catalogue.'),
  spectralType: s('G2V', 'esa-hipparcos', 'Spectral type of HIP 71683 in the Hipparcos Catalogue.'),
  sky: {
    raDeg: s(219.92041034, 'esa-hipparcos'),
    decDeg: s(-60.83514707, 'esa-hipparcos'),
    distanceLy: s(
      4,
      'nasa-chandra-alf-cen',
      'Source says: Alpha Centauri is a triple star system located just over four light years, or about 25 trillion miles, from Earth.',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_ALF_CEN, NASA_CHANDRA_ALF_CEN],
};
