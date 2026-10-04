// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Exoplanet } from '../types';
import { s, unknown } from './helpers';
import { NASA_EXOPLANET_ARCHIVE, NASA_TRAPPIST1 } from './sources';

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
  system: {
    starRadiusInSuns: s(0.1192, 'nasa-exoplanet-archive'),
    starTemperatureK: s(2566.0, 'nasa-exoplanet-archive'),
    planets: s(
      [
        ['TRAPPIST-1 b', 1.116, 0.01154, 1.510826],
        ['TRAPPIST-1 c', 1.097, 0.0158, 2.421937],
        ['TRAPPIST-1 d', 0.788, 0.02227, 4.049219],
        ['TRAPPIST-1 e', 0.92, 0.02925, 6.101013],
        ['TRAPPIST-1 f', 1.045, 0.03849, 9.20754],
        ['TRAPPIST-1 g', 1.129, 0.04683, 12.352446],
        ['TRAPPIST-1 h', 0.755, 0.06189, 18.772866],
      ],
      'nasa-exoplanet-archive',
      'Each row: name, radius in Earths, semi-major axis in AU, orbital period in days.',
    ),
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
  sources: [NASA_EXOPLANET_ARCHIVE, NASA_TRAPPIST1],
};
