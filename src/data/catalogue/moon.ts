// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Moon } from '../types';
import { s, unknown } from './helpers';
import { JPL_SAT_ELEM, NSSDC_MOON } from './sources';

export const moon: Moon = {
  id: 'moon',
  kind: 'moon',
  name: 'Moon',
  parentId: 'earth',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(1738.1, 'nssdc-moon'),
    polarRadiusKm: s(1736.0, 'nssdc-moon'),
    orientation: {
      axialTiltDeg: s(6.68, 'nssdc-moon'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(655.72, 'nssdc-moon'),
      rotation: 'prograde',
    },
  },
  massKg: s(0.07346e24, 'nssdc-moon'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-sat-elem', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(384400, 'jpl-sat-elem'),
    eccentricity: s(0.0554, 'jpl-sat-elem'),
    inclinationDeg: s(5.16, 'jpl-sat-elem'),
    longitudeOfAscendingNodeDeg: s(125.08, 'jpl-sat-elem'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(318.15, 'jpl-sat-elem'),
      meanAnomalyDeg: s(135.27, 'jpl-sat-elem'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        27.3217,
        'nssdc-moon',
        'The "Revolution period" of the NASA fact sheet. JPL\'s table rounds the period to 27.322, which makes the Moon drift by several degrees over a century.',
      ),
      apsidalPrecession: { periodYears: s(5.997, 'jpl-sat-elem'), direction: 'forward' },
      nodalPrecession: { periodYears: s(18.6, 'jpl-sat-elem'), direction: 'backward' },
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/moon.webp',
      kind: 'composite',
      role: 'surface-map',
      altKey: 'mapAltMoon',
      credit: "NASA's Scientific Visualization Studio",
    },
  ],
  sources: [JPL_SAT_ELEM, NSSDC_MOON],
};
