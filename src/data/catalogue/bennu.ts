// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
// Bennu passes close to Earth every few years and each pass bends its path: against JPL
// Horizons this ellipse is within about 4 degrees from 2005 to 2049, and far out before 2000.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_BENNU } from './sources';

export const bennu: Asteroid = {
  id: 'bennu',
  kind: 'asteroid',
  name: 'Bennu',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.25235, 0.2459, 0.22835],
      'jpl-sbdb-bennu',
      'Half of each of the three diameters the source gives (0.5047 x 0.4918 x 0.4567 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: s(
        85.4522,
        'jpl-sbdb-bennu',
        'The pole the source gives: the one the asteroid turns anticlockwise about.',
      ),
      poleDecDeg: s(-60.3678, 'jpl-sbdb-bennu'),
      rotationPeriodHours: s(4.296061, 'jpl-sbdb-bennu'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    7.3272e10,
    'jpl-sbdb-bennu',
    'Worked out from the GM the source gives (4.8904e-9 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2455562.5, 'jpl-sbdb-bennu'),
    semiMajorAxisAu: s(1.126391025894812, 'jpl-sbdb-bennu'),
    eccentricity: s(0.2037450762416414, 'jpl-sbdb-bennu'),
    inclinationDeg: s(6.03494377024794, 'jpl-sbdb-bennu'),
    longitudeOfAscendingNodeDeg: s(2.06086619569642, 'jpl-sbdb-bennu'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(66.22306084084298, 'jpl-sbdb-bennu'),
      meanAnomalyDeg: s(101.703952002457, 'jpl-sbdb-bennu'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(436.6487281120201, 'jpl-sbdb-bennu'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/bennu.glb',
      kind: 'agency-model',
      role: 'model',
      altKey: 'modelAltBennu',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_SBDB_BENNU],
};
