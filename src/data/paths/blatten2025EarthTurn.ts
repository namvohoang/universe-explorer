// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2025-05-18T10:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.185188 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const BLATTEN_2025_EARTH_TURN: BodyTurn = {
  atJd: { value: 2460813.917467421, sourceId: 'jpl-horizons-turn-blatten2025earthturn' },
  primeMeridian: {
    value: [0.898646553, 0.401581805, -0.176540156],
    sourceId: 'jpl-horizons-turn-blatten2025earthturn',
  },
};
