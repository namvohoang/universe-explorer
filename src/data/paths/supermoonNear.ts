// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Moon (301) from the centre of body 399, as JPL Horizons gives it every 10m from
// 2026-12-24 01:10 to 2026-12-24 08:10 (TDB), ecliptic of J2000, km and km/s. Of 43 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-supermoonnear'`; the page is in catalogue/sources.ts. */
export const SUPERMOON_NEAR: SampledPath = {
  centreId: 'earth',
  samples: {
    sourceId: 'jpl-horizons-path-supermoonnear',
    value: [
      [2461398.548611111, -10229.694, 355773.371, 24260.76, -1.101052, -0.034537, -0.06419],
      [2461398.840277778, -37921.455, 353909.358, 22575.917, -1.095668, -0.113342, -0.069465],
    ],
  },
};
