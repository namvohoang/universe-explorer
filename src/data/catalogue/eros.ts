// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_EROS } from './sources';

export const eros: Asteroid = {
  id: 'eros',
  kind: 'asteroid',
  name: 'Eros',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [17.2, 5.6, 5.6],
      'jpl-sbdb-eros',
      'Half of each of the three diameters the source gives (34.4x11.2x11.2 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: s(11.37, 'jpl-sbdb-eros'),
      poleDecDeg: s(17.22, 'jpl-sbdb-eros'),
      rotationPeriodHours: s(5.27, 'jpl-sbdb-eros'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    6.6868e15,
    'jpl-sbdb-eros',
    'Worked out from the GM the source gives (4.463e-04 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-eros'),
    semiMajorAxisAu: s(1.458243716760167, 'jpl-sbdb-eros'),
    eccentricity: s(0.2228779627700761, 'jpl-sbdb-eros'),
    inclinationDeg: s(10.82854410314273, 'jpl-sbdb-eros'),
    longitudeOfAscendingNodeDeg: s(304.2679713350896, 'jpl-sbdb-eros'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(178.9181319135911, 'jpl-sbdb-eros'),
      meanAnomalyDeg: s(62.51145501986792, 'jpl-sbdb-eros'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(643.1963890927677, 'jpl-sbdb-eros'),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SBDB_EROS],
};
