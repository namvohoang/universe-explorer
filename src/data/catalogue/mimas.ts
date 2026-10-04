// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_MIMAS, NSSDC_SATURN_MOONS } from './sources';

export const mimas: Moon = {
  id: 'mimas',
  kind: 'moon',
  name: 'Mimas',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([208, 197, 191], 'nssdc-saturn-moons', 'Source gives 208 x 197 x 191.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(0.379e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-mimas'),
    semiMajorAxisKm: s(
      186037,
      'jpl-horizons-mimas',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.021756,
      'jpl-horizons-mimas',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      27.0027,
      'jpl-horizons-mimas',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      172.0569,
      'jpl-horizons-mimas',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        108.7254,
        'jpl-horizons-mimas',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        37.3981,
        'jpl-horizons-mimas',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        0.9424218,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_MIMAS, NSSDC_SATURN_MOONS],
};
