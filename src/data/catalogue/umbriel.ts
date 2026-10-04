// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS } from './sources';

export const umbriel: Moon = {
  id: 'umbriel',
  kind: 'moon',
  name: 'Umbriel',
  parentId: 'uranus',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      584.7,
      'nssdc-uranus-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      584.7,
      'nssdc-uranus-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(12.2e20, 'nssdc-uranus-moons'),
  orbit: {
    frame: { type: 'parent-equator' },
    epochJd: s(2451545.0, 'jpl-sat-elem-uranus', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(265986, 'jpl-sat-elem-uranus'),
    eccentricity: s(0.004, 'jpl-sat-elem-uranus'),
    inclinationDeg: s(0.1, 'jpl-sat-elem-uranus'),
    longitudeOfAscendingNodeDeg: s(174.8, 'jpl-sat-elem-uranus'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(183.4, 'jpl-sat-elem-uranus'),
      meanAnomalyDeg: s(253.0, 'jpl-sat-elem-uranus'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        4.144176,
        'nssdc-uranus-moons',
        'The orbital period of the NASA fact sheet.',
      ),
      apsidalPrecession: { periodYears: s(64.126, 'jpl-sat-elem-uranus'), direction: 'forward' },
      nodalPrecession: { periodYears: s(129.745, 'jpl-sat-elem-uranus'), direction: 'backward' },
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/umbriel.webp',
      kind: 'agency-model',
      role: 'surface-map',
      altKey: 'mapAltUmbriel',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
      unseen: true,
    },
  ],
  sources: [JPL_SAT_ELEM_URANUS, NSSDC_URANUS_MOONS],
};
