// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// It is shown as a model to look at, and flies in the story of Artemis I round the Moon.
// Its id is not `orion`, which is the constellation.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { ESA_ORION_SERVICE_MODULE, NASA_ORION_KIDS } from './sources';

export const orionCraft: Spacecraft = {
  id: 'orion-craft',
  kind: 'spacecraft',
  name: 'Orion',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.008656, 0.008656, 0.008656],
      'esa-orion-service-module',
      'ESA: "the service module’s solar array unfolds to span 19 m". On the model the wings span 19.349 units from tip to tip and its longest side is 17.630 units, so its longest side is drawn 17.630 × 19 m / 19.349 = 17.31 m; half of that, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The sources give no mass for the craft as it flew.'),
  firstUsedYear: s(
    2014,
    'nasa-orion-kids',
    'Source says: Orion had its first flight test in 2014.',
  ),
  media: [
    {
      file: 'public/media/models/orion.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltOrionCraft',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  sources: [ESA_ORION_SERVICE_MODULE, NASA_ORION_KIDS],
};
