// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_GEMINI_KIDS } from './sources';

export const gemini: Spacecraft = {
  id: 'gemini',
  kind: 'spacecraft',
  name: 'Gemini',
  parentId: null,
  orbit: null,
  shape: null,
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
  sources: [NASA_GEMINI_KIDS],
};
