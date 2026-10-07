// Written by tools/horizons/fetchPath.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Earth (399) from the centre of body 10, as JPL Horizons gives it every 2m from
// 2028-12-31 13:00 to 2028-12-31 21:00 (TDB), ecliptic of J2000, km and km/s. Of 241 samples the
// 2 here are the ones needed to draw the rest to within 1 km.
import type { SampledPath } from '../types';

/** Cite as `sourceId: 'jpl-horizons-path-eclipse2028earth'`; the page is in catalogue/sources.ts. */
export const ECLIPSE_2028_EARTH: SampledPath = {
  centreId: 'sun',
  samples: {
    sourceId: 'jpl-horizons-path-eclipse2028earth',
    value: [
      [2462137.041666667, -25494269.755, 144874675.627, -9500.929, -29.809912, -5.271236, 0.001684],
      [2462137.375, -26352351.787, 144720373.884, -9452.171, -29.778959, -5.444133, 0.001701],
    ],
  },
};
