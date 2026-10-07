// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_OSIRIS_REX } from './sources';

export const osirisRex: Spacecraft = {
  id: 'osiris-rex',
  kind: 'spacecraft',
  name: 'OSIRIS-REx',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    2016,
    'nasa-osiris-rex',
    'Source says: Launched on Sept. 8, 2016. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/osiris-rex.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltOsirisRex',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [NASA_OSIRIS_REX],
};
