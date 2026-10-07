// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Moon (301) from the centre of body 399, as JPL Horizons gives it every 2m from
// 2028-12-31 13:00 to 2028-12-31 21:00 (TDB), ecliptic of J2000, km and km/s. Of 241 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-eclipse2028moon'`; the page is in catalogue/sources.ts. */
export const ECLIPSE_2028_MOON: SampledPath = {
  centreId: 'earth',
  samples: {
    sourceId: 'jpl-horizons-path-eclipse2028moon',
    value: [
      [2462137.041666667, -52406.003, 374568.005, 3389.311, -1.022724, -0.188908, -0.096017],
      [2462137.375, -81669.748, 367984.042, 616.323, -1.008398, -0.268212, -0.096452],
    ],
  },
};
