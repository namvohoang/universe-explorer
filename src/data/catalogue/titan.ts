// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_TITAN, NSSDC_SATURN_MOONS } from './sources';

export const titan: Moon = {
  id: 'titan',
  kind: 'moon',
  name: 'Titan',
  parentId: 'saturn',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      2575,
      'nssdc-saturn-moons',
      'Source gives one radius; the same is used for both.',
    ),
    polarRadiusKm: s(
      2575,
      'nssdc-saturn-moons',
      'Source gives one radius; the same is used for both.',
    ),
    orientation: SYNCHRONOUS,
  },
  massKg: s(1345.5e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-titan'),
    semiMajorAxisKm: s(
      1221935,
      'jpl-horizons-titan',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.028601,
      'jpl-horizons-titan',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      27.7183,
      'jpl-horizons-titan',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      169.2392,
      'jpl-horizons-titan',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        164.4091,
        'jpl-horizons-titan',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        163.4362,
        'jpl-horizons-titan',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        15.945421,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/titan.webp',
      kind: 'composite',
      role: 'surface-map',
      altKey: 'mapAltTitan',
      credit: 'NASA/JPL-Caltech/Space Science Institute',
      unseen: true,
      infrared: true,
    },
  ],
  sources: [JPL_HORIZONS_TITAN, NSSDC_SATURN_MOONS],
};
