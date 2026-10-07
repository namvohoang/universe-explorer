// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_FRIENDSHIP_7 } from './sources';

export const friendship7: Spacecraft = {
  id: 'friendship-7',
  kind: 'spacecraft',
  name: 'Friendship 7',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    1962,
    'nasa-friendship-7',
    'Source says: Launch of the Mercury-Atlas 6 mission on Feb. 20, 1962. The year it flew.',
  ),
  media: [
    {
      file: 'public/media/models/friendship-7.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltFriendship7',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_FRIENDSHIP_7],
};
