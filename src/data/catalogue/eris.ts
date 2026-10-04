// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { DwarfPlanet } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_ERIS, NASA_DWARF_ERIS } from './sources';

export const eris: DwarfPlanet = {
  id: 'eris',
  kind: 'dwarf-planet',
  name: 'Eris',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      1200,
      'nasa-dwarf-eris',
      'Half the diameter in the source: With an equatorial diameter of about 1,500 miles (2,400 kilometers). The same is used for both radii.',
    ),
    polarRadiusKm: s(
      1200,
      'nasa-dwarf-eris',
      'Half the diameter in the source: With an equatorial diameter of about 1,500 miles (2,400 kilometers). The same is used for both radii.',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(
        25.9,
        'jpl-sbdb-eris',
        'The source gives no spin direction or pole; it is drawn turning the same way it goes around the Sun.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The sources used give no mass for this body.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-eris'),
    semiMajorAxisAu: s(67.93394687853566, 'jpl-sbdb-eris'),
    eccentricity: s(0.4382385347971672, 'jpl-sbdb-eris'),
    inclinationDeg: s(43.9258279471791, 'jpl-sbdb-eris'),
    longitudeOfAscendingNodeDeg: s(36.00477044417249, 'jpl-sbdb-eris'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(150.7949235840312, 'jpl-sbdb-eris'),
      meanAnomalyDeg: s(211.774434275007, 'jpl-sbdb-eris'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(204516.6629430732, 'jpl-sbdb-eris'),
    },
    validity: null,
  },
  media: [],
  sources: [JPL_SBDB_ERIS, NASA_DWARF_ERIS],
};
