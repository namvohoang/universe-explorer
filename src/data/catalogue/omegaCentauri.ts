// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { StarCluster } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_C80 } from './sources';

export const omegaCentauri: StarCluster = {
  id: 'omega-centauri',
  kind: 'star-cluster',
  name: 'Omega Centauri',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cluster',
    diameterLy: s(
      450,
      'nasa-hubble-c80',
      'Source says: the cluster has a diameter of about 450 light-years',
    ),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      17000,
      'nasa-hubble-c80',
      'Source says: Located about 17,000 light-years away from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/omega-centauri.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltOmegaCentauri',
      credit: 'ESO',
    },
  ],
  sources: [NASA_HUBBLE_C80],
};
