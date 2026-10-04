// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// How wide this star is, is not settled: other pages give anything from 600 to 2,100 Suns.
// The figure here is the one ESA/Hubble gives on the page of the picture used.
// The Hipparcos values were read from the CDS VizieR copy of the catalogue (I/239/hip_main).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, ESA_HUBBLE_VY_CMA, NASA_HUBBLE_VY_CMA } from './sources';

export const vyCanisMajoris: Star = {
  id: 'vy-canis-majoris',
  kind: 'star',
  name: 'VY Canis Majoris',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The sources used give no mass for this star.'),
  effectiveTemperatureK: unknown('The sources used give no temperature for this star.'),
  radiusInSuns: s(
    1400,
    'esa-hubble-vy-cma',
    'Source says: The diameter of this red hypergiant is about 1400 times larger than the Sun. Uncertain: see the note at the top of this file.',
  ),
  colourBV: s(2.057, 'esa-hipparcos', 'B−V of HIP 35793 in the Hipparcos Catalogue.'),
  spectralType: unknown('The sources call it a red hypergiant and give no spectral type.'),
  sky: {
    raDeg: unknown('Not taken from the sources used.'),
    decDeg: unknown('Not taken from the sources used.'),
    distanceLy: s(5000, 'nasa-hubble-vy-cma', 'Source says: Approximately 5,000 light-years'),
  },
  media: [
    {
      file: 'public/media/deep/vy-canis-majoris.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltVyCanisMajoris',
      credit: 'NASA / ESA and R. Humphreys (University of Minnesota)',
    },
  ],
  sources: [ESA_HIPPARCOS, ESA_HUBBLE_VY_CMA, NASA_HUBBLE_VY_CMA],
};
