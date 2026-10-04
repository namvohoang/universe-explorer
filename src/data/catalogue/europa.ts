// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS } from './sources';

export const europa: Moon = {
  id: 'europa',
  kind: 'moon',
  name: 'Europa',
  parentId: 'jupiter',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      1560.8,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      1560.8,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(480.0e20, 'nssdc-jupiter-moons'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(268.1, 'jpl-sat-elem-jupiter'),
      poleDecDeg: s(64.5, 'jpl-sat-elem-jupiter'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-jupiter', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(671100, 'jpl-sat-elem-jupiter'),
    eccentricity: s(0.009, 'jpl-sat-elem-jupiter'),
    inclinationDeg: s(0.5, 'jpl-sat-elem-jupiter'),
    longitudeOfAscendingNodeDeg: s(184.0, 'jpl-sat-elem-jupiter'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(45.0, 'jpl-sat-elem-jupiter'),
      meanAnomalyDeg: s(345.4, 'jpl-sat-elem-jupiter'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        3.551181,
        'nssdc-jupiter-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(1.394, 'jpl-sat-elem-jupiter'), direction: 'backward' },
      nodalPrecession: { periodYears: s(30.202, 'jpl-sat-elem-jupiter'), direction: 'backward' },
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/europa.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltEuropa',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS],
};
