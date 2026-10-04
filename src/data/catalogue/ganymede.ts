// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS } from './sources';

export const ganymede: Moon = {
  id: 'ganymede',
  kind: 'moon',
  name: 'Ganymede',
  parentId: 'jupiter',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      2631.2,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      2631.2,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(1481.9e20, 'nssdc-jupiter-moons'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(268.2, 'jpl-sat-elem-jupiter'),
      poleDecDeg: s(64.6, 'jpl-sat-elem-jupiter'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-jupiter', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(1070400, 'jpl-sat-elem-jupiter'),
    eccentricity: s(0.001, 'jpl-sat-elem-jupiter'),
    inclinationDeg: s(0.2, 'jpl-sat-elem-jupiter'),
    longitudeOfAscendingNodeDeg: s(58.5, 'jpl-sat-elem-jupiter'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(198.3, 'jpl-sat-elem-jupiter'),
      meanAnomalyDeg: s(324.8, 'jpl-sat-elem-jupiter'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        7.154553,
        'nssdc-jupiter-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(68.301, 'jpl-sat-elem-jupiter'), direction: 'forward' },
      nodalPrecession: { periodYears: s(137.812, 'jpl-sat-elem-jupiter'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS],
};
