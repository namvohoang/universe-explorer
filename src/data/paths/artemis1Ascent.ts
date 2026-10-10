// Written by tools/horizons/fetchAscent.ts on 2026-10-10. Do not edit a number by hand: run the tool again.
// Artemis I's climb, counted from liftoff at 06:47:44 UTC (JPL Horizons' data sheet for Artemis I, -1023). Each row: event, seconds after liftoff (NASA's Artemis I blog), height (km), latitude, longitude. The heights are NASA's: 0 on the pad; 43.3 km at booster separation (SLS Reference Guide: 'Booster separation occurs at about 2 minutes 12 seconds, 142,000 ft. (43.3 km)'); 91 km at 3 min 40 s (NASA's 'What Is the Space Launch System? (Grades 5-8)': 'SLS is 57 miles (91 km) above Earth'); 161.5 km when the core stage lets go (SLS Reference Guide: 'more than 530,000 ft. (161.5 km) in altitude before it separates'). The pad is Launch Complex 39, Pad B, where NASA's table of Apollo 10's climb (SP-2000-4029) puts that flight at liftoff. NASA gives no track over the ground for Artemis I, so the other places are a drawing: due east of the pad, as far as Apollo 10 had gone from the same pad at the same second (that table's range, read straight-line between its rows).
// The table's page is the source 'nasa-sls-reference-guide-ascent' in src/data/stories/sources.ts.
// Each row's place on Earth was given to JPL Horizons as a point fixed to Earth, and Horizons
// said where that point was at that instant: km from Earth's centre, ecliptic of J2000.
// Heights are in km. Times are clock time (UTC) as
// Julian dates; Horizons' own clock was 69.182732 s ahead and was asked accordingly.
import type { BodyTurn, StagedPath } from '../types';

export const ARTEMIS_1_ASCENT: StagedPath = {
  centreId: 'earth',
  points: {
    sourceId: 'nasa-sls-reference-guide-ascent',
    value: [
      [2459899.783148148, 1328.875, 6202.416, 618.521],
      [2459899.784675926, 1242.08, 6265.187, 613.929],
      [2459899.785694445, 970.113, 6363.459, 593.339],
      [2459899.788877315, -166.175, 6513.672, 500.182],
    ],
  },
  drawn: {
    value:
      "The pad is where NASA's table of Apollo 10's climb, from the same pad (Launch Complex 39, Pad B), puts it at liftoff. The other places are drawn due east of the pad, as far as Apollo 10 had gone at the same second (that table's range, read straight-line between its rows): NASA gives Artemis I's heights but not its track over the ground.",
    sourceId: 'nasa-sp4029-apollo10-ascent',
  },
};

/** Which way latitude 0, longitude 0 on Earth pointed at the first instant above. */
export const ARTEMIS_1_ASCENT_TURN: BodyTurn = {
  atJd: { value: 2459899.783148148, sourceId: 'nasa-sls-reference-guide-ascent' },
  primeMeridian: {
    value: [-0.920303558, 0.359719785, -0.153762929],
    sourceId: 'jpl-horizons-earth-turn-artemis1ascent',
  },
};
