// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_MARS } from './sources';

export const mars: Planet = {
  id: 'mars',
  kind: 'planet',
  name: 'Mars',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(3396.2, 'nssdc-mars'),
    polarRadiusKm: s(3376.2, 'nssdc-mars'),
    orientation: {
      axialTiltDeg: s(25.19, 'nssdc-mars'),
      poleRaDeg: s(
        317.681,
        'nssdc-mars',
        'Source gives 317.681 - 0.106T; only the constant term is stored.',
      ),
      poleDecDeg: s(
        52.887,
        'nssdc-mars',
        'Source gives 52.887 - 0.061T; only the constant term is stored.',
      ),
      rotationPeriodHours: s(24.6229, 'nssdc-mars'),
      rotation: 'prograde',
    },
  },
  massKg: s(0.64169e24, 'nssdc-mars'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(1.52371034, 'jpl-approx-pos'),
    eccentricity: s(0.0933941, 'jpl-approx-pos'),
    inclinationDeg: s(1.84969142, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(49.55953891, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(-23.94362959, 'jpl-approx-pos'),
      meanLongitudeDeg: s(-4.55343205, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(0.00001847, 'jpl-approx-pos'),
      eccentricityPerCentury: s(0.00007882, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(-0.00813131, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(19140.30268499, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(0.44441088, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(-0.29257343, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [
    {
      file: 'public/media/maps/mars.webp',
      kind: 'composite',
      role: 'surface-map',
      altKey: 'mapAltMars',
      credit: 'NASA/Jet Propulsion Laboratory & Caltech',
    },
  ],
  sources: [JPL_APPROX_POS, NSSDC_MARS],
};
