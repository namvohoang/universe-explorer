// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Moon (301) from the centre of body 399, as JPL Horizons gives it every 2m from
// 2027-08-02 07:00 to 2027-08-02 13:30 (TDB), ecliptic of J2000, km and km/s. Of 196 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-eclipse2027moon'`; the page is in catalogue/sources.ts. */
export const ECLIPSE_2027_MOON: SampledPath = {
  centreId: 'earth',
  samples: {
    sourceId: 'jpl-horizons-path-eclipse2027moon',
    value: [
      [2461619.791666667, -217850.519, 283274.307, 2027.254, -0.87005, -0.667705, -0.101404],
      [2461620.0625, -237670.973, 266983.002, -348.597, -0.823326, -0.724144, -0.101578],
    ],
  },
};
