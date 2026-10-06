// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_51_PEGASI, NASA_EXOPLANET_ARCHIVE_STARS } from './sources';

export const pegasi51: Star = {
  id: '51-pegasi',
  kind: 'star',
  name: '51 Pegasi',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as 1.07 times the Sun's."),
  effectiveTemperatureK: s(5761, 'nasa-exoplanet-archive-stars', 'st_teff of host 51 Peg.'),
  radiusInSuns: s(
    1.19,
    'nasa-exoplanet-archive-stars',
    'st_rad of host 51 Peg, in radii of the Sun.',
  ),
  spectralType: s('G5V', 'nasa-exoplanet-archive-stars', 'st_spectype of host 51 Peg.'),
  sky: {
    raDeg: s(344.36604441, 'esa-hipparcos', 'HIP 113357.'),
    decDeg: s(20.7686841, 'esa-hipparcos', 'HIP 113357.'),
    distanceLy: s(51, 'nasa-51-pegasi', "Source says: It's 51 light-years from Earth"),
  },
  media: [
    {
      file: 'public/media/deep/51-pegasi.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAlt51Pegasi',
      credit: 'ESO/Digitized Sky Survey 2',
    },
  ],
  sources: [ESA_HIPPARCOS, NASA_51_PEGASI, NASA_EXOPLANET_ARCHIVE_STARS],
};
