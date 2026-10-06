// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at. The source gives the
// size of its body and of each solar panel, not one overall size, so none is shown.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { ESA_ROSETTA } from './sources';

export const rosetta: Spacecraft = {
  id: 'rosetta',
  kind: 'spacecraft',
  name: 'Rosetta',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass that is read here.'),
  firstUsedYear: s(
    2004,
    'esa-rosetta',
    'Source says: Rosetta launched on 2 March 2004. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/rosetta.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltRosetta',
      credit: 'NASA. The page gives no credit line.',
    },
  ],
  sources: [ESA_ROSETTA],
};
