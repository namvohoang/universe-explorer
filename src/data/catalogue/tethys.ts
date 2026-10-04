// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_TETHYS, NSSDC_SATURN_MOONS } from './sources';

export const tethys: Moon = {
  id: 'tethys',
  kind: 'moon',
  name: 'Tethys',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([538, 528, 526], 'nssdc-saturn-moons', 'Source gives 538 x 528 x 526.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(6.18e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-tethys'),
    semiMajorAxisKm: s(
      294980,
      'jpl-horizons-tethys',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.00097,
      'jpl-horizons-tethys',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      27.2207,
      'jpl-horizons-tethys',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      167.9977,
      'jpl-horizons-tethys',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        158.0571,
        'jpl-horizons-tethys',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        350.3828,
        'jpl-horizons-tethys',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1.887802,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/tethys.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltTethys',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_HORIZONS_TETHYS, NSSDC_SATURN_MOONS],
};
