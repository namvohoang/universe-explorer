// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Exoplanet } from '../types';
import { s, unknown } from './helpers';
import { NASA_TRAPPIST1 } from './sources';

export const trappist1: Exoplanet = {
  id: 'trappist-1',
  kind: 'exoplanet',
  name: 'TRAPPIST-1 planets',
  parentId: null,
  orbit: null,
  shape: null,
  radiusKm: unknown(
    'This record stands for seven planets; the source page gives no single radius.',
  ),
  massKg: unknown('This record stands for seven planets; the source page gives no single mass.'),
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(40, 'nasa-trappist-1', 'Source says: lies about 40 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/trappist-1.webp',
      kind: 'artist-concept',
      role: 'picture',
      altKey: 'pictureAltTrappist1',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  sources: [NASA_TRAPPIST1],
};
