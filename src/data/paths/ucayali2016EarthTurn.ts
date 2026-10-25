// Written by tools/horizons/fetchTurn.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2016-07-15T15:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 68.183678 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const UCAYALI_2016_EARTH_TURN: BodyTurn = {
  atJd: { value: 2457585.125789163, sourceId: 'jpl-horizons-turn-ucayali2016earthturn' },
  primeMeridian: {
    value: [-0.93157026, 0.334158148, -0.143231221],
    sourceId: 'jpl-horizons-turn-ucayali2016earthturn',
  },
};
