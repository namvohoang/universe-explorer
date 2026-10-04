// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_ENCELADUS, NSSDC_SATURN_MOONS } from './sources';

export const enceladus: Moon = {
  id: 'enceladus',
  kind: 'moon',
  name: 'Enceladus',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([257, 251, 248], 'nssdc-saturn-moons', 'Source gives 257 x 251 x 248.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(1.08e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-enceladus'),
    semiMajorAxisKm: s(
      238420,
      'jpl-horizons-enceladus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.006352,
      'jpl-horizons-enceladus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      28.052,
      'jpl-horizons-enceladus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      169.5066,
      'jpl-horizons-enceladus',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        135.483,
        'jpl-horizons-enceladus',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        6.9534,
        'jpl-horizons-enceladus',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        1.370218,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/enceladus.webp',
      kind: 'false-colour',
      role: 'surface-map',
      altKey: 'mapAltEnceladus',
      credit: 'NASA/JPL-Caltech/Space Science Institute/Lunar and Planetary Institute',
    },
  ],
  sources: [JPL_HORIZONS_ENCELADUS, NSSDC_SATURN_MOONS],
};
