// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2025-09-29T14:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.182382 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const MARACAIBO_2025_EARTH_TURN: BodyTurn = {
  atJd: { value: 2460948.084134055, sourceId: 'jpl-horizons-turn-maracaibo2025earthturn' },
  primeMeridian: {
    value: [-0.785255171, -0.567283433, 0.248120584],
    sourceId: 'jpl-horizons-turn-maracaibo2025earthturn',
  },
};
