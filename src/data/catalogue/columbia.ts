// Values are copied from the museum record in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This is a real spacecraft kept in the Smithsonian's National Air and Space Museum. It has
// no orbit here: it is shown as the museum's 3D scan of it, to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { SI_COLUMBIA } from './sources';

export const columbia: Spacecraft = {
  id: 'columbia',
  kind: 'spacecraft',
  name: 'Apollo 11 Command Module Columbia',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.001956, 0.001956, 0.001956],
      'si-columbia',
      'Half of the 391.2 cm the museum measures across it, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: s(4141.3, 'si-columbia', 'As the museum weighs it today: 9130lb. (4141.3kg).'),
  firstUsedYear: s(
    1969,
    'si-columbia',
    'Source says: On July 16, 1969, Neil Armstrong, Edwin "Buzz" Aldrin and Michael Collins were launched',
  ),
  media: [
    {
      file: 'public/media/models/columbia.glb',
      kind: 'composite',
      role: 'model',
      altKey: 'modelAltColumbia',
      credit: 'Smithsonian National Air and Space Museum',
    },
  ],
  sources: [SI_COLUMBIA],
};
