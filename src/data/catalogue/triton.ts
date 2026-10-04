// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_TRITON, NSSDC_NEPTUNE_MOONS } from './sources';

export const triton: Moon = {
  id: 'triton',
  kind: 'moon',
  name: 'Triton',
  parentId: 'neptune',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      1353.4,
      'nssdc-neptune-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      1353.4,
      'nssdc-neptune-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(214e20, 'nssdc-neptune-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-triton'),
    semiMajorAxisKm: s(
      354766,
      'jpl-horizons-triton',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.000146,
      'jpl-horizons-triton',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      130.2614,
      'jpl-horizons-triton',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      215.8591,
      'jpl-horizons-triton',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        91.1714,
        'jpl-horizons-triton',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        343.4607,
        'jpl-horizons-triton',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        5.876854,
        'nssdc-neptune-moons',
        'The orbital period of the NASA fact sheet, marked R for retrograde motion.',
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_TRITON, NSSDC_NEPTUNE_MOONS],
};
