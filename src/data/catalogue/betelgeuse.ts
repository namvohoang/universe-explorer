// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { NASA_BETELGEUSE } from './sources';

export const betelgeuse: Star = {
  id: 'betelgeuse',
  kind: 'star',
  name: 'Betelgeuse',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown("The source gives the mass only as around 15 times the Sun's."),
  effectiveTemperatureK: s(
    3573,
    'nasa-betelgeuse',
    'Source says: a surface temperature of over 3,300 degrees Celsius. Converted to kelvin (+273).',
  ),
  radiusInSuns: s(700, 'nasa-betelgeuse', 'Source says: about 700 times the size of the Sun'),
  spectralType: unknown('The source calls it a red supergiant and gives no spectral type.'),
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(700, 'nasa-betelgeuse', 'Source says: around 700 light-years away'),
  },
  media: [
    {
      file: 'public/media/deep/betelgeuse.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltBetelgeuse',
      credit: 'Andrea Dupree (Harvard-Smithsonian CfA), Ronald Gilliland (STScI), NASA and ESA',
    },
  ],
  sources: [NASA_BETELGEUSE],
};
