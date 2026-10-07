// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Star } from '../types';
import { s } from './helpers';
import { NSSDC_SUN } from './sources';

export const sun: Star = {
  id: 'sun',
  kind: 'star',
  name: 'Sun',
  parentId: null,
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      695700,
      'nssdc-sun',
      'Source gives one mean radius and a flattening of 0.00005, too small to show; the same radius is used for both.',
    ),
    polarRadiusKm: s(
      695700,
      'nssdc-sun',
      'Source gives one mean radius and a flattening of 0.00005, too small to show; the same radius is used for both.',
    ),
    orientation: {
      axialTiltDeg: s(
        7.25,
        'nssdc-sun',
        'Source gives obliquity to the ecliptic, since the Sun has no orbit here.',
      ),
      poleRaDeg: s(286.13, 'nssdc-sun'),
      poleDecDeg: s(63.87, 'nssdc-sun'),
      rotationPeriodHours: s(609.12, 'nssdc-sun'),
      rotation: 'prograde',
    },
  },
  massKg: s(1988400e24, 'nssdc-sun'),
  effectiveTemperatureK: s(5772, 'nssdc-sun'),
  spectralType: s('G2 V', 'nssdc-sun'),
  sky: null,
  orbit: null,
  media: [
    {
      file: 'public/media/models/sun.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSun',
      credit: 'NASA. The page gives no credit line.',
    },
    {
      file: 'public/media/deep/sun.webp',
      kind: 'false-colour',
      role: 'picture',
      altKey: 'pictureAltSun',
      credit: 'NASA/SDO',
    },
  ],
  sources: [NSSDC_SUN],
};
