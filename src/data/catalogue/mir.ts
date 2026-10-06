// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The sources used give no
// overall size for it, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_MIR_FIRST_MODULE } from './sources';

export const mir: Spacecraft = {
  id: 'mir',
  kind: 'spacecraft',
  name: 'Mir',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass that is read here.'),
  firstUsedYear: s(
    1986,
    'nasa-mir-first-module',
    'Source says: On Feb. 19, 1986, the Soviet Union launched the first module of the Mir space station. The year its first part flew.',
  ),
  media: [
    {
      file: 'public/media/models/mir.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltMir',
      credit: 'NASA/Goddard Space Flight Center',
    },
  ],
  sources: [NASA_MIR_FIRST_MODULE],
};
