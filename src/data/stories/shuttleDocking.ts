// Space shuttle Discovery joining the International Space Station on its last flight, STS-133.
// The station's path is JPL Horizons' own for that afternoon (from its tracked orbit), and
// Earth is turned the way it faced. The instant of docking is NASA's: 2:14 p.m. EST on
// 26 February 2011, which is 19:14 UTC. No path of the shuttle itself has been found
// published anywhere, so it is drawn on the station's own path, a closing gap behind it
// (src/sim/trajectory.ts); the screen says its path is a drawing. The story starts six hours
// before docking, two days after the launch, which is told in words.
// Close up both are 3D models at their true sizes: NASA's model of the station and the
// museum's scan of Discovery itself. Discovery is drawn nose first along its path, and joins
// the end of the station that trails behind; where they meet and which way each faces are
// drawings. The station's model is of a later year than 2011, and the scan shows Discovery as
// it stands in the museum, its payload bay doors shut.
// (NASA's catalogue page for the flight gives the launch as 16:53 UT; NASA's own mission page
// gives 4:53 p.m. EST, which is 21:53 UT. The mission page is used.)
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { STS_133_EARTH_TURN } from '../paths/sts133EarthTurn';
import { STS_133_STATION } from '../paths/sts133Station';
import { s } from './sourced';
import {
  JPL_HORIZONS_PATH_STS_133_STATION,
  JPL_HORIZONS_TURN_STS_133_EARTH,
  NASA_ISS_MODEL,
  NASA_STS_133,
  NASA_STS_133_DOCKING_PHOTO,
  SI_DISCOVERY_SCAN,
  SI_DISCOVERY_SIZE,
} from './sources';

const DOCKING = 'nasa-sts-133-docking-photo';
const MISSION = 'nasa-sts-133';
const DOCKED_JD = 2455619.301388889;

export const shuttleDocking: Story = {
  id: 'shuttle-docking',
  group: 'space-flights',
  path: 'staged',
  titleKey: 'storyShuttleDockingTitle',
  noteKey: 'storyShuttleDockingNote',
  actorIds: ['earth', 'sun'],
  craft: [
    {
      id: 'space-station-2011',
      nameKey: 'craftSpaceStation',
      path: STS_133_STATION,
      modelOfId: 'iss',
      modelNose: s(
        [0, 0, -1],
        'nasa-iss-3d-model',
        "Measured on NASA's model on 2026-10-10: the American laboratory lies towards its +z end and the Russian service module towards -z. The station is drawn flying with the Russian end first, so that the shuttle coming up behind meets its American end; which way it flies is a drawing.",
      ),
    },
    {
      id: 'discovery-sts-133',
      nameKey: 'craftDiscovery',
      modelOfId: 'discovery',
      modelNose: s(
        [0, 0, 1],
        'si-discovery-scan',
        "Measured on the museum's scan on 2026-10-10: its tail fin stands at the -z end, so its nose points along +z.",
      ),
      path: {
        centreId: 'earth',
        followsId: 'space-station-2011',
        joinsAtJd: s(DOCKED_JD, DOCKING, 'Docking, 2:14 p.m. EST on 26 February 2011 (19:14 UTC).'),
        standsOffKm: s(
          0.03803,
          'si-discovery',
          'The museum measures Discovery 38.03 m long. A model is drawn from its tail, so staying its own length behind the station brings its nose to the end of the station.',
        ),
      },
    },
  ],
  turned: { earth: STS_133_EARTH_TURN },
  chapters: [
    {
      id: 'chasing',
      atJd: s(2455619.051388889, DOCKING, 'Six hours before docking.'),
      text: {
        key: 'storyShuttleDockingChasing',
        sourceId: MISSION,
        quote:
          'Commander Steve Lindsey, Pilot Eric Boe and Mission Specialists Alvin Drew, Michael Barratt, Nicole Stott and Steve Bowen lifted off aboard Discovery on Feb. 24, 2011, from NASA’s Kennedy Space Center in Florida to begin Discovery’s pursuit of the station.',
      },
      lookAtId: 'discovery-sts-133',
      closeUp: true,
    },
    {
      id: 'closing-in',
      atJd: s(2455619.259722222, DOCKING, 'One hour before docking.'),
      text: {
        key: 'storyShuttleDockingClosingIn',
        sourceId: DOCKING,
        quote:
          'The International Space Station is featured in this image photographed by an STS-133 crew member on space shuttle Discovery as the shuttle approaches the station during rendezvous and docking operations.',
      },
      lookAtId: 'discovery-sts-133',
      closeUp: true,
    },
    {
      id: 'last-metres',
      // The last minutes are played slowly, to watch the two come together.
      slowStart: { storySeconds: 120, overSeconds: 30 },
      atJd: s(DOCKED_JD - 2 / 1440, DOCKING, 'Two minutes before docking.'),
      text: {
        key: 'storyShuttleDockingLastMetres',
        sourceId: DOCKING,
        quote:
          'The International Space Station is featured in this image photographed by an STS-133 crew member on space shuttle Discovery as the shuttle approaches the station during rendezvous and docking operations.',
      },
      lookAtId: 'discovery-sts-133',
      closeUp: true,
    },
    {
      id: 'joined',
      atJd: s(DOCKED_JD, DOCKING, 'Docking, 19:14 UTC.'),
      text: {
        key: 'storyShuttleDockingJoined',
        sourceId: DOCKING,
        quote: 'Docking occurred at 2:14 p.m. (EST) on Feb. 26, 2011.',
      },
      lookAtId: 'space-station-2011',
      closeUp: true,
    },
  ],
  endJd: s(
    2455619.354166667,
    'jpl-horizons-path-sts133station',
    'An hour and a quarter after docking, within the samples.',
  ),
  sources: [
    JPL_HORIZONS_PATH_STS_133_STATION,
    JPL_HORIZONS_TURN_STS_133_EARTH,
    NASA_STS_133,
    NASA_STS_133_DOCKING_PHOTO,
    NASA_ISS_MODEL,
    SI_DISCOVERY_SCAN,
    SI_DISCOVERY_SIZE,
  ],
};
