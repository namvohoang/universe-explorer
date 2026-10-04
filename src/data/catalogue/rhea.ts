// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives at J2000: JPL's table of mean elements does not
// reproduce Horizons for this moon. The ellipse is held fixed; its slow turning is left out.
import type { Moon } from '../types';
import { SYNCHRONOUS, s } from './helpers';
import { JPL_HORIZONS_RHEA, NSSDC_SATURN_MOONS } from './sources';

export const rhea: Moon = {
  id: 'rhea',
  kind: 'moon',
  name: 'Rhea',
  parentId: 'saturn',
  shape: {
    type: 'triaxial',
    radiiKm: s([765, 763, 762], 'nssdc-saturn-moons', 'Source gives 765 x 763 x 762.'),
    orientation: SYNCHRONOUS,
  },
  massKg: s(23.1e20, 'nssdc-saturn-moons'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2451545.0, 'jpl-horizons-rhea'),
    semiMajorAxisKm: s(
      527225,
      'jpl-horizons-rhea',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    eccentricity: s(
      0.0008,
      'jpl-horizons-rhea',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    inclinationDeg: s(
      28.2414,
      'jpl-horizons-rhea',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    longitudeOfAscendingNodeDeg: s(
      168.9842,
      'jpl-horizons-rhea',
      'Osculating value at the epoch from JPL Horizons, rounded.',
    ),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(
        165.7818,
        'jpl-horizons-rhea',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
      meanAnomalyDeg: s(
        206.9021,
        'jpl-horizons-rhea',
        'Osculating value at the epoch from JPL Horizons, rounded.',
      ),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(
        4.5175,
        'nssdc-saturn-moons',
        'The orbital period of the NASA fact sheet.',
      ),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/maps/rhea.webp',
      kind: 'false-colour',
      role: 'surface-map',
      altKey: 'mapAltRhea',
      credit: 'NASA/JPL-Caltech/Space Science Institute/Lunar and Planetary Institute',
    },
  ],
  sources: [JPL_HORIZONS_RHEA, NSSDC_SATURN_MOONS],
};
