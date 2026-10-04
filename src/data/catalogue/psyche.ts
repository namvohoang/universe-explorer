// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_PSYCHE_PERIOD, JPL_SBDB_PSYCHE } from './sources';

export const psyche: Asteroid = {
  id: 'psyche',
  kind: 'asteroid',
  name: 'Psyche',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [139, 119, 85.5],
      'jpl-sbdb-psyche',
      'Half of each of the three diameters the source gives (278 x 238 x 171 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(4.196, 'jpl-sbdb-psyche'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    2.3988e19,
    'jpl-sbdb-psyche',
    'Worked out from the GM the source gives (1.601 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-psyche'),
    semiMajorAxisAu: s(2.925720466462538, 'jpl-sbdb-psyche'),
    eccentricity: s(0.1349324738201893, 'jpl-sbdb-psyche'),
    inclinationDeg: s(3.098749116151128, 'jpl-sbdb-psyche'),
    longitudeOfAscendingNodeDeg: s(149.9753859305033, 'jpl-sbdb-psyche'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(230.0326782748359, 'jpl-sbdb-psyche'),
      meanAnomalyDeg: s(79.76939505329617, 'jpl-sbdb-psyche'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1825.187,
        'jpl-horizons-psyche-period',
        "Not printed on a page: the period that keeps this ellipse closest to JPL Horizons from 1810 to 2049 (within 1.6 degrees). The database's own period for its epoch, 1827.880 days, drifts 31 degrees by 1810.",
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_PSYCHE_PERIOD, JPL_SBDB_PSYCHE],
};
