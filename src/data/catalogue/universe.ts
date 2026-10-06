// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Universe } from '../types';
import { s } from './helpers';
import { NASA_COSMIC_HISTORY } from './sources';

export const universe: Universe = {
  id: 'universe',
  kind: 'universe',
  name: 'Universe',
  parentId: null,
  orbit: null,
  shape: null,
  ageYears: s(13.8e9, 'nasa-cosmic-history', 'Source says: Around 13.8 billion years ago'),
  media: [
    {
      file: 'public/media/deep/universe.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltUniverse',
      credit: 'NASA/WMAP Science Team',
    },
  ],
  sources: [NASA_COSMIC_HISTORY],
};
