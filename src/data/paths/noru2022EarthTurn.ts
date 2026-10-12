// Written by tools/horizons/fetchTurn.ts on 2026-10-11. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2022-09-23T03:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182379 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const NORU_2022_EARTH_TURN: BodyTurn = {
  atJd: { value: 2459845.625800722, sourceId: 'jpl-horizons-turn-noru2022earthturn' },
  primeMeridian: {
    value: [0.686342419, 0.666659306, -0.290687898],
    sourceId: 'jpl-horizons-turn-noru2022earthturn',
  },
};
