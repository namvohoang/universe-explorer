// Written by tools/horizons/fetchTurn.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2027-01-15T00:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.18432 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const AURORA_2027_EARTH_TURN: BodyTurn = {
  atJd: { value: 2461420.500800745, sourceId: 'jpl-horizons-turn-aurora2027earthturn' },
  primeMeridian: {
    value: [-0.404730412, 0.839395329, -0.362779238],
    sourceId: 'jpl-horizons-turn-aurora2027earthturn',
  },
};
