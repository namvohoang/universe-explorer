// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { Asteroid } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_KLEOPATRA } from './sources';

/** A long asteroid with a narrow middle, like a dog's bone. */
export const kleopatra: Asteroid = {
  id: 'kleopatra',
  kind: 'asteroid',
  name: 'Kleopatra',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [138, 47, 39],
      'jpl-sbdb-kleopatra',
      'Half of each of the three diameters the source gives (276x94x78 km, each good to 15%).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: s(
        69,
        'jpl-sbdb-kleopatra',
        'The spin pole the source gives (R.A. 69, Dec. 42, good to 5 degrees).',
      ),
      poleDecDeg: s(42, 'jpl-sbdb-kleopatra'),
      rotationPeriodHours: s(5.385, 'jpl-sbdb-kleopatra'),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The source used gives no mass for this body.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-kleopatra'),
    semiMajorAxisAu: s(2.795272753074668, 'jpl-sbdb-kleopatra'),
    eccentricity: s(0.2501676832686795, 'jpl-sbdb-kleopatra'),
    inclinationDeg: s(13.11552664581115, 'jpl-sbdb-kleopatra'),
    longitudeOfAscendingNodeDeg: s(215.3098461839713, 'jpl-sbdb-kleopatra'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(179.7697642293943, 'jpl-sbdb-kleopatra'),
      meanAnomalyDeg: s(259.8567076625492, 'jpl-sbdb-kleopatra'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(1707.00468764572, 'jpl-sbdb-kleopatra'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/kleopatra.glb',
      kind: 'agency-model',
      role: 'model',
      altKey: 'modelAltKleopatra',
      credit: 'NASA. The page gives no credit line.',
    },
  ],
  sources: [JPL_SBDB_KLEOPATRA],
};
