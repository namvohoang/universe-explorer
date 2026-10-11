// The launch of Discovery on STS-133, its last flight, from Florida on a February afternoon.
// Liftoff is NASA's own time for this flight. The rest are NASA's figures for a usual Shuttle
// flight, not measured on this one: the boosters separate 124 seconds after liftoff, 156,000
// feet up (47.5 km), and the main engines burn for about 8.5 minutes, when the empty tank is
// let go, about 113 km up. NASA gives no track over the ground for this flight: the line the
// Shuttle is drawn along heads north-east from the pad, into the plane of the space station's
// orbit, and is a drawing (see ../paths/sts133Ascent.ts), so the story is `staged`.
// Earth is turned so that Florida is where it really was at liftoff.
// Seen close up the Shuttle is NASA's model at its true size. The two boosters, then the tank,
// are let go as the parts of the model's file they are. The flame, the smoke, the tower, the
// clouds and the lean are drawings. The story stops 20 seconds after the tank lets go, to see it
// fall away; for those seconds the Shuttle is drawn holding the tank's height.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Sourced, Story } from '../types';
import { STS_133_ASCENT, STS_133_ASCENT_TURN } from '../paths/sts133Ascent';
import { s } from './sourced';
import {
  JPL_HORIZONS_EARTH_TURN_STS_133_ASCENT,
  NASA_SHUTTLE_MODEL,
  NASA_SHUTTLE_REFERENCE_ASCENT,
  NASA_SP4029_APOLLO_10_ASCENT,
  NASA_SRB_ET_FACTS,
  NASA_STS_133,
  NSSDC_EARTH_AIR,
} from './sources';

const FACTS = 'nasa-srb-et-facts';
const REFERENCE = 'nasa-shuttle-reference-ascent';
/** Liftoff, 4:53:24 p.m. EST (21:53:24 UTC) on 24 February 2011. */
const LIFTOFF_JD = 2455617.412083333;
/** An instant given as seconds after liftoff. */
const at = (seconds: number, sourceId: string, note: string): Sourced<number> =>
  s(LIFTOFF_JD + seconds / 86_400, sourceId, note);

const liftoff = s(
  LIFTOFF_JD,
  'nasa-sts-133',
  'Launch: "Feb. 24, 2011, at 4:53:24 p.m. EST" (21:53:24 UTC), from Launch Pad 39A.',
);
const boostersAway = at(
  124,
  FACTS,
  'Mission event table: "Booster separation from Shuttle", "124 seconds" after liftoff, "156,000 feet (47,549 meters)". A usual flight\'s figure, not measured on STS-133.',
);
const tankAway = at(
  510,
  REFERENCE,
  '"Approximately 8.5 minutes into the flight, with its propellant used, the tank is jettisoned"; "The main engines continue to operate for 8.5 minutes after launch".',
);

export const shuttleLaunch: Story = {
  id: 'shuttle-launch',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyShuttleLaunchTitle',
  noteKey: 'storyShuttleLaunchNote',
  actorIds: ['earth', 'sun'],
  craft: [
    {
      id: 'discovery-sts-133-launch',
      nameKey: 'craftDiscovery',
      path: STS_133_ASCENT,
      modelOfId: 'space-shuttle',
      fromGround: true,
      letsGo: [
        { atJd: boostersAway, part: 'boosters' },
        { atJd: tankAway, part: 'tank' },
      ],
      // Each of the two boosters blazes under its own nozzle. The Shuttle's three main engines
      // burn hydrogen from the tank, with a pale flame, from liftoff until the tank is let go
      // (NASA: "After the main engines were running, the boosters were ignited"; how long
      // before liftoff they start is not given, so their flame is drawn from liftoff).
      burns: [
        { fromJd: liftoff, untilJd: boostersAway, flame: 'bright', under: 'boosters' },
        {
          fromJd: liftoff,
          untilJd: tankAway,
          flame: 'faint',
          under: 'orbiter',
          nozzlesAt: s(
            [0, -27.07, 3.1],
            'nasa-space-shuttle-3d-model',
            "Measured on NASA's model on 2026-10-11, in metres: the bells of the three main engines end at y = -27.07, between x = -2.75 and 2.79 and z = 0.45 and 5.70; the orbiter's tail fin reaches further back, to y = -29.04.",
          ),
        },
      ],
      // It climbs heads down, hanging under its tank; once the tank is let go it is drawn
      // rolling over, belly to the ground. When the real Shuttle rolled is not given here, so
      // the roll is a drawing.
      belly: {
        inModel: s(
          [0, 0, -1],
          'nasa-space-shuttle-3d-model',
          "Measured on NASA's model on 2026-10-11: the orbiter lies on the +z side of the tank (its middle at z = 6.0 m, the tank's at z = -3.4 m), so its belly, fixed to the tank, faces -z.",
        ),
        turnsOverAtJd: s(
          tankAway.value,
          REFERENCE,
          'As the tank is let go; a moment chosen, as the roll is a drawing.',
        ),
      },
      tower: true,
    },
  ],
  air: {
    ofId: 'earth',
    scaleHeightKm: s(8.5, 'nssdc-earth-air', 'Terrestrial atmosphere: "Scale height: 8.5 km".'),
    clouds: true,
  },
  turned: { earth: STS_133_ASCENT_TURN },
  chapters: [
    {
      id: 'liftoff',
      // It opens with the last five seconds before liftoff, counted down as a clock does,
      // and the first seconds of the climb are played at that pace too.
      slowStart: { storySeconds: 15, overSeconds: 15 },
      atJd: at(-5, 'nasa-sts-133', 'Five seconds before liftoff.'),
      text: {
        key: 'storyShuttleLaunchLiftoff',
        sourceId: 'nasa-sts-133',
        quote:
          'Commander Steve Lindsey, Pilot Eric Boe and Mission Specialists Alvin Drew, Michael Barratt, Nicole Stott and Steve Bowen lifted off aboard Discovery on Feb. 24, 2011, from NASA’s Kennedy Space Center in Florida to begin Discovery’s pursuit of the station.',
      },
      lookAtId: 'discovery-sts-133-launch',
      closeUp: true,
    },
    {
      id: 'boosters-away',
      // So is each part coming away.
      slowStart: { storySeconds: 14, overSeconds: 6 },
      atJd: boostersAway,
      text: {
        key: 'storyShuttleLaunchBoostersAway',
        sourceId: REFERENCE,
        quote:
          'At an altitude of approximately 45 km (24 nautical miles), the boosters separate from the orbiter/external tank, descend on parachutes, and land in the Atlantic Ocean.',
      },
      lookAtId: 'discovery-sts-133-launch',
      closeUp: true,
    },
    {
      id: 'main-engines',
      atJd: at(240, REFERENCE, 'Four minutes after liftoff, a moment chosen between the two.'),
      text: {
        key: 'storyShuttleLaunchMainEngines',
        sourceId: REFERENCE,
        quote:
          'After the solid rockets are jettisoned, the main engines provide thrust which accelerates the Shuttle from 4,828 kilometers per hour (3,000 mph) to over 27,358 kilometers per hour (17,000 mph) in just six minutes to reach orbit.',
      },
      lookAtId: 'discovery-sts-133-launch',
      closeUp: true,
    },
    {
      id: 'tank-away',
      // Played slowly, to watch the tank fall away.
      slowStart: { storySeconds: 25, overSeconds: 10 },
      atJd: at(505, REFERENCE, 'Five seconds before the tank is let go.'),
      text: {
        key: 'storyShuttleLaunchTankAway',
        sourceId: REFERENCE,
        quote:
          'The now nearly empty tank separates and falls in a preplanned trajectory with the majority of it disintegrating in the atmosphere and the rest falling into the ocean.',
      },
      lookAtId: 'discovery-sts-133-launch',
      closeUp: true,
    },
  ],
  endJd: at(
    530,
    REFERENCE,
    "Twenty seconds after the tank is let go, to see it fall away: the path's last place, held at the tank's height, is a drawing.",
  ),
  sources: [
    NASA_STS_133,
    NASA_SRB_ET_FACTS,
    NASA_SHUTTLE_REFERENCE_ASCENT,
    NASA_SHUTTLE_MODEL,
    NASA_SP4029_APOLLO_10_ASCENT,
    JPL_HORIZONS_EARTH_TURN_STS_133_ASCENT,
    NSSDC_EARTH_AIR,
  ],
};
