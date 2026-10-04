// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s } from './helpers';
import { NASA_PIONEER_10 } from './sources';

export const pioneer10: Spacecraft = {
  id: 'pioneer-10',
  kind: 'spacecraft',
  name: 'Pioneer 10',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: s(258, 'nasa-pioneer-10', 'Source says: Spacecraft Mass 569 pounds (258 kilograms)'),
  firstUsedYear: s(1972, 'nasa-pioneer-10', 'Source says: Launch March 2, 1972'),
  media: [
    {
      file: 'public/media/models/pioneer-10.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltPioneer10',
      credit: 'NASA/JPL/Eyes on the Solar System',
    },
  ],
  sources: [NASA_PIONEER_10],
};
