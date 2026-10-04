// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS } from './sources';

export const callisto: Moon = {
  id: 'callisto',
  kind: 'moon',
  name: 'Callisto',
  parentId: 'jupiter',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      2410.3,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      2410.3,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(1075.9e20, 'nssdc-jupiter-moons'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(268.7, 'jpl-sat-elem-jupiter'),
      poleDecDeg: s(64.8, 'jpl-sat-elem-jupiter'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-jupiter', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(1882700, 'jpl-sat-elem-jupiter'),
    eccentricity: s(0.007, 'jpl-sat-elem-jupiter'),
    inclinationDeg: s(0.3, 'jpl-sat-elem-jupiter'),
    longitudeOfAscendingNodeDeg: s(309.1, 'jpl-sat-elem-jupiter'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(43.8, 'jpl-sat-elem-jupiter'),
      meanAnomalyDeg: s(87.4, 'jpl-sat-elem-jupiter'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        16.689017,
        'nssdc-jupiter-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(277.921, 'jpl-sat-elem-jupiter'), direction: 'forward' },
      nodalPrecession: { periodYears: s(577.264, 'jpl-sat-elem-jupiter'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS],
};
