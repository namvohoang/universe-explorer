// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { CSA_CANADARM } from './sources';

export const canadarm: Spacecraft = {
  id: 'canadarm',
  kind: 'spacecraft',
  name: 'Canadarm',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    1981,
    'csa-canadarm',
    'Source says: Canadarm was deployed in space for the first time on November 13, 1981. The year it was first used in space.',
  ),
  media: [
    {
      file: 'public/media/models/canadarm.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltCanadarm',
      credit: 'DigitalSpace Corporation',
    },
  ],
  sources: [CSA_CANADARM],
};
