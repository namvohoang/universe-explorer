// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The source gives no temperature. The colour in the Hipparcos Catalogue (B−V 0.966 for HIP
// 10826) would tint it like a far warmer star than the cool red giant the source describes,
// and the source says its light is highly variable. So no colour is recorded, and the star is
// shown by its picture, not as a tinted model.
import type { Star } from '../types';
import { s, unknown } from './helpers';
import { ESA_HIPPARCOS, NASA_HUBBLE_MIRA } from './sources';

export const mira: Star = {
  id: 'mira',
  kind: 'star',
  name: 'Mira',
  parentId: null,
  orbit: null,
  shape: null,
  massKg: unknown('The source used gives no mass for this star.'),
  effectiveTemperatureK: unknown('The source calls it a cool red giant and gives no temperature.'),
  radiusInSuns: s(
    700,
    'nasa-hubble-mira',
    'Source says: corresponding to a diameter some 700 times larger than our Sun',
  ),
  spectralType: s(
    'M5e-M9e',
    'esa-hipparcos',
    'Spectral type of HIP 10826 (Omicron Ceti) in the Hipparcos Catalogue, read from the CDS VizieR copy (I/239/hip_main).',
  ),
  sky: {
    raDeg: s(34.83661103, 'esa-hipparcos', 'HIP 10826.'),
    decDeg: s(-2.97706055, 'esa-hipparcos', 'HIP 10826.'),
    distanceLy: s(400, 'nasa-hubble-mira', 'Source says: At a distance of about 400 light-years'),
  },
  media: [
    {
      file: 'public/media/deep/mira.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltMira',
      credit: 'Margarita Karovska (Harvard-Smithsonian Center for Astrophysics) and NASA',
    },
  ],
  sources: [ESA_HIPPARCOS, NASA_HUBBLE_MIRA],
};
