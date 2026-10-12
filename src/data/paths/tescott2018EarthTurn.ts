// Written by tools/horizons/fetchTurn.ts on 2026-10-12. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2018-05-02T00:41:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 69.18547 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const TESCOTT_2018_EARTH_TURN: BodyTurn = {
  atJd: { value: 2458240.52927298, sourceId: 'jpl-horizons-turn-tescott2018earthturn' },
  primeMeridian: {
    value: [-0.644040217, -0.70142606, 0.305309157],
    sourceId: 'jpl-horizons-turn-tescott2018earthturn',
  },
};
