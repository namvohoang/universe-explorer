// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_M31 } from './sources';

export const andromeda: Galaxy = {
  id: 'andromeda',
  kind: 'galaxy',
  name: 'Andromeda Galaxy',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    // The Hubble page says only "Spiral Galaxy". NASA's page on galaxy types (NASA_GALAXY_TYPES
    // in sources.ts) says: "Both the Milky Way and the Andromeda galaxies belong to a subtype
    // known as barred spirals".
    structure: 'barred-spiral',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      2.5e6,
      'nasa-hubble-m31',
      'Source says: only 2.5 million light-years from Earth, making it the nearest galaxy to our own Milky Way',
    ),
  },
  media: [
    {
      file: 'public/media/deep/andromeda.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltAndromeda',
      credit:
        'NASA, ESA, Benjamin F. Williams (UWashington), Zhuo Chen (UWashington), L. Clifton Johnson (Northwestern); Image Processing: Joseph DePasquale (STScI)',
    },
  ],
  sources: [NASA_HUBBLE_M31],
};
