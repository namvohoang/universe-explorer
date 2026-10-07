// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_EUROPA_CLIPPER } from './sources';

export const europaClipper: Spacecraft = {
  id: 'europa-clipper',
  kind: 'spacecraft',
  name: 'Europa Clipper',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    2024,
    'nasa-europa-clipper',
    'Source says: Europa Clipper launched Oct. 14, 2024. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/europa-clipper.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltEuropaClipper',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_EUROPA_CLIPPER],
};
