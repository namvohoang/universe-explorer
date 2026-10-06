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

export const scorpius: Constellation = {
  id: 'scorpius',
  kind: 'constellation',
  name: 'Scorpius',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Graffias', 241.35931206, -19.80539286, 6.15, 2.56, -0.065], // HIP 78820, parallax ± 1.12 mas
      ['Dschubba', 240.08338225, -22.62162024, 8.12, 2.29, -0.117], // HIP 78401, parallax ± 0.88 mas
      ['Fang', 239.71300283, -26.1140428, 7.1, 2.89, -0.18], // HIP 78265, parallax ± 0.84 mas
      ['Alniyat', 245.29717718, -25.59275259, 4.44, 2.9, 0.299], // HIP 80112, parallax ± 0.81 mas
      ['Antares', 247.35194804, -26.43194608, 5.4, 1.06, 1.865], // HIP 80763, parallax ± 1.68 mas
      ['Paikauhale', 248.97066423, -28.21596156, 7.59, 2.82, -0.206], // HIP 81266, parallax ± 0.78 mas
      ['Larawag', 252.54268738, -34.29260982, 49.85, 2.29, 1.144], // HIP 82396, parallax ± 0.81 mas
      ['Xamidimura', 252.96766195, -38.04732717, 3.97, 3.0, -0.2], // HIP 82514, parallax ± 1.2 mas
      ['Zeta Scorpii', 253.64627156, -42.36075916, 21.67, 3.62, 1.393], // HIP 82729, parallax ± 0.85 mas
      ['Eta Scorpii', 258.038233, -43.23849039, 45.56, 3.32, 0.441], // HIP 84143, parallax ± 0.79 mas
      ['Sargas', 264.32969072, -42.99782155, 11.99, 1.86, 0.406], // HIP 86228, parallax ± 0.84 mas
      ['Iota Scorpii', 266.89617137, -40.12698197, 1.82, 2.99, 0.509], // HIP 87073, parallax ± 0.73 mas
      ['Girtab', 265.62199908, -39.02992092, 7.03, 2.39, -0.171], // HIP 86670, parallax ± 0.73 mas
      ['Shaula', 263.40219373, -37.10374835, 4.64, 1.62, -0.231], // HIP 85927, parallax ± 0.9 mas
      ['Lesath', 262.69099501, -37.29574016, 6.29, 2.7, -0.179], // HIP 85696, parallax ± 0.81 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [1, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 14],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
