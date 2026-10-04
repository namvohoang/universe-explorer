// Values are copied from the catalogue in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Each star's distance comes from its parallax. For the far, bright stars here the parallax is
// small next to its error (given beside each row), so those distances are rough.
// Star names were matched to Hipparcos numbers with SIMBAD (CDS); no value comes from it.
// The lines are not data: they are one customary way of joining the stars.
import type { Constellation } from '../types';
import { s } from './helpers';
import { ESA_HIPPARCOS } from './sources';

export const southernCross: Constellation = {
  id: 'southern-cross',
  kind: 'constellation',
  name: 'Crux',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Acrux', 186.64975585, -63.09905586, 10.17, 0.77, -0.243], // HIP 60718, parallax ± 0.67 mas
      ['Mimosa', 191.93049537, -59.68873246, 9.25, 1.25, -0.238], // HIP 62434, parallax ± 0.61 mas
      ['Gacrux', 187.79137202, -57.11256922, 37.09, 1.59, 1.6], // HIP 61084, parallax ± 0.67 mas
      ['Imai', 183.78648733, -58.74890179, 8.96, 2.79, -0.193], // HIP 59747, parallax ± 0.6 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 2],
    [1, 3],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
