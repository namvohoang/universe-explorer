// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The size and distance are ESO's. ESO gives no temperature for this star alone, so it is
// the one in the study ESO's news was about (Crowther et al. 2010, Table 5: 53 ± 3 thousand
// kelvin). How heavy it is has been measured again since, and come out lower (NOIRLab 2022);
// it is still the heaviest star known. It is not in the Hipparcos Catalogue.
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { CROWTHER_2010, ESO_R136A1 } from './sources';

export const r136a1: Star = {
  id: 'r136a1',
  kind: 'star',
  name: 'R136a1',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('Estimates differ: 265 Suns (ESO 2010), 170 to 230 Suns (NOIRLab 2022).'),
  effectiveTemperatureK: s(53000, 'crowther-2010', 'Table 5: T∗ (kK) 53 ± 3 for a1.'),
  radiusInSuns: s(
    35,
    'eso-r136a1',
    'Source says: R136a1, which is blue, is about 35 times as large as the Sun.',
  ),
  spectralType: s('WN5h', 'crowther-2010', 'Table 5: Physical Properties of R136 WN5h stars.'),
  sky: {
    raDeg: unknown('Not taken from the sources used.'),
    decDeg: unknown('Not taken from the sources used.'),
    distanceLy: s(
      165000,
      'eso-r136a1',
      'Source says: the Large Magellanic Cloud, 165 000 light-years away',
    ),
  },
  media: [],
  sources: [ESO_R136A1, CROWTHER_2010],
};
