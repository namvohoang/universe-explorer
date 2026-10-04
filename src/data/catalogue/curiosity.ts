// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_CURIOSITY } from './sources';

export const curiosity: Spacecraft = {
  id: 'curiosity',
  kind: 'spacecraft',
  name: 'Curiosity',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the rover.'),
  firstUsedYear: s(2011, 'nasa-curiosity', 'Source says: when it launched in 2011'),
  media: [
    {
      file: 'public/media/models/curiosity.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltCuriosity',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_CURIOSITY],
};
