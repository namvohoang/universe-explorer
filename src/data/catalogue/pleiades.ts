// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { StarCluster } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M45 } from './sources';

export const pleiades: StarCluster = {
  id: 'pleiades',
  kind: 'star-cluster',
  name: 'Pleiades',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cluster',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      445,
      'nasa-hubble-m45',
      'Source says: M45 is located roughly 445 light-years from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/pleiades.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltPleiades',
      credit:
        'NASA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: George Herbig and Theodore Simon (Institute for Astronomy, University of Hawaii)',
    },
  ],
  sources: [NASA_HUBBLE_M45],
};
