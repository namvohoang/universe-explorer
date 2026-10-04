// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft no longer flies, so it has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_SATURN_V_KIDS } from './sources';

export const saturnV: Spacecraft = {
  id: 'saturn-v',
  kind: 'spacecraft',
  name: 'Saturn V',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0555, 0.0555, 0.0555],
      'nasa-saturn-v-kids',
      'Half of the 111 metres the source gives for its height, used for all three so the model keeps its real shape.',
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
  media: [
    {
      file: 'public/media/models/saturn-v.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSaturnV',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_SATURN_V_KIDS],
};
