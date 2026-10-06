// Values are copied from the catalogue in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Each star's distance comes from its parallax. For the far, bright stars here the parallax is
// small next to its error (given beside each row), so those distances are rough.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
// Star names were matched to Hipparcos numbers with SIMBAD (CDS); no value comes from it.
// The lines are not data: they are one customary way of joining the stars.
import type { Constellation } from '../types';
import { s } from './helpers';
import { ESA_HIPPARCOS } from './sources';

export const littleDipper: Constellation = {
  id: 'little-dipper',
  kind: 'constellation',
  name: 'Little Dipper',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Polaris', 37.94614689, 89.26413805, 7.56, 1.97, 0.636], // HIP 11767, parallax ± 0.48 mas
      ['Yildun', 263.05373826, 86.58632924, 17.85, 4.35, 0.021], // HIP 85822, parallax ± 0.48 mas
      ['Epsilon Ursae Minoris', 251.49233961, 82.03725071, 9.41, 4.21, 0.897], // HIP 82080, parallax ± 0.67 mas
      ['Zeta Ursae Minoris', 236.01443312, 77.79449901, 8.68, 4.29, 0.038], // HIP 77055, parallax ± 0.47 mas
      ['Kochab', 222.67664751, 74.15547596, 25.79, 2.07, 1.465], // HIP 72607, parallax ± 0.52 mas
      ['Pherkad', 230.1822884, 71.83397308, 6.79, 3.0, 0.058], // HIP 75097, parallax ± 0.46 mas
      ['Eta Ursae Minoris', 244.37708768, 75.75470385, 33.52, 4.95, 0.393], // HIP 79822, parallax ± 0.47 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 3],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
