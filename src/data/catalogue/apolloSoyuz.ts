// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_APOLLO_SOYUZ } from './sources';

export const apolloSoyuz: Spacecraft = {
  id: 'apollo-soyuz',
  kind: 'spacecraft',
  name: 'Apollo–Soyuz',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass that is read here.'),
  firstUsedYear: s(
    1975,
    'nasa-apollo-soyuz',
    'Source says: On July 15, 1975, an Apollo spacecraft launched carrying a crew of three and docked two days later on July 17, with a Soyuz spacecraft. The year of the joint flight.',
  ),
  media: [
    {
      file: 'public/media/models/apollo-soyuz.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltApolloSoyuz',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_APOLLO_SOYUZ],
};
