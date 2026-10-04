// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_IDA_PERIOD, JPL_SBDB_IDA } from './sources';

export const ida: Asteroid = {
  id: 'ida',
  kind: 'asteroid',
  name: 'Ida',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [29.9, 12.7, 9.3],
      'jpl-sbdb-ida',
      'Half of each of the three diameters the source gives (59.8x25.4x18.6 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(4.634, 'jpl-sbdb-ida'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    4.1203e16,
    'jpl-sbdb-ida',
    'Worked out from the GM the source gives (0.00275 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-ida'),
    semiMajorAxisAu: s(2.863348031699649, 'jpl-sbdb-ida'),
    eccentricity: s(0.04610962795708528, 'jpl-sbdb-ida'),
    inclinationDeg: s(1.130363094271507, 'jpl-sbdb-ida'),
    longitudeOfAscendingNodeDeg: s(323.5366609419851, 'jpl-sbdb-ida'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(113.2571826848795, 'jpl-sbdb-ida'),
      meanAnomalyDeg: s(49.64769088009876, 'jpl-sbdb-ida'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1768.564,
        'jpl-horizons-ida-period',
        "Not printed on a page: the period that keeps this ellipse closest to JPL Horizons from 1810 to 2049 (within 0.5 degrees). The database's own period for its epoch, 1769.741 days, drifts 10 degrees by 1810.",
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_IDA_PERIOD, JPL_SBDB_IDA],
};
