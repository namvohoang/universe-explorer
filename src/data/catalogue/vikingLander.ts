// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// This craft has no orbit here: it is shown as a model to look at.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { NASA_VIKING_1 } from './sources';

export const vikingLander: Spacecraft = {
  id: 'viking-lander',
  kind: 'spacecraft',
  name: 'Viking 1 lander',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  firstUsedYear: s(
    1975,
    'nasa-viking-1',
    'Source says: Aug. 20, 1975 / 21:22:00 UT. The launch date in the table of the page; the year it was launched.',
  ),
  media: [
    {
      file: 'public/media/models/viking-lander.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltVikingLander',
      credit: 'NASA/Michael D. Carbajal',
    },
  ],
  sources: [NASA_VIKING_1],
};
