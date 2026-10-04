// Values are copied from the catalogue in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Each star's distance comes from its parallax. For the far, bright stars here the parallax is
// small next to its error (given beside each row), so those distances are rough.
// Star names were matched to Hipparcos numbers with SIMBAD (CDS); no value comes from it.
// The lines are not data: they are one customary way of joining the stars.
import type { Constellation } from '../types';
import { s } from './helpers';
import { ESA_HIPPARCOS } from './sources';

export const cassiopeia: Constellation = {
  id: 'cassiopeia',
  kind: 'constellation',
  name: 'Cassiopeia',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Caph', 2.29204036, 59.15021814, 59.89, 2.28, 0.38], // HIP 746, parallax ± 0.56 mas
      ['Schedar', 10.12661349, 56.53740928, 14.27, 2.24, 1.17], // HIP 3179, parallax ± 0.57 mas
      ['Gamma Cassiopeiae', 14.17708808, 60.71674966, 5.32, 2.15, -0.046], // HIP 4427, parallax ± 0.56 mas
      ['Ruchbah', 21.45251267, 60.23540347, 32.81, 2.66, 0.16], // HIP 6686, parallax ± 0.62 mas
      ['Segin', 28.59868107, 63.67014686, 7.38, 3.35, -0.15], // HIP 8886, parallax ± 0.57 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
