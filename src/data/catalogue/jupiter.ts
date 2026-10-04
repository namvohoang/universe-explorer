// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_JUPITER } from './sources';

export const jupiter: Planet = {
  id: 'jupiter',
  kind: 'planet',
  name: 'Jupiter',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(71492, 'nssdc-jupiter', 'At the 1 bar pressure level.'),
    polarRadiusKm: s(66854, 'nssdc-jupiter'),
    orientation: {
      axialTiltDeg: s(3.13, 'nssdc-jupiter'),
      poleRaDeg: s(
        268.057,
        'nssdc-jupiter',
        'Source gives 268.057 - 0.006T; only the constant term is stored.',
      ),
      poleDecDeg: s(
        64.495,
        'nssdc-jupiter',
        'Source gives 64.495 + 0.002T; only the constant term is stored.',
      ),
      rotationPeriodHours: s(
        9.925,
        'nssdc-jupiter',
        'Marked with an asterisk in the source: see its footnote on how the rotation period is defined.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: s(1898.13e24, 'nssdc-jupiter'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(5.202887, 'jpl-approx-pos'),
    eccentricity: s(0.04838624, 'jpl-approx-pos'),
    inclinationDeg: s(1.30439695, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(100.47390909, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(14.72847983, 'jpl-approx-pos'),
      meanLongitudeDeg: s(34.39644051, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(-0.00011607, 'jpl-approx-pos'),
      eccentricityPerCentury: s(-0.00013253, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(-0.00183714, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(3034.74612775, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(0.21252668, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(0.20469106, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [],
  sources: [JPL_APPROX_POS, NSSDC_JUPITER],
};
