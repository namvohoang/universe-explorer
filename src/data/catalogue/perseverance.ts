// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_PERSEVERANCE } from './sources';

export const perseverance: Spacecraft = {
  id: 'perseverance',
  kind: 'spacecraft',
  name: 'Perseverance',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the rover.'),
  firstUsedYear: s(
    2020,
    'nasa-perseverance',
    'Source says: Launch / Landing: July 30, 2020 / Feb. 18, 2021. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/perseverance.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltPerseverance',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  sources: [NASA_PERSEVERANCE],
};
