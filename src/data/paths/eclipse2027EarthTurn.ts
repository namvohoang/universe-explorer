// Written by tools/horizons/fetchTurn.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2027-08-02T08:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.183249 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const ECLIPSE_2027_EARTH_TURN: BodyTurn = {
  atJd: { value: 2461619.834134066, sourceId: 'jpl-horizons-turn-eclipse2027earthturn' },
  primeMeridian: {
    value: [0.336441518, 0.863626519, -0.375441528],
    sourceId: 'jpl-horizons-turn-eclipse2027earthturn',
  },
};
