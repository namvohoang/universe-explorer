// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_DAWN_SPACECRAFT } from './sources';

export const dawn: Spacecraft = {
  id: 'dawn',
  kind: 'spacecraft',
  name: 'Dawn',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    2007,
    'nasa-dawn-spacecraft',
    'Source says: Launch Date: Sept. 27, 2007. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/dawn.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltDawn',
      credit: 'NASA/Brian E. Kumanchik',
    },
  ],
  sources: [NASA_DAWN_SPACECRAFT],
};
