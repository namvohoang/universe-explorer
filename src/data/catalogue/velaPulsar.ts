// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { NeutronStar } from '../types';
import { s, unknown } from './helpers';
import { NASA_STAR_TYPES } from './sources';

export const velaPulsar: NeutronStar = {
  id: 'vela-pulsar',
  kind: 'neutron-star',
  name: 'Vela pulsar',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source says only that a neutron star packs more mass than the Sun.'),
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    // An older NASA page (Astronomy Picture of the Day, 9 June 2000) says "some 800 light-years".
    // The newer page is used.
    distanceLy: s(
      1000,
      'nasa-star-types',
      'Source says: The pulsar resides over 1,000 light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/vela-pulsar.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltVelaPulsar',
      credit: 'NASA/CXC/Univ of Toronto/M. Durant et al.',
    },
  ],
  sources: [NASA_STAR_TYPES],
};
