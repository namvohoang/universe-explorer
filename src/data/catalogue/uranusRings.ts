// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { RingSystem } from '../types';
import { s } from './helpers';
import { NSSDC_URANUS_RINGS } from './sources';

/**
 * The ten narrow main rings of Uranus, each only a few kilometres wide. The two broad, very
 * faint outer rings in the source (optical depth far below 0.01) are left out.
 */
export const uranusRings: RingSystem = {
  id: 'uranus-rings',
  kind: 'ring-system',
  name: 'Rings of Uranus',
  parentId: 'uranus',
  orbit: null,
  shape: {
    type: 'ring',
    innerRadiusKm: s(41837, 'nssdc-uranus-rings', 'Radius of ring 6, the innermost.'),
    outerRadiusKm: s(51149, 'nssdc-uranus-rings', 'Radius of the Epsilon ring, the outermost.'),
  },
  bands: [
    {
      type: 'ringlet',
      name: '6',
      radiusKm: s(41837, 'nssdc-uranus-rings'),
      opticalDepth: s([0.3, 0.3], 'nssdc-uranus-rings', 'Source gives ~0.3.'),
    },
    {
      type: 'ringlet',
      name: '5',
      radiusKm: s(42234, 'nssdc-uranus-rings'),
      opticalDepth: s([0.5, 0.5], 'nssdc-uranus-rings', 'Source gives ~0.5.'),
    },
    {
      type: 'ringlet',
      name: '4',
      radiusKm: s(42571, 'nssdc-uranus-rings'),
      opticalDepth: s([0.3, 0.3], 'nssdc-uranus-rings', 'Source gives ~0.3.'),
    },
    {
      type: 'ringlet',
      name: 'Alpha',
      radiusKm: s(44718, 'nssdc-uranus-rings'),
      opticalDepth: s([0.4, 0.4], 'nssdc-uranus-rings', 'Source gives ~0.4.'),
    },
    {
      type: 'ringlet',
      name: 'Beta',
      radiusKm: s(45661, 'nssdc-uranus-rings'),
      opticalDepth: s([0.3, 0.3], 'nssdc-uranus-rings', 'Source gives ~0.3.'),
    },
    {
      type: 'ringlet',
      name: 'Eta',
      radiusKm: s(47176, 'nssdc-uranus-rings'),
      opticalDepth: s([0.4, 0.4], 'nssdc-uranus-rings', 'Source gives ~0.4-.'),
    },
    {
      type: 'ringlet',
      name: 'Gamma',
      radiusKm: s(47627, 'nssdc-uranus-rings'),
      opticalDepth: s([0.3, 0.3], 'nssdc-uranus-rings', 'Source gives ~0.3+.'),
    },
    {
      type: 'ringlet',
      name: 'Delta',
      radiusKm: s(48300, 'nssdc-uranus-rings'),
      opticalDepth: s([0.5, 0.5], 'nssdc-uranus-rings', 'Source gives ~0.5.'),
    },
    {
      type: 'ringlet',
      name: 'Lambda',
      radiusKm: s(50024, 'nssdc-uranus-rings'),
      opticalDepth: s([0.1, 0.1], 'nssdc-uranus-rings', 'Source gives ~0.1.'),
    },
    {
      type: 'ringlet',
      name: 'Epsilon',
      radiusKm: s(51149, 'nssdc-uranus-rings'),
      opticalDepth: s([0.5, 2.3], 'nssdc-uranus-rings', 'Source gives 0.5-2.3.'),
    },
  ],
  media: [],
  sources: [NSSDC_URANUS_RINGS],
};
