// Written by tools/horizons/fetchTurn.ts on 2026-10-11. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2021-09-23T12:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182361 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const SAM_2021_EARTH_TURN: BodyTurn = {
  atJd: { value: 2459481.000800722, sourceId: 'jpl-horizons-turn-sam2021earthturn' },
  primeMeridian: {
    value: [-0.999206675, -0.035660984, 0.017728922],
    sourceId: 'jpl-horizons-turn-sam2021earthturn',
  },
};
