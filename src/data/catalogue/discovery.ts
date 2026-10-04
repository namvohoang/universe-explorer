// Values are copied from the museum record in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This is a real spacecraft kept in the Smithsonian's National Air and Space Museum. It has
// no orbit here: it is shown as the museum's 3D scan of it, to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { SI_DISCOVERY } from './sources';

export const discovery: Spacecraft = {
  id: 'discovery',
  kind: 'spacecraft',
  name: 'Space Shuttle Discovery',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.019015, 0.019015, 0.019015],
      'si-discovery',
      'Half of the 38.03 m length the museum measures, used for all three so the model keeps its real shape.',
    ),
    orientation: {
      axialTiltDeg: unknown('It is shown as a model, not in flight.'),
      poleRaDeg: unknown('It is shown as a model, not in flight.'),
      poleDecDeg: unknown('It is shown as a model, not in flight.'),
      rotationPeriodHours: unknown('It is shown as a model, not in flight.'),
      rotation: 'prograde',
    },
  },
  massKg: s(73176.5, 'si-discovery', 'As the museum gives it: 73176.5kg.'),
  firstUsedYear: s(1984, 'si-discovery', 'Source says: It entered service in 1984'),
  media: [
    {
      file: 'public/media/models/discovery.glb',
      kind: 'composite',
      role: 'model',
      altKey: 'modelAltDiscovery',
      credit: 'Smithsonian National Air and Space Museum',
    },
  ],
  sources: [SI_DISCOVERY],
};
