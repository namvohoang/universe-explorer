// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { StarCluster } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M13 } from './sources';

export const herculesCluster: StarCluster = {
  id: 'hercules-cluster',
  kind: 'star-cluster',
  name: 'Messier 13',
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
    distanceLy: s(25000, 'nasa-hubble-m13', 'Source says: Located 25,000 light-years from Earth'),
  },
  media: [
    {
      file: 'public/media/deep/hercules-cluster.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltHerculesCluster',
      credit: 'ESA/Hubble and NASA',
    },
  ],
  sources: [NASA_HUBBLE_M13],
};
