// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2026-03-20T12:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.185584 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const WATER_CYCLE_2026_EARTH_TURN: BodyTurn = {
  atJd: { value: 2461120.000800759, sourceId: 'jpl-horizons-turn-watercycle2026earthturn' },
  primeMeridian: {
    value: [0.999190086, -0.037860391, 0.013629455],
    sourceId: 'jpl-horizons-turn-watercycle2026earthturn',
  },
};
