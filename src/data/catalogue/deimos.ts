// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_DEIMOS_PERIOD, JPL_SAT_ELEM_MARS, NSSDC_MARS } from './sources';

/** A small, lumpy moon: three different radii, not a ball. */
export const deimos: Moon = {
  id: 'deimos',
  kind: 'moon',
  name: 'Deimos',
  parentId: 'mars',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [7.8, 6.0, 5.1],
      'nssdc-mars',
      'The subplanetary, along-orbit and polar axis radii of the source.',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: unknown(
        'Synchronous: the source gives a rotation period equal to the orbital period.',
      ),
      rotation: 'synchronous',
    },
  },
  massKg: s(2.4e15, 'nssdc-mars'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(316.6, 'jpl-sat-elem-mars'),
      poleDecDeg: s(53.5, 'jpl-sat-elem-mars'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-mars', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(23457, 'jpl-sat-elem-mars'),
    eccentricity: s(0.0, 'jpl-sat-elem-mars'),
    inclinationDeg: s(1.8, 'jpl-sat-elem-mars'),
    longitudeOfAscendingNodeDeg: s(54.3, 'jpl-sat-elem-mars'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(0.0, 'jpl-sat-elem-mars'),
      meanAnomalyDeg: s(205.0, 'jpl-sat-elem-mars'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1.26244083,
        'jpl-horizons-deimos-period',
        'Not printed on a page: the mean period over 50 years, worked out from where JPL Horizons puts the moon at J2000 and 18,262 days later. NASA and JPL print it only to 1.26244 days, which would let the moon drift by degrees each year.',
      ),
      nodalPrecession: { periodYears: s(56.2, 'jpl-sat-elem-mars'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_DEIMOS_PERIOD, JPL_SAT_ELEM_MARS, NSSDC_MARS],
};
