// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_KEPLER } from './sources';

export const kepler: Spacecraft = {
  id: 'kepler',
  kind: 'spacecraft',
  name: 'Kepler',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    2009,
    'nasa-kepler',
    'Source says: Launched on March 6, 2009. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/kepler.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltKepler',
      credit: 'NASA/Brian E. Kumanchik; NASA/Christian A. Lopez',
    },
  ],
  sources: [NASA_KEPLER],
};
