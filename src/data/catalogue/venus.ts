// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_VENUS } from './sources';

export const venus: Planet = {
  id: 'venus',
  kind: 'planet',
  name: 'Venus',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(6051.8, 'nssdc-venus'),
    polarRadiusKm: s(6051.8, 'nssdc-venus'),
    orientation: {
      axialTiltDeg: s(177.36, 'nssdc-venus'),
      poleRaDeg: s(272.76, 'nssdc-venus'),
      poleDecDeg: s(67.16, 'nssdc-venus'),
      rotationPeriodHours: s(
        5832.6,
        'nssdc-venus',
        'Source gives a negative period to mark retrograde rotation.',
      ),
      rotation: 'retrograde',
    },
  },
  massKg: s(4.8673e24, 'nssdc-venus'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(0.72333566, 'jpl-approx-pos'),
    eccentricity: s(0.00677672, 'jpl-approx-pos'),
    inclinationDeg: s(3.39467605, 'jpl-approx-pos'),
    longitudeOfAscendingNodeDeg: s(76.67984255, 'jpl-approx-pos'),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(131.60246718, 'jpl-approx-pos'),
      meanLongitudeDeg: s(181.9790995, 'jpl-approx-pos'),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(0.0000039, 'jpl-approx-pos'),
      eccentricityPerCentury: s(-0.00004107, 'jpl-approx-pos'),
      inclinationDegPerCentury: s(-0.0007889, 'jpl-approx-pos'),
      meanLongitudeDegPerCentury: s(58517.81538729, 'jpl-approx-pos'),
      longitudeOfPerihelionDegPerCentury: s(0.00268329, 'jpl-approx-pos'),
      longitudeOfAscendingNodeDegPerCentury: s(-0.27769418, 'jpl-approx-pos'),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [
    {
      file: 'public/media/maps/venus.webp',
      kind: 'false-colour',
      role: 'surface-map',
      altKey: 'mapAltVenus',
    },
  ],
  sources: [JPL_APPROX_POS, NSSDC_VENUS],
};
