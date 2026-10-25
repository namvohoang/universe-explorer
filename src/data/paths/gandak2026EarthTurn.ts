// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2026-09-20T05:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182429 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const GANDAK_2026_EARTH_TURN: BodyTurn = {
  atJd: { value: 2461303.709134056, sourceId: 'jpl-horizons-turn-gandak2026earthturn' },
  primeMeridian: {
    value: [0.27960304, 0.880586078, -0.382609851],
    sourceId: 'jpl-horizons-turn-gandak2026earthturn',
  },
};
