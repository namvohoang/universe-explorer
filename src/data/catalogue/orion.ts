// Values are copied from the catalogue in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Each star's distance comes from its parallax. For the far, bright stars here the parallax is
// small next to its error (given beside each row), so those distances are rough.
// Star names were matched to Hipparcos numbers with SIMBAD (CDS); no value comes from it.
// The lines are not data: they are one customary way of joining the stars.
import type { Constellation } from '../types';
import { s } from './helpers';
import { ESA_HIPPARCOS } from './sources';

export const orion: Constellation = {
  id: 'orion',
  kind: 'constellation',
  name: 'Orion',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Betelgeuse', 88.79287161, 7.40703634, 7.63, 0.45, 1.5], // HIP 27989, parallax ± 1.64 mas
      ['Bellatrix', 81.28278416, 6.34973451, 13.42, 1.64, -0.224], // HIP 25336, parallax ± 0.98 mas
      ['Mintaka', 83.00166562, -0.2990934, 3.56, 2.25, -0.175], // HIP 25930, parallax ± 0.83 mas
      ['Alnilam', 84.05338572, -1.20191725, 2.43, 1.69, -0.184], // HIP 26311, parallax ± 0.91 mas
      ['Alnitak', 85.18968672, -1.94257841, 3.99, 1.74, -0.199], // HIP 26727, parallax ± 0.79 mas
      ['Saiph', 86.93911641, -9.66960186, 4.52, 2.07, -0.168], // HIP 27366, parallax ± 0.77 mas
      ['Rigel', 78.63446353, -8.20163919, 4.22, 0.18, -0.03], // HIP 24436, parallax ± 0.81 mas
      ['Meissa', 83.78449043, 9.93416294, 3.09, 3.39, -0.16], // HIP 26207, parallax ± 0.78 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [4, 5],
    [5, 6],
    [6, 2],
    [7, 0],
    [7, 1],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
