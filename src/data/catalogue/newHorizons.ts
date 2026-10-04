// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. Its size is the
// one the Smithsonian measured on the example it keeps.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_NEW_HORIZONS, SI_NEW_HORIZONS } from './sources';

export const newHorizons: Spacecraft = {
  id: 'new-horizons',
  kind: 'spacecraft',
  name: 'New Horizons',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0013715, 0.0013715, 0.0013715],
      'si-new-horizons',
      'Half of the 274.3 cm the museum measures across its full-scale model of New Horizons, used for all three so the model keeps its real shape.',
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
  firstUsedYear: s(2006, 'nasa-new-horizons', 'Source says: Launch Date and Time Jan. 19, 2006'),
  media: [
    {
      file: 'public/media/models/new-horizons.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltNewHorizons',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_NEW_HORIZONS, SI_NEW_HORIZONS],
};
