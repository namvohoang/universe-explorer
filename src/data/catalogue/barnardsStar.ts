// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, ESO_BARNARD_PLANET_2024, NASA_EXOPLANET_ARCHIVE_BARNARD } from './sources';

export const barnardsStar: Star = {
  id: 'barnards-star',
  kind: 'star',
  name: "Barnard's Star",
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as 0.162 times the Sun's."),
  effectiveTemperatureK: s(
    3195,
    'nasa-exoplanet-archive-barnard',
    "st_teff of Barnard's star, from González Hernández et al. 2024.",
  ),
  radiusInSuns: s(
    0.185,
    'nasa-exoplanet-archive-barnard',
    "st_rad of Barnard's star, from González Hernández et al. 2024.",
  ),
  colourBV: s(1.57, 'esa-hipparcos', 'B−V of HIP 87937 in the Hipparcos Catalogue.'),
  spectralType: s(
    'sdM4',
    'esa-hipparcos',
    'Spectral type of HIP 87937 in the Hipparcos Catalogue.',
  ),
  sky: {
    raDeg: s(269.45402305, 'esa-hipparcos'),
    decDeg: s(4.66828815, 'esa-hipparcos'),
    distanceLy: s(
      6,
      'eso-barnard-2024',
      'Source says: Located just six light-years away, Barnard’s star is the second-closest stellar system',
    ),
  },
  media: [],
  sources: [ESA_HIPPARCOS, NASA_EXOPLANET_ARCHIVE_BARNARD, ESO_BARNARD_PLANET_2024],
};
