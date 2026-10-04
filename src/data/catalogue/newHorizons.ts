// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_NEW_HORIZONS } from './sources';

export const newHorizons: Spacecraft = {
  id: 'new-horizons',
  kind: 'spacecraft',
  name: 'New Horizons',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(2006, 'nasa-new-horizons', 'Source says: Launch Date and Time Jan. 19, 2006'),
  media: [
    {
      file: 'public/media/models/new-horizons.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltNewHorizons',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_NEW_HORIZONS],
};
