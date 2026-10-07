// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s } from './helpers';
import { NASA_SPITZER } from './sources';

export const spitzer: Spacecraft = {
  id: 'spitzer',
  kind: 'spacecraft',
  name: 'Spitzer Space Telescope',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: s(950, 'nasa-spitzer', 'Source says: Spacecraft Mass 2,094 pounds (950 kilograms).'),
  firstUsedYear: s(
    2003,
    'nasa-spitzer',
    'Source says: Launch Date and Time Aug. 25, 2003. The year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/spitzer.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSpitzer',
      credit: 'NASA/Janice C. Lee; NASA/Robert L. Hurt',
    },
  ],
  sources: [NASA_SPITZER],
};
