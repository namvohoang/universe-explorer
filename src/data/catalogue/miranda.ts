// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS } from './sources';

export const miranda: Moon = {
  id: 'miranda',
  kind: 'moon',
  name: 'Miranda',
  parentId: 'uranus',
  shape: {
    type: 'triaxial',
    radiiKm: s([240, 234.2, 232.9], 'nssdc-uranus-moons', 'Source gives 240 x 234.2 x 232.9.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(0.66e20, 'nssdc-uranus-moons'),
  orbit: {
    frame: { type: 'parent-equator' },
    epochJd: s(2451545.0, 'jpl-sat-elem-uranus', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(129846, 'jpl-sat-elem-uranus'),
    eccentricity: s(0.001, 'jpl-sat-elem-uranus'),
    inclinationDeg: s(4.4, 'jpl-sat-elem-uranus'),
    longitudeOfAscendingNodeDeg: s(100.9, 'jpl-sat-elem-uranus'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(154.8, 'jpl-sat-elem-uranus'),
      meanAnomalyDeg: s(73.0, 'jpl-sat-elem-uranus'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1.413479,
        'nssdc-uranus-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(8.939, 'jpl-sat-elem-uranus'), direction: 'forward' },
      nodalPrecession: { periodYears: s(17.787, 'jpl-sat-elem-uranus'), direction: 'backward' },
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/miranda.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltMiranda',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
      unseen: true,
    },
  ],
  sources: [JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS],
};
