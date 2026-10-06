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

export const geminiTwins: Constellation = {
  id: 'gemini-twins',
  kind: 'constellation',
  name: 'Gemini',
  parentId: null,
  orbit: null,
  shape: null,
  stars: s(
    [
      ['Castor', 113.65001898, 31.88863645, 63.27, 1.58, 0.034], // HIP 36850, parallax ± 1.23 mas
      ['Pollux', 116.33068263, 28.02631031, 96.74, 1.16, 0.991], // HIP 37826, parallax ± 0.87 mas
      ['Mebsuta', 100.98304088, 25.13115531, 3.61, 3.06, 1.377], // HIP 32246, parallax ± 0.91 mas
      ['Tejat', 95.73996302, 22.51385027, 14.07, 2.87, 1.621], // HIP 30343, parallax ± 0.93 mas
      ['Propus', 93.71956952, 22.50682376, 9.34, 3.31, 1.6], // HIP 29655, parallax ± 1.99 mas
      ['Wasat', 110.0307889, 21.98233941, 55.45, 3.5, 0.374], // HIP 35550, parallax ± 0.85 mas
      ['Mekbuda', 106.02723079, 20.57029939, 2.79, 4.01, 0.899], // HIP 34088, parallax ± 0.81 mas
      ['Alhena', 99.42792641, 16.39941482, 31.12, 1.93, 0.001], // HIP 31681, parallax ± 2.33 mas
    ],
    'esa-hipparcos',
    'Each row: name, right ascension and declination (degrees, ICRS, epoch J1991.25), parallax (milliarcseconds), V magnitude, B−V colour.',
  ),
  lines: [
    [0, 1],
    [0, 2],
    [2, 3],
    [3, 4],
    [1, 5],
    [5, 6],
    [6, 7],
  ],
  media: [],
  sources: [ESA_HIPPARCOS],
};
