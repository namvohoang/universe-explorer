// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2025-11-15T04:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182754 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const HIMALAYA_2025_EARTH_TURN: BodyTurn = {
  atJd: { value: 2460994.667467393, sourceId: 'jpl-horizons-turn-himalaya2025earthturn' },
  primeMeridian: {
    value: [-0.409421241, 0.837458054, -0.361992065],
    sourceId: 'jpl-horizons-turn-himalaya2025earthturn',
  },
};
