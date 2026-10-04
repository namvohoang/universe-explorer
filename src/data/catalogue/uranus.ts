// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_URANUS } from './sources';

export const uranus: Planet = {
  id: 'uranus',
  kind: 'planet',
  name: 'Uranus',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(25559, 'nssdc-uranus', 'At the 1 bar pressure level.'),
    polarRadiusKm: s(24973, 'nssdc-uranus', 'At the 1 bar pressure level.'),
    orientation: {
      axialTiltDeg: s(97.77, 'nssdc-uranus'),
      poleRaDeg: s(257.311, 'nssdc-uranus'),
      poleDecDeg: s(-15.175, 'nssdc-uranus'),
      rotationPeriodHours: s(
        17.24,
        'nssdc-uranus',
        'Source gives a negative period to mark retrograde rotation. Marked with an asterisk in the source: see its footnote on how the rotation period is defined.',
      ),
      rotation: 'retrograde',
    },
  },
  massKg: s(86.811e24, 'nssdc-uranus'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(19.18916464, 'jpl-approx-pos'),
    eccentricity: s(0.04725744, 'jpl-approx-pos'),
    inclinationDeg: s(0.77263783, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(74.01692503, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(170.9542763, 'jpl-approx-pos'),
      meanLongitudeDeg: s(313.23810451, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(-0.00196176, 'jpl-approx-pos'),
      eccentricityPerCentury: s(-0.00004397, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(-0.00242939, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(428.48202785, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(0.40805281, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(0.04240589, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [],
  sources: [JPL_APPROX_POS, NSSDC_URANUS],
};
