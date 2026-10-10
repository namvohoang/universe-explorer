// Orion's path and the Moon's are JPL Horizons' own, sampled by tools/horizons/fetchPath.ts.
// The times of the engine burn, the pass of the Moon and the dropping of the service module
// are the ones in Horizons' data sheet for the flight (UTC, to the minute); the samples agree
// with it: nearest the Moon's centre at 8,282 km, and farthest from Earth four minutes later.
// The path's own times are TDB, about a minute ahead of UTC. It starts three and a half hours
// after launch and stops 17 minutes before splashdown: Horizons holds no more.
// Close up Orion is NASA's model of it at its true size, the same one drawn for Artemis I. Its
// flame is the translunar injection burn, at the minute and for as long as the data sheet
// gives (UTC, moved onto the path's TDB clock). Which way it points is a drawing: nose first the
// way it moves. NASA's photo of the four astronauts stands beside it; they never left Orion.
// The sentences are in src/ui/strings/en.ts under each `key`; each rests on the quote beside it.
import type { Story } from '../types';
import { ARTEMIS_2_MOON } from '../paths/artemis2Moon';
import { ARTEMIS_2_ORION } from '../paths/artemis2Orion';
import { s } from './sourced';
import {
  JPL_HORIZONS_ARTEMIS_2,
  JPL_HORIZONS_PATH_ARTEMIS_2_MOON,
  JPL_HORIZONS_PATH_ARTEMIS_2_ORION,
  NASA_ARTEMIS_II,
} from './sources';

const PATH = 'jpl-horizons-path-artemis2orion';
const SHEET = 'jpl-horizons-artemis-2';
/** How far Horizons' clock (TDB) runs ahead of clock time (UTC) in these days, in days. */
const TDB_AHEAD_DAYS = 69.18 / 86_400;
/** The translunar injection burn, on the story's clock (TDB). */
const tliStart = s(
  2461133.492361111 + TDB_AHEAD_DAYS,
  SHEET,
  '"Start Translunar Injection burn (5m 55s)" at 2026-04-02 23:49 UTC.',
);
const tliEnd = s(tliStart.value + 355 / 86_400, SHEET, 'Five minutes 55 seconds after it starts.');

export const artemis2: Story = {
  id: 'artemis-2',
  group: 'space-flights',
  path: 'tracked',
  titleKey: 'storyArtemis2Title',
  noteKey: 'storyArtemis1Note',
  photos: [
    {
      media: {
        file: 'public/media/stories/artemis-2-crew.webp',
        kind: 'photo',
        role: 'picture',
        altKey: 'storyArtemis2CrewAlt',
        credit: 'NASA/Robert Markowitz',
      },
      captionKey: 'storyArtemis2Crew',
    },
  ],
  actorIds: ['earth', 'moon', 'sun'],
  craft: [
    {
      id: 'orion-spacecraft',
      nameKey: 'craftOrion',
      path: ARTEMIS_2_ORION,
      modelOfId: 'orion-craft',
      // Orion's main engine burns hypergolic propellants: in the vacuum of space its flame is
      // pale and hard to see.
      burns: [{ fromJd: tliStart, untilJd: tliEnd, flame: 'faint' }],
    },
  ],
  tracked: { moon: ARTEMIS_2_MOON },
  chapters: [
    {
      id: 'round-earth',
      atJd: s(2461132.590277778, PATH, 'The first sample, 2026-04-02 02:10.'),
      text: {
        key: 'storyArtemis2RoundEarth',
        sourceId: 'nasa-artemis-ii',
        quote:
          'NASA’s SLS (Space Launch System) rocket launched the Orion spacecraft carrying NASA astronauts Reid Wiseman, Victor Glover, and Christina Koch, along with CSA (Canadian Space Agency) astronaut Jeremy Hansen, on the Artemis II mission on April 1, 2026, from Operations and Support Building II at Kennedy Space Center in Florida.',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
    },
    {
      id: 'to-the-moon',
      // The burn is played slowly, to watch it.
      slowStart: { storySeconds: 480, overSeconds: 16 },
      atJd: s(
        2461133.492361111,
        SHEET,
        'Start of the translunar injection burn, 2026-04-02 23:49 UTC.',
      ),
      text: {
        key: 'storyArtemis2ToTheMoon',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Start Translunar Injection burn (5m 55s)',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
    },
    {
      id: 'round-the-moon',
      atJd: s(
        2461137.334027778,
        SHEET,
        'Three hours before the closest approach to the Moon, 2026-04-06 23:01 UTC.',
      ),
      text: {
        key: 'storyArtemis2RoundTheMoon',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Maximum distance Earth center (413146.2 km)',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
    },
    {
      id: 'coming-home',
      atJd: s(2461137.584027778, SHEET, 'Three hours after the closest approach to the Moon.'),
      text: {
        key: 'storyArtemis2ComingHome',
        sourceId: 'nasa-artemis-ii',
        quote:
          'Meet the astronauts who ventured around the Moon on Artemis II, the first crewed flight aboard NASA’s human deep space capabilities, paving the way for future lunar surface missions.',
      },
      lookAtId: 'orion-spacecraft',
      closeUp: true,
    },
    {
      id: 'landing',
      atJd: s(2461141.48125, SHEET, 'Crew and service module separation, 2026-04-10 23:33 UTC.'),
      text: {
        key: 'storyArtemis2Landing',
        sourceId: 'jpl-horizons-artemis-2',
        quote: 'Splashdown, Pacific Ocean, off Baja Cali.',
      },
      lookAtId: 'orion-spacecraft',
    },
  ],
  endJd: s(
    2461141.493055556,
    PATH,
    'The last sample, 2026-04-10 23:50, 17 minutes before splashdown.',
  ),
  sources: [
    JPL_HORIZONS_PATH_ARTEMIS_2_ORION,
    JPL_HORIZONS_PATH_ARTEMIS_2_MOON,
    JPL_HORIZONS_ARTEMIS_2,
    NASA_ARTEMIS_II,
  ],
};
