// Written by tools/horizons/fetchAscent.ts on 2026-10-11. Do not edit a number by hand: run the tool again.
// Discovery's climb on STS-133, counted from liftoff at 4:53:24 p.m. EST (21:53:24 UTC) on 24 February 2011 (NASA's STS-133 page). Each row: event, seconds after liftoff, height (km), latitude, longitude. The heights and times are NASA's: 0 on the pad; 156,000 feet (47.549 km) at 124 seconds when the boosters separate (NASA Facts, 'Solid Rocket Boosters and External Tank'); about 113 km when the tank separates, 'approximately 8.5 minutes into the flight' (NASA's 'The Space Shuttle' reference page). These are NASA's figures for a usual flight, not measured on this one. The last row, 20 seconds after the tank lets go, is a drawing: it keeps the tank's height, so that the story can show the tank falling away. The pad is Launch Complex 39, Pad A, where NASA's table of Apollo 11's climb (SP-2000-4029) puts that flight at liftoff. NASA gives no track over the ground for STS-133, so the other places are a drawing: from the pad at 44.87 degrees east of north, the heading that leaves the pad in the plane of the space station's orbit (JPL Horizons, the station -125544 at 2011-02-24 21:54 TDB against Earth's equator: inclination 51.66 degrees), as far as Apollo 10 had gone at the same second (that table's range, read straight-line between its rows).
// The table's page is the source 'nasa-srb-et-facts' in src/data/stories/sources.ts.
// Each row's place on Earth was given to JPL Horizons as a point fixed to Earth, and Horizons
// said where that point was at that instant: km from Earth's centre, ecliptic of J2000.
// Heights are in km. Times are clock time (UTC) as
// Julian dates; Horizons' own clock was 66.185293 s ahead and was asked accordingly.
import type { BodyTurn, StagedPath } from '../types';

export const STS_133_ASCENT: StagedPath = {
  centreId: 'earth',
  points: {
    sourceId: 'nasa-srb-et-facts',
    value: [
      [2455617.412083333, 4166.137, 4647.654, 1288.848],
      [2455617.413518519, 4135.294, 4736.385, 1300.727],
      [2455617.417986111, 2966.993, 5452.097, 1872.496],
      [2455617.418217592, 2860.949, 5492.38, 1918.429],
    ],
  },
  drawn: {
    value:
      "The pad is where NASA's table of Apollo 11's climb puts it at liftoff (Launch Complex 39, Pad A). The other places are drawn north-east of the pad, the way that leaves it in the plane of the space station's orbit (JPL Horizons), as far as Apollo 10 had gone at the same second (NASA's table of its climb): NASA gives the Shuttle's heights but not this flight's track over the ground.",
    sourceId: 'nasa-sp4029-apollo10-ascent',
  },
};

/** Which way latitude 0, longitude 0 on Earth pointed at the first instant above. */
export const STS_133_ASCENT_TURN: BodyTurn = {
  atJd: { value: 2455617.412083333, sourceId: 'nasa-srb-et-facts' },
  primeMeridian: {
    value: [-0.539200716, 0.772922258, -0.334445469],
    sourceId: 'jpl-horizons-earth-turn-sts133ascent',
  },
};
