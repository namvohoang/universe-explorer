// Written by tools/horizons/fetchAscent.ts on 2026-10-07. Do not edit a number by hand: run the tool again.
// Rows of NASA SP-2000-4029 'Apollo by the Numbers', Apollo 11 ascent phase: event, ground elapsed time (s), altitude (n mi), geocentric latitude (deg N), longitude (deg E). The row 'S-IC center engine cutoff' is left out: its longitude, -81.1517, is west of the launch pad while the rows either side are east of it, so it is taken for a misprint and not guessed at.
// The table's page is the source 'nasa-sp4029-apollo11-ascent' in src/data/stories/sources.ts.
// Each row's place on Earth was given to JPL Horizons as a point fixed to Earth, and Horizons
// said where that point was at that instant: km from Earth's centre, ecliptic of J2000.
// Heights in nautical miles are turned to km at 1.852 km each. Times are clock time (UTC) as
// Julian dates; Horizons' own clock was 39.747142 s ahead and was asked accordingly.
import type { BodyTurn, StagedPath } from '../types';

export const APOLLO_11_ASCENT: StagedPath = {
  centreId: 'earth',
  points: {
    sourceId: 'nasa-sp4029-apollo11-ascent',
    value: [
      [2440419.063896181, 3043.073, 5523.146, 924.035],
      [2440419.06465625, 3022.519, 5544.141, 919.473],
      [2440419.064849537, 3016.258, 5554.182, 919.148],
      [2440419.065759606, 2934.793, 5656.076, 927.598],
      [2440419.065767361, 2933.511, 5657.405, 927.754],
      [2440419.069220139, 1903.282, 6190.638, 995.177],
      [2440419.070234028, 1368.763, 6334.185, 1015.834],
      [2440419.070243055, 1363.502, 6335.352, 1016.014],
      [2440419.071982986, 273.104, 6475.119, 1035.477],
      [2440419.072098727, 190.87, 6477.983, 1035.645],
    ],
  },
};

/** Which way latitude 0, longitude 0 on Earth pointed at the first instant above. */
export const APOLLO_11_ASCENT_TURN: BodyTurn = {
  atJd: { value: 2440419.063896181, sourceId: 'nasa-sp4029-apollo11-ascent' },
  primeMeridian: {
    value: [-0.738498847, 0.617736943, -0.270223097],
    sourceId: 'jpl-horizons-earth-turn-apollo11ascent',
  },
};
