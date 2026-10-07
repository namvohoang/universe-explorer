// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s } from './helpers';
import { NASA_INGENUITY } from './sources';

export const ingenuity: Spacecraft = {
  id: 'ingenuity',
  kind: 'spacecraft',
  name: 'Ingenuity',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: s(1.8, 'nasa-ingenuity', 'Source says: Mass 3.97 pounds (1.8 kilograms).'),
  firstUsedYear: s(
    2021,
    'nasa-ingenuity',
    'Source says: its initial flight on April 19, 2021. The year it first flew.',
  ),
  media: [
    {
      file: 'public/media/models/ingenuity.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltIngenuity',
      credit: 'NASA/Brian E. Kumanchik',
    },
  ],
  sources: [NASA_INGENUITY],
};
