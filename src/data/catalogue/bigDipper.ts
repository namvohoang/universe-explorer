// Values are copied from the catalogue in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Each star's distance comes from its parallax. For the far, bright stars here the parallax is
// small next to its error (given beside each row), so those distances are rough.
// Star names were matched to Hipparcos numbers with SIMBAD (CDS); no value comes from it.
// The lines are not data: they are one customary way of joining the stars.
import type { Constellation } from '../types';
import { s } from './helpers';
import { ESA_HIPPARCOS } from './sources';

export const bigDipper: Constellation = {
  id: 'big-dipper',
  kind: 'constellation',
  name: 'Big Dipper',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Dubhe', 165.93265365, 61.75111888, 26.38, 1.81, 1.061], // HIP 54061, parallax ± 0.53 mas
      ['Merak', 165.4599615, 56.38234478, 41.07, 2.34, 0.033], // HIP 53910, parallax ± 0.6 mas
      ['Phecda', 178.45725536, 53.69473296, 38.99, 2.41, 0.044], // HIP 58001, parallax ± 0.68 mas
      ['Megrez', 183.85603795, 57.03259792, 40.05, 3.32, 0.077], // HIP 59774, parallax ± 0.6 mas
      ['Alioth', 193.5068041, 55.95984301, 40.3, 1.76, -0.022], // HIP 62956, parallax ± 0.62 mas
      ['Mizar', 200.98091604, 54.92541525, 41.73, 2.23, 0.057], // HIP 65378, parallax ± 0.61 mas
      ['Alkaid', 206.8856088, 49.31330288, 32.39, 1.85, -0.099], // HIP 67301, parallax ± 0.74 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [3, 4],
    [4, 5],
    [5, 6],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
