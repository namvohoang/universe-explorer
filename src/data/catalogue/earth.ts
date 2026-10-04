// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Planet } from '../types';
import { s } from './helpers';
import { JPL_APPROX_POS, NSSDC_EARTH } from './sources';

export const earth: Planet = {
  id: 'earth',
  kind: 'planet',
  name: 'Earth',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(6378.137, 'nssdc-earth'),
    polarRadiusKm: s(6356.752, 'nssdc-earth'),
    orientation: {
      axialTiltDeg: s(23.44, 'nssdc-earth'),
      poleRaDeg: s(
        0.0,
        'nssdc-earth',
        'Source gives 0.00 - 0.641T; only the constant term is stored.',
      ),
      poleDecDeg: s(
        90.0,
        'nssdc-earth',
        'Source gives 90.00 - 0.557T; only the constant term is stored.',
      ),
      rotationPeriodHours: s(23.9345, 'nssdc-earth'),
      rotation: 'prograde',
    },
  },
  massKg: s(5.9722e24, 'nssdc-earth'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-approx-pos', 'J2000.0, the epoch the source counts centuries from.'),
    semiMajorAxisAu: s(
      1.00000261,
      'jpl-approx-pos',
      'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
    ),
    eccentricity: s(
      0.01671123,
      'jpl-approx-pos',
      'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
    ),
    inclinationDeg: s(
      -0.00001531,
      'jpl-approx-pos',
      'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
    ),
    longitudeOfAscendingNodeDeg: s(
      0.0,
      'jpl-approx-pos',
      'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
    ),
    phase: {
      form: 'longitudes',
      longitudeOfPerihelionDeg: s(
        102.93768193,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      meanLongitudeDeg: s(
        100.46457166,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
    },
    motion: {
      type: 'rates-per-century',
      semiMajorAxisAuPerCentury: s(
        0.00000562,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      eccentricityPerCentury: s(
        -0.00004392,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      inclinationDegPerCentury: s(
        -0.01294668,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      meanLongitudeDegPerCentury: s(
        35999.37244981,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      longitudeOfPerihelionDegPerCentury: s(
        0.32327364,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
      longitudeOfAscendingNodeDegPerCentury: s(
        0.0,
        'jpl-approx-pos',
        'These are the elements of the Earth\u2013Moon barycentre (the "EM Bary" row), which the source gives instead of Earth alone.',
      ),
    },
    validity: { fromYear: s(1800, 'jpl-approx-pos'), toYear: s(2050, 'jpl-approx-pos') },
  },
  media: [],
  sources: [JPL_APPROX_POS, NSSDC_EARTH],
};
