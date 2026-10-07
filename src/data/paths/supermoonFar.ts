// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Moon (301) from the centre of body 399, as JPL Horizons gives it every 10m from
// 2026-05-31 08:30 to 2026-05-31 15:30 (TDB), ecliptic of J2000, km and km/s. Of 43 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-supermoonfar'`; the page is in catalogue/sources.ts. */
export const SUPERMOON_FAR: SampledPath = {
  centreId: 'earth',
  samples: {
    sourceId: 'jpl-horizons-path-supermoonfar',
    value: [
      [2461191.854166667, -142200.339, -378796.303, -35114.714, 0.907556, -0.348465, 0.00832],
      [2461192.145833333, -119076.182, -386857.13, -34837.644, 0.927104, -0.291088, 0.013662],
    ],
  },
};
