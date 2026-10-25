// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2025-05-21T17:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.185123 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const GRAND_CANYON_2025_EARTH_TURN: BodyTurn = {
  atJd: { value: 2460817.209134087, sourceId: 'jpl-horizons-turn-grandcanyon2025earthturn' },
  primeMeridian: {
    value: [-0.697953581, 0.657721694, -0.283307204],
    sourceId: 'jpl-horizons-turn-grandcanyon2025earthturn',
  },
};
