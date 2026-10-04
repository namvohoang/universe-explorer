// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_IAPETUS, NSSDC_SATURN_MOONS } from './sources';

export const iapetus: Moon = {
  id: 'iapetus',
  kind: 'moon',
  name: 'Iapetus',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([746, 746, 712], 'nssdc-saturn-moons', 'Source gives 746 x 746 x 712.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(18.1e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-iapetus'),
    semiMajorAxisKm: s(
      3562567,
      'jpl-horizons-iapetus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.027862,
      'jpl-horizons-iapetus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      17.2382,
      'jpl-horizons-iapetus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      139.6918,
      'jpl-horizons-iapetus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        229.6584,
        'jpl-horizons-iapetus',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        208.0176,
        'jpl-horizons-iapetus',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        79.330183,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_IAPETUS, NSSDC_SATURN_MOONS],
};
