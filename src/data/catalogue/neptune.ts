// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_NEPTUNE } from './sources';

export const neptune: Planet = {
  id: 'neptune',
  kind: 'planet',
  name: 'Neptune',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(24764, 'nssdc-neptune', 'At the 1 bar pressure level.'),
    polarRadiusKm: s(24341, 'nssdc-neptune', 'At the 1 bar pressure level.'),
    orientation: {
      axialTiltDeg: s(28.32, 'nssdc-neptune'),
      poleRaDeg: s(
        299.334,
        'nssdc-neptune',
        'Source gives 299.36 + 0.70 sin N, with N = 357.85 + 52.316T degrees and T in Julian centuries from J2000. This is that expression evaluated at T = 0, rounded to 0.001 degrees.',
      ),
      poleDecDeg: s(
        42.95,
        'nssdc-neptune',
        'Source gives 43.46 - 0.51 cos N, with N = 357.85 + 52.316T degrees and T in Julian centuries from J2000. This is that expression evaluated at T = 0, rounded to 0.001 degrees.',
      ),
      rotationPeriodHours: s(
        16.11,
        'nssdc-neptune',
        'Marked with an asterisk in the source: see its footnote on how the rotation period is defined.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: s(102.409e24, 'nssdc-neptune'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(30.06992276, 'jpl-approx-pos'),
    eccentricity: s(0.00859048, 'jpl-approx-pos'),
    inclinationDeg: s(1.77004347, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(131.78422574, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(44.96476227, 'jpl-approx-pos'),
      meanLongitudeDeg: s(-55.12002969, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(0.00026291, 'jpl-approx-pos'),
      eccentricityPerCentury: s(0.00005105, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(0.00035372, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(218.45945325, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(-0.32241464, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(-0.00508664, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [
    {
      file: 'public/media/maps/neptune.webp',
      kind: 'artist-concept',
      role: 'surface-map',
      altKey: 'mapAltNeptune',
      credit: 'Don Davis & JPL/Caltech',
    },
  ],
  sources: [JPL_APPROX_POS, NSSDC_NEPTUNE],
};
