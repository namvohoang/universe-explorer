// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS } from './sources';

export const io: Moon = {
  id: 'io',
  kind: 'moon',
  name: 'Io',
  parentId: 'jupiter',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      1821.5,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      1821.5,
      'nssdc-jupiter-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(893.2e20, 'nssdc-jupiter-moons'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(268.1, 'jpl-sat-elem-jupiter'),
      poleDecDeg: s(64.5, 'jpl-sat-elem-jupiter'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-jupiter', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(421800, 'jpl-sat-elem-jupiter'),
    eccentricity: s(0.004, 'jpl-sat-elem-jupiter'),
    inclinationDeg: s(0.0, 'jpl-sat-elem-jupiter'),
    longitudeOfAscendingNodeDeg: s(0.0, 'jpl-sat-elem-jupiter'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(49.1, 'jpl-sat-elem-jupiter'),
      meanAnomalyDeg: s(330.9, 'jpl-sat-elem-jupiter'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1.769138,
        'nssdc-jupiter-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(1.333, 'jpl-sat-elem-jupiter'), direction: 'backward' },
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/io.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltIo',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_SAT_ELEM_JUPITER, NSSDC_JUPITER_MOONS],
};
