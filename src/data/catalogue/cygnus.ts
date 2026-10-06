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

export const cygnus: Constellation = {
  id: 'cygnus',
  kind: 'constellation',
  name: 'Cygnus',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Deneb', 310.3579727, 45.28033423, 1.01, 1.25, 0.092], // HIP 102098, parallax ± 0.57 mas
      ['Sadr', 305.55708346, 40.2566815, 2.14, 2.23, 0.673], // HIP 100453, parallax ± 0.51 mas
      ['Eta Cygni', 299.07665069, 35.08349079, 23.4, 3.89, 1.019], // HIP 98110, parallax ± 0.54 mas
      ['Albireo', 292.68035529, 27.9596948, 8.46, 3.05, 1.088], // HIP 95947, parallax ± 0.58 mas
      ['Fawaris', 296.24350878, 45.13069195, 19.07, 2.86, -0.002], // HIP 97165, parallax ± 0.45 mas
      ['Aljanah', 311.55180091, 33.96945334, 45.26, 2.48, 1.021], // HIP 102488, parallax ± 0.53 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [2, 3],
    [4, 1],
    [1, 5],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
