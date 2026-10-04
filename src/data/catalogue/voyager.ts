// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s } from './helpers';
import { NASA_VOYAGER_1 } from './sources';

export const voyager: Spacecraft = {
  id: 'voyager',
  kind: 'spacecraft',
  name: 'Voyager',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: s(
    721.9,
    'nasa-voyager-1',
    'Source says of Voyager 1: Spacecraft Mass 1,592 pounds (721.9 kilograms)',
  ),
  firstUsedYear: s(1977, 'nasa-voyager-1', 'Source says: The twin spacecraft launched in 1977.'),
  media: [
    {
      file: 'public/media/models/voyager.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltVoyager',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_VOYAGER_1],
};
