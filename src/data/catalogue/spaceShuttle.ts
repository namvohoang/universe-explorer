// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft no longer flies, so it has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_SHUTTLE_KIDS, NASA_SHUTTLE_REFERENCE } from './sources';

export const spaceShuttle: Spacecraft = {
  id: 'space-shuttle',
  kind: 'spacecraft',
  name: 'Space Shuttle',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0280416, 0.0280416, 0.0280416],
      'nasa-shuttle-reference',
      'Half of the 184 feet the source gives for the length of the whole space shuttle, with its tank and boosters (56.1 metres), used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The source gives several liftoff weights, depending on the flight.'),
  firstUsedYear: s(
    1981,
    'nasa-shuttle-kids',
    'Source says: The first space shuttle flight took place April 12, 1981.',
  ),
  media: [
    {
      file: 'public/media/models/space-shuttle.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSpaceShuttle',
      credit: 'NASA/Johnson Space Center',
    },
  ],
  sources: [NASA_SHUTTLE_KIDS, NASA_SHUTTLE_REFERENCE],
};
