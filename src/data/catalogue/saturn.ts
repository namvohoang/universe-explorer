// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_SATURN } from './sources';

export const saturn: Planet = {
  id: 'saturn',
  kind: 'planet',
  name: 'Saturn',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(60268, 'nssdc-saturn', 'At the 1 bar pressure level.'),
    polarRadiusKm: s(54364, 'nssdc-saturn', 'At the 1 bar pressure level.'),
    orientation: {
      axialTiltDeg: s(26.73, 'nssdc-saturn'),
      poleRaDeg: s(
        40.589,
        'nssdc-saturn',
        'Source gives 40.589 - 0.036T; only the constant term is stored.',
      ),
      poleDecDeg: s(
        83.537,
        'nssdc-saturn',
        'Source gives 83.537 - 0.004T; only the constant term is stored.',
      ),
      rotationPeriodHours: s(
        10.656,
        'nssdc-saturn',
        'Marked with an asterisk in the source: see its footnote on how the rotation period is defined.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: s(568.32e24, 'nssdc-saturn'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(9.53667594, 'jpl-approx-pos'),
    eccentricity: s(0.05386179, 'jpl-approx-pos'),
    inclinationDeg: s(2.48599187, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(113.66242448, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(92.59887831, 'jpl-approx-pos'),
      meanLongitudeDeg: s(49.95424423, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(-0.0012506, 'jpl-approx-pos'),
      eccentricityPerCentury: s(-0.00050991, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(0.00193609, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(1222.49362201, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(-0.41897216, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(-0.28867794, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [
    {
      file: 'public/media/maps/saturn.webp',
      kind: 'artist-concept',
      role: 'surface-map',
      altKey: 'mapAltSaturn',
      credit:
        'NASA/JPL-Caltech. The page gives no credit line; it says "From the database of JPL/Caltech generated planetary maps".',
    },
  ],
  sources: [JPL_APPROX_POS, NSSDC_SATURN],
};
