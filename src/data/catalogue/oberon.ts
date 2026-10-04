// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS } from './sources';

export const oberon: Moon = {
  id: 'oberon',
  kind: 'moon',
  name: 'Oberon',
  parentId: 'uranus',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      761.4,
      'nssdc-uranus-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      761.4,
      'nssdc-uranus-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(28.8e20, 'nssdc-uranus-moons'),
  orbit: {
    frame: { type: 'parent-equator' },
    epochJd: s(2451545.0, 'jpl-sat-elem-uranus', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(583511, 'jpl-sat-elem-uranus'),
    eccentricity: s(0.002, 'jpl-sat-elem-uranus'),
    inclinationDeg: s(0.1, 'jpl-sat-elem-uranus'),
    longitudeOfAscendingNodeDeg: s(76.8, 'jpl-sat-elem-uranus'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(132.2, 'jpl-sat-elem-uranus'),
      meanAnomalyDeg: s(143.6, 'jpl-sat-elem-uranus'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        13.463234,
        'nssdc-uranus-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(158.604, 'jpl-sat-elem-uranus'), direction: 'forward' },
      nodalPrecession: { periodYears: s(192.798, 'jpl-sat-elem-uranus'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS],
};
