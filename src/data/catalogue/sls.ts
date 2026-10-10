// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// It is shown as a model to look at, and flies in the story of Artemis I's launch.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_SLS_KIDS, NASA_SLS_REFERENCE_GUIDE } from './sources';

export const sls: Spacecraft = {
  id: 'sls',
  kind: 'spacecraft',
  name: 'Space Launch System',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.04915, 0.04915, 0.04915],
      'nasa-sls-reference-guide',
      'Half of the 98.3 m the source gives for the Block 1 rocket\'s height ("Height: 322.4 ft. (98.3 m)"), used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The source gives only the weight with fuel at liftoff.'),
  firstUsedYear: s(
    2022,
    'nasa-sls-kids',
    'Source says: The first SLS mission was called Artemis I. It launched Nov. 16, 2022.',
  ),
  media: [
    {
      file: 'public/media/models/sls.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSls',
      credit: 'NASA. The page gives no credit line.',
    },
  ],
  sources: [NASA_SLS_REFERENCE_GUIDE, NASA_SLS_KIDS],
};
