// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// Precession directions are not on the page; see `Precession` in the types.
import type { Moon } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_PHOBOS_PERIOD, JPL_SAT_ELEM_MARS, NSSDC_MARS } from './sources';

/** A small, lumpy moon: three different radii, not a ball. */
export const phobos: Moon = {
  id: 'phobos',
  kind: 'moon',
  name: 'Phobos',
  parentId: 'mars',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [13.0, 11.4, 9.1],
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
  massKg: s(10.6e15, 'nssdc-mars'),
  orbit: {
    frame: {
      type: 'laplace-plane',
      poleRaDeg: s(317.7, 'jpl-sat-elem-mars'),
      poleDecDeg: s(52.9, 'jpl-sat-elem-mars'),
    },
    epochJd: s(2451545.0, 'jpl-sat-elem-mars', 'Source gives the epoch as 2000-01-01.5 TDB.'),
    semiMajorAxisKm: s(9375, 'jpl-sat-elem-mars'),
    eccentricity: s(0.015, 'jpl-sat-elem-mars'),
    inclinationDeg: s(1.1, 'jpl-sat-elem-mars'),
    longitudeOfAscendingNodeDeg: s(169.2, 'jpl-sat-elem-mars'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(216.3, 'jpl-sat-elem-mars'),
      meanAnomalyDeg: s(189.7, 'jpl-sat-elem-mars'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        0.31891003,
        'jpl-horizons-phobos-period',
        'Not printed on a page: the mean period over 50 years, worked out from where JPL Horizons puts the moon at J2000 and 18,262 days later. NASA and JPL print it only to 0.31891 days, which would let the moon drift by degrees each year.',
      ),
      apsidalPrecession: { periodYears: s(1.1, 'jpl-sat-elem-mars'), direction: 'backward' },
      nodalPrecession: { periodYears: s(2.3, 'jpl-sat-elem-mars'), direction: 'backward' },
    },
    validity: null,
  },
  media: [],
  sources: [JPL_HORIZONS_PHOBOS_PERIOD, JPL_SAT_ELEM_MARS, NSSDC_MARS],
};
