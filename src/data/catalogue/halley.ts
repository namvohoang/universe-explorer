// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for 1968, around the comet's 1986 visit. Against JPL
// Horizons it holds within about 3 degrees from 1950 to 2050. It does not fit earlier visits:
// the planets change the comet's path a little on every trip, and one ellipse cannot follow that.
import type { Comet } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_HALLEY, NASA_HALLEY } from './sources';

export const halley: Comet = {
  id: 'halley',
  kind: 'comet',
  name: '1P/Halley',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [7.45, 4.1, 4.1],
      'jpl-sbdb-halley',
      'Half of the two diameters the source gives for the nucleus (14.9x8.2 km); the shorter is used for both short axes.',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(
        52.8,
        'nasa-halley',
        'Source says: Length of Day 2.2 Earth Days. In hours (× 24).',
      ),
      rotation: 'prograde',
    },
  },
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2439875.5, 'jpl-sbdb-halley'),
    semiMajorAxisAu: s(17.92863504856923, 'jpl-sbdb-halley'),
    eccentricity: s(0.9679359956953211, 'jpl-sbdb-halley'),
    inclinationDeg: s(162.1905300439129, 'jpl-sbdb-halley'),
    longitudeOfAscendingNodeDeg: s(59.09894720612437, 'jpl-sbdb-halley'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(112.2414314637764, 'jpl-sbdb-halley'),
      meanAnomalyDeg: s(274.3823371366792, 'jpl-sbdb-halley'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(27728.04608790421, 'jpl-sbdb-halley'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/deep/halley.webp',
      kind: 'photo',
      role: 'picture',
      altKey: 'pictureAltHalley',
      credit: 'Halley Multicolor Camera Team, Giotto Project, ESA',
    },
  ],
  sources: [JPL_SBDB_HALLEY, NASA_HALLEY],
};
