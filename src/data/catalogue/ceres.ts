// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { DwarfPlanet } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_CERES_PERIOD, JPL_SBDB_CERES } from './sources';

export const ceres: DwarfPlanet = {
  id: 'ceres',
  kind: 'dwarf-planet',
  name: 'Ceres',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      482.2,
      'jpl-sbdb-ceres',
      'Half the longest of the three diameters the source gives (964.4 x 964.2 x 891.8 km).',
    ),
    polarRadiusKm: s(
      445.9,
      'jpl-sbdb-ceres',
      'Half the shortest of the three diameters the source gives (964.4 x 964.2 x 891.8 km).',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: s(291.421, 'jpl-sbdb-ceres'),
      poleDecDeg: s(66.758, 'jpl-sbdb-ceres'),
      rotationPeriodHours: s(9.07417, 'jpl-sbdb-ceres'),
      rotation: 'prograde',
    },
  },
  massKg: s(
    9.3835e20,
    'jpl-sbdb-ceres',
    'Worked out from the GM the source gives (62.6284 km^3/s^2) and the gravitational constant 6.67430e-11 m^3 kg^-1 s^-2.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-ceres'),
    semiMajorAxisAu: s(2.765552595034094, 'jpl-sbdb-ceres'),
    eccentricity: s(0.07969229514816586, 'jpl-sbdb-ceres'),
    inclinationDeg: s(10.58802780183462, 'jpl-sbdb-ceres'),
    longitudeOfAscendingNodeDeg: s(80.24862682043221, 'jpl-sbdb-ceres'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(73.29421453021587, 'jpl-sbdb-ceres'),
      meanAnomalyDeg: s(274.4193463761342, 'jpl-sbdb-ceres'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1681.557,
        'jpl-horizons-ceres-period',
        "Not printed on a page: the period that keeps this ellipse closest to JPL Horizons from 1810 to 2049 (within 0.6 degrees). The database's own period for its epoch, 1679.853 days, drifts 17 degrees by 1810.",
      ),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_CERES_PERIOD, JPL_SBDB_CERES],
};
