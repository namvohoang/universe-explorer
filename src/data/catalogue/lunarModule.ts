// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. Its size is the
// one the Smithsonian measured on the example it keeps.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_APOLLO_KIDS, SI_LUNAR_MODULE } from './sources';

export const lunarModule: Spacecraft = {
  id: 'lunar-module',
  kind: 'spacecraft',
  name: 'Apollo Lunar Module',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.00327, 0.00327, 0.00327],
      'si-lunar-module',
      'Half of the 654 cm the museum measures across Lunar Module 2, which it says is identical to the ones that landed, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    1969,
    'nasa-apollo-kids',
    'Source says: The first moon landing took place in 1969. The source does not say when a Lunar Module first flew.',
  ),
  media: [
    {
      file: 'public/media/models/lunar-module.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltLunarModule',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_APOLLO_KIDS, SI_LUNAR_MODULE],
};
