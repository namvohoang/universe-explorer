// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { ESA_HUBBLE_NGC4866 } from './sources';

export const ngc4866: Galaxy = {
  id: 'ngc-4866',
  kind: 'galaxy',
  name: 'NGC 4866',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    // The ESA/Hubble page names this galaxy NGC 4866 in its data table and in most of its text,
    // and twice writes "NGC 4886", which NASA's page on galaxy types repeats under the same
    // picture. The table's name is used.
    structure: 'lenticular',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  // Source says: The galaxy is seen from Earth as almost edge-on.
  seenFromEarth: 'edge-on',
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      80e6,
      'esa-hubble-ngc4866',
      'Source says: a lenticular galaxy situated about 80 million light-years from Earth',
    ),
  },
  media: [
    {
      file: 'public/media/deep/ngc-4866.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltNgc4866',
      credit: 'ESA/Hubble & NASA; Acknowledgement: Gilles Chapdelaine',
    },
  ],
  sources: [ESA_HUBBLE_NGC4866],
};
