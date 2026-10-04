// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_DIONE, NSSDC_SATURN_MOONS } from './sources';

export const dione: Moon = {
  id: 'dione',
  kind: 'moon',
  name: 'Dione',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([563, 561, 560], 'nssdc-saturn-moons', 'Source gives 563 x 561 x 560.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(11.0e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-dione'),
    semiMajorAxisKm: s(
      377652,
      'jpl-horizons-dione',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.002928,
      'jpl-horizons-dione',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      28.0414,
      'jpl-horizons-dione',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      169.4702,
      'jpl-horizons-dione',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        164.9354,
        'jpl-horizons-dione',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        332.0566,
        'jpl-horizons-dione',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        2.736915,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/dione.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltDione',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_HORIZONS_DIONE, NSSDC_SATURN_MOONS],
};
