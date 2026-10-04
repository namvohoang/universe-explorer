// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_PROXIMA } from './sources';

export const proximaCentauri: Star = {
  id: 'proxima-centauri',
  kind: 'star',
  name: 'Proxima Centauri',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as about an eighth of the Sun's."),
  effectiveTemperatureK: unknown('The source used gives no temperature for this star.'),
  spectralType: unknown('The source used gives no spectral type for this star.'),
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(4, 'nasa-hubble-proxima', 'Source says: just over four light-years from Earth'),
  },
  media: [
    {
      file: 'public/media/deep/proxima-centauri.webp',
      kind: 'photo',
      role: 'picture',
      altKey: 'pictureAltProximaCentauri',
      credit: 'NASA and ESA',
    },
  ],
  sources: [NASA_HUBBLE_PROXIMA],
};
