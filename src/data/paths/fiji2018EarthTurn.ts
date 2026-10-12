// Written by tools/horizons/fetchTurn.ts on 2026-10-12. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2018-08-19T00:19:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182837 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const FIJI_2018_EARTH_TURN: BodyTurn = {
  atJd: { value: 2458349.513995172, sourceId: 'jpl-horizons-turn-fiji2018earthturn' },
  primeMeridian: {
    value: [0.881489235, -0.433866843, 0.186376743],
    sourceId: 'jpl-horizons-turn-fiji2018earthturn',
  },
};
