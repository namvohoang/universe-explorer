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

export const leo: Constellation = {
  id: 'leo',
  kind: 'constellation',
  name: 'Leo',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Regulus', 152.09358075, 11.96719513, 42.09, 1.36, -0.087], // HIP 49669, parallax ± 0.79 mas
      ['Eta Leonis', 151.83313948, 16.76266572, 1.53, 3.48, -0.031], // HIP 49583, parallax ± 0.77 mas
      ['Algieba', 154.99234054, 19.84186032, 25.96, 2.01, 1.128], // HIP 50583, parallax ± 0.83 mas
      ['Adhafera', 154.17251805, 23.4173284, 12.56, 3.43, 0.307], // HIP 50335, parallax ± 0.78 mas
      ['Rasalas', 148.19149028, 26.00708498, 24.52, 3.88, 1.222], // HIP 48455, parallax ± 0.87 mas
      ['Epsilon Leonis', 146.4629267, 23.77427792, 13.01, 2.97, 0.808], // HIP 47908, parallax ± 0.88 mas
      ['Zosma', 168.52671705, 20.52403384, 56.52, 2.56, 0.128], // HIP 54872, parallax ± 0.83 mas
      ['Chertan', 168.56017036, 15.4297631, 18.36, 3.33, -0.003], // HIP 54879, parallax ± 0.77 mas
      ['Denebola', 177.26615977, 14.57233687, 90.16, 2.14, 0.09], // HIP 57632, parallax ± 0.89 mas
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
    [2, 6],
    [6, 8],
    [8, 7],
    [7, 0],
    [6, 7],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
