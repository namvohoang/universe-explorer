// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Earth (399) from the centre of body 10, as JPL Horizons gives it every 2m from
// 2027-08-02 07:00 to 2027-08-02 13:30 (TDB), ecliptic of J2000, km and km/s. Of 196 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-eclipse2027earth'`; the page is in catalogue/sources.ts. */
export const ECLIPSE_2027_EARTH: SampledPath = {
  centreId: 'sun',
  samples: {
    sourceId: 'jpl-horizons-path-eclipse2027earth',
    value: [
      [2461619.791666667, 96391923.895, -117308463.744, 6874.504, 22.541362, 18.808215, -0.000084],
      [2461620.0625, 96918382.684, -116867127.064, 6872.496, 22.455029, 18.912798, -0.000088],
    ],
  },
};
