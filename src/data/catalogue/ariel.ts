// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS } from './sources';

export const ariel: Moon = {
  id: 'ariel',
  kind: 'moon',
  name: 'Ariel',
  parentId: 'uranus',
  shape: {
    type: 'triaxial',
    radiiKm: s([581.1, 577.9, 577.7], 'nssdc-uranus-moons', 'Source gives 581.1 x 577.9 x 577.7.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(12.9e20, 'nssdc-uranus-moons'),
  orbit: {
    frame: { type: 'parent-equator' },
    epochJd: s(2451545.0, 'jpl-sat-elem-uranus', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(190929, 'jpl-sat-elem-uranus'),
    eccentricity: s(0.001, 'jpl-sat-elem-uranus'),
    inclinationDeg: s(0.0, 'jpl-sat-elem-uranus'),
    longitudeOfAscendingNodeDeg: s(0.0, 'jpl-sat-elem-uranus'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(9.6, 'jpl-sat-elem-uranus'),
      meanAnomalyDeg: s(193.5, 'jpl-sat-elem-uranus'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        2.520379,
        'nssdc-uranus-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(28.901, 'jpl-sat-elem-uranus'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS],
};
