// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_APOLLO_KIDS } from './sources';

export const lunarModule: Spacecraft = {
  id: 'lunar-module',
  kind: 'spacecraft',
  name: 'Apollo Lunar Module',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    1969,
    'nasa-apollo-kids',
    'Source says: The first moon landing took place in 1969. The source does not say when a Lunar Module first flew.',
  ),
  media: [
    {
      file: 'public/media/models/lunar-module.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltLunarModule',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_APOLLO_KIDS],
};
