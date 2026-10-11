// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// How wide this star is depends on how far away it is, which is known only roughly
// (2,900 ± 317 parsecs): the paper measured how wide it looks (5.48 milliarcseconds) and
// turned that into a size at that distance, 1,708 ± 192 Suns. Other studies put it closer and
// smaller. It is not in the Hipparcos Catalogue.
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ARROYO_TORRES_2013 } from './sources';

/**
 * Light-years in a parsec, from the IAU's definitions (2012 Resolution B2, 2015 Resolution B2):
 * a parsec is 648000/π au; a light-year is 299792.458 km/s for 365.25 days of 86400 s; an au
 * is 149597870.7 km. The catalogue may not reach into src/sim, so it is worked out here.
 */
const LIGHT_YEARS_PER_PARSEC =
  ((648_000 / Math.PI) * 149_597_870.7) / (299_792.458 * 365.25 * 86_400);

export const uyScuti: Star = {
  id: 'uy-scuti',
  kind: 'star',
  name: 'UY Scuti',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The paper only places it near tracks for stars of 20 to 40 Suns.'),
  effectiveTemperatureK: s(
    3365,
    'arroyo-torres-2013',
    'Source says: effective temperatures of ... 3365±134 K for UY Sct',
  ),
  radiusInSuns: s(
    1708,
    'arroyo-torres-2013',
    'Source says: we calculate radii of ... 1708±192 R⊙ for UY Sct. Uncertain: see the note at the top of this file.',
  ),
  spectralType: s('M4 Ia', 'arroyo-torres-2013', 'Source says: UY Sct (M4 Ia)'),
  sky: {
    raDeg: unknown('Not taken from the source used.'),
    decDeg: unknown('Not taken from the source used.'),
    distanceLy: s(
      2900 * LIGHT_YEARS_PER_PARSEC,
      'arroyo-torres-2013',
      'Table 3: d (pc) 2900 ± 317, the distance the paper used, in light-years.',
    ),
  },
  media: [],
  sources: [ARROYO_TORRES_2013],
};
