// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_MERCURY } from './sources';

export const mercury: Planet = {
  id: 'mercury',
  kind: 'planet',
  name: 'Mercury',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(2440.5, 'nssdc-mercury'),
    polarRadiusKm: s(2438.3, 'nssdc-mercury'),
    orientation: {
      axialTiltDeg: s(0.034, 'nssdc-mercury'),
      poleRaDeg: s(
        281.01,
        'nssdc-mercury',
        'Source gives 281.010 - 0.033T; only the constant term is stored.',
      ),
      poleDecDeg: s(
        61.414,
        'nssdc-mercury',
        'Source gives 61.414 - 0.005T; only the constant term is stored.',
      ),
      rotationPeriodHours: s(1407.6, 'nssdc-mercury'),
      rotation: 'prograde',
    },
  },
  massKg: s(0.3301e24, 'nssdc-mercury'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(0.38709927, 'jpl-approx-pos'),
    eccentricity: s(0.20563593, 'jpl-approx-pos'),
    inclinationDeg: s(7.00497902, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(48.33076593, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(77.45779628, 'jpl-approx-pos'),
      meanLongitudeDeg: s(252.2503235, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(0.00000037, 'jpl-approx-pos'),
      eccentricityPerCentury: s(0.00001906, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(-0.00594749, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(149472.67411175, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(0.16047689, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(-0.12534081, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [],
  sources: [JPL_APPROX_POS, NSSDC_MERCURY],
};
