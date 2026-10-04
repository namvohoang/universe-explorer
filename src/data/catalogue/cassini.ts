// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft no longer flies, so it has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_CASSINI_FACTS } from './sources';

export const cassini: Spacecraft = {
  id: 'cassini',
  kind: 'spacecraft',
  name: 'Cassini',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.00335, 0.00335, 0.00335],
      'nasa-cassini-facts',
      'Half of the 6.7 metres the source gives for its height, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    2125,
    'nasa-cassini-facts',
    'Source says: Weight at end of mission: 4,685 pounds (2,125 kilograms)',
  ),
  media: [
    {
      file: 'public/media/models/cassini.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltCassini',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_CASSINI_FACTS],
};
