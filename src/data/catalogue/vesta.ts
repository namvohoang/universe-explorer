// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_VESTA } from './sources';

export const vesta: Asteroid = {
  id: 'vesta',
  kind: 'asteroid',
  name: 'Vesta',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [284.62, 277.24, 226.33],
      'jpl-sbdb-vesta',
      'Half of each of the three diameters the source gives (569.24 x 554.48 x 452.66 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: s(309.061, 'jpl-sbdb-vesta'),
      poleDecDeg: s(42.2324, 'jpl-sbdb-vesta'),
      rotationPeriodHours: s(5.34213, 'jpl-sbdb-vesta'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    2.5903e20,
    'jpl-sbdb-vesta',
    'Worked out from the GM the source gives (17.2882844 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-vesta'),
    semiMajorAxisAu: s(2.361365965127599, 'jpl-sbdb-vesta'),
    eccentricity: s(0.09020374382834395, 'jpl-sbdb-vesta'),
    inclinationDeg: s(7.143925545058711, 'jpl-sbdb-vesta'),
    longitudeOfAscendingNodeDeg: s(103.701293265032, 'jpl-sbdb-vesta'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(151.4686478221564, 'jpl-sbdb-vesta'),
      meanAnomalyDeg: s(81.19015607686903, 'jpl-sbdb-vesta'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(1325.389042911101, 'jpl-sbdb-vesta'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/vesta.glb',
      kind: 'agency-model',
      role: 'model',
      altKey: 'modelAltVesta',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_SBDB_VESTA],
};
