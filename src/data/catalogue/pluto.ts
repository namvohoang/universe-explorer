// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { DwarfPlanet } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_PLUTO, NSSDC_PLUTO } from './sources';

export const pluto: DwarfPlanet = {
  id: 'pluto',
  kind: 'dwarf-planet',
  name: 'Pluto',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(1188, 'nssdc-pluto'),
    polarRadiusKm: s(1188, 'nssdc-pluto'),
    orientation: {
      axialTiltDeg: s(119.51, 'nssdc-pluto'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(
        153.2928,
        'nssdc-pluto',
        'Source gives a negative period to mark retrograde rotation.',
      ),
      rotation: 'retrograde',
    },
  },
  massKg: s(0.01303e24, 'nssdc-pluto'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2457588.5, 'jpl-sbdb-pluto'),
    semiMajorAxisAu: s(39.58862938517124, 'jpl-sbdb-pluto'),
    eccentricity: s(0.2518378778576892, 'jpl-sbdb-pluto'),
    inclinationDeg: s(17.14771140999114, 'jpl-sbdb-pluto'),
    longitudeOfAscendingNodeDeg: s(110.2923840543057, 'jpl-sbdb-pluto'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(113.7090015158565, 'jpl-sbdb-pluto'),
      meanAnomalyDeg: s(38.68366347318184, 'jpl-sbdb-pluto'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(90981.71647718345, 'jpl-sbdb-pluto'),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SBDB_PLUTO, NSSDC_PLUTO],
};
