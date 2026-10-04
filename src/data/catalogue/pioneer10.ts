// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. Its size is the
// one the Smithsonian measured on the example it keeps.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_PIONEER_10, SI_PIONEER } from './sources';

export const pioneer10: Spacecraft = {
  id: 'pioneer-10',
  kind: 'spacecraft',
  name: 'Pioneer 10',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0014478, 0.0014478, 0.0014478],
      'si-pioneer',
      'Half of the 289.56 cm length the museum measures for its full-scale mock-up of Pioneer 10 and 11, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: s(258, 'nasa-pioneer-10', 'Source says: Spacecraft Mass 569 pounds (258 kilograms)'),
  firstUsedYear: s(1972, 'nasa-pioneer-10', 'Source says: Launch March 2, 1972'),
  media: [
    {
      file: 'public/media/models/pioneer-10.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltPioneer10',
      credit: 'NASA/JPL/Eyes on the Solar System',
    },
  ],
  sources: [NASA_PIONEER_10, SI_PIONEER],
};
