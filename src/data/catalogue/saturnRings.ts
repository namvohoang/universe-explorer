// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { RingSystem } from '../types';
import { s } from './helpers';
import { NSSDC_SATURN_RINGS } from './sources';

/**
 * Saturn's bright rings. The faint D, G and E rings (optical depth around a millionth) are
 * in the source but left out: they could not be seen next to these.
 */
export const saturnRings: RingSystem = {
  id: 'saturn-rings',
  kind: 'ring-system',
  name: 'Rings of Saturn',
  parentId: 'saturn',
  orbit: null,
  shape: {
    type: 'ring',
    innerRadiusKm: s(74658, 'nssdc-saturn-rings', 'Inner edge of the C ring.'),
    outerRadiusKm: s(139826, 'nssdc-saturn-rings', 'Radius of the F ring.'),
  },
  bands: [
    {
      type: 'band',
      name: 'C ring',
      innerRadiusKm: s(74658, 'nssdc-saturn-rings'),
      outerRadiusKm: s(91975, 'nssdc-saturn-rings'),
      opticalDepth: s([0.05, 0.35], 'nssdc-saturn-rings', 'Source gives 0.05 - 0.35.'),
    },
    {
      type: 'band',
      name: 'B ring',
      innerRadiusKm: s(91975, 'nssdc-saturn-rings'),
      outerRadiusKm: s(117507, 'nssdc-saturn-rings'),
      opticalDepth: s([0.4, 2.5], 'nssdc-saturn-rings', 'Source gives 0.4 - 2.5.'),
    },
    {
      type: 'band',
      name: 'Cassini division',
      innerRadiusKm: s(
        117507,
        'nssdc-saturn-rings',
        "The source gives no radii for the division; it lies between the B ring's outer edge and the A ring's inner edge.",
      ),
      outerRadiusKm: s(
        122340,
        'nssdc-saturn-rings',
        "The source gives no radii for the division; it lies between the B ring's outer edge and the A ring's inner edge.",
      ),
      opticalDepth: s([0, 0.1], 'nssdc-saturn-rings', 'Source gives 0 - 0.1.'),
    },
    {
      type: 'band',
      name: 'A ring',
      innerRadiusKm: s(122340, 'nssdc-saturn-rings'),
      outerRadiusKm: s(136780, 'nssdc-saturn-rings'),
      opticalDepth: s([0.4, 1.0], 'nssdc-saturn-rings', 'Source gives 0.4 - 1.0.'),
    },
    {
      type: 'ringlet',
      name: 'F ring',
      radiusKm: s(139826, 'nssdc-saturn-rings'),
      opticalDepth: s([0.1, 0.1], 'nssdc-saturn-rings', 'Source gives 0.1.'),
    },
  ],
  media: [],
  sources: [NSSDC_SATURN_RINGS],
};
