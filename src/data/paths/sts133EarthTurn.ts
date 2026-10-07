// Written by tools/horizons/fetchTurn.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body 399 pointed at 2011-02-26T13:00:00Z, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was 66.185322 s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const STS_133_EARTH_TURN: BodyTurn = {
  atJd: { value: 2455619.0424327, sourceId: 'jpl-horizons-turn-sts133earthturn' },
  primeMeridian: {
    value: [0.987372868, -0.145777503, 0.061997895],
    sourceId: 'jpl-horizons-turn-sts133earthturn',
  },
};
