// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. Its size is the
// one the Smithsonian measured on the example it keeps.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_GEMINI_KIDS, SI_GEMINI_VII } from './sources';

export const gemini: Spacecraft = {
  id: 'gemini',
  kind: 'spacecraft',
  name: 'Gemini',
  parentId: null,
  orbit: null,
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.001651, 0.001651, 0.001651],
      'si-gemini-vii',
      'Half of the 330.2 cm the museum measures for the Gemini VII capsule, used for all three so the model keeps its real shape.',
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
    1965,
    'nasa-gemini-kids',
    'Source says: The Gemini missions were flown in 1965 and 1966',
  ),
  media: [
    {
      file: 'public/media/models/gemini.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltGemini',
      credit: 'NASA. The page gives no credit line.',
    },
  ],
  sources: [NASA_GEMINI_KIDS, SI_GEMINI_VII],
};
