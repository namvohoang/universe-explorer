// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The source gives its
// size only as nearly that of a tennis court, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_WEBB_OVERVIEW } from './sources';

export const webb: Spacecraft = {
  id: 'webb',
  kind: 'spacecraft',
  name: 'James Webb Space Telescope',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass that is read here.'),
  firstUsedYear: s(
    2021,
    'nasa-webb-overview',
    'Source says: Webb was launched on Dec 25, 2021. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/webb.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltWebb',
      credit: 'NASA/Christopher R. Meaney',
    },
  ],
  sources: [NASA_WEBB_OVERVIEW],
};
