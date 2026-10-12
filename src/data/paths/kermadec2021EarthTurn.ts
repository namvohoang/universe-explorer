// Written by tools/horizons/fetchTurn.ts on 2026-10-12. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2021-03-04T19:28:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.185447 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const KERMADEC_2021_EARTH_TURN: BodyTurn = {
  atJd: { value: 2459278.311911869, sourceId: 'jpl-horizons-turn-kermadec2021earthturn' },
  primeMeridian: {
    value: [-0.078569613, 0.914705612, -0.39640946],
    sourceId: 'jpl-horizons-turn-kermadec2021earthturn',
  },
};
