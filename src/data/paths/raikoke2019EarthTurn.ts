// Written by tools/horizons/fetchTurn.ts on 2026-10-12. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2019-06-21T02:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.184397 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const RAIKOKE_2019_EARTH_TURN: BodyTurn = {
  atJd: { value: 2458655.584134079, sourceId: 'jpl-horizons-turn-raikoke2019earthturn' },
  primeMeridian: {
    value: [0.48080731, -0.804834659, 0.347944682],
    sourceId: 'jpl-horizons-turn-raikoke2019earthturn',
  },
};
