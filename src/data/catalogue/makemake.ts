// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one the database gives for its epoch; it is a single ellipse, so it slowly
// drifts from the real path the further the date is from that epoch.
import type { DwarfPlanet } from '../types';
import { s, unknown } from './helpers';
import { JPL_SBDB_MAKEMAKE, NASA_DWARF_MAKEMAKE } from './sources';

export const makemake: DwarfPlanet = {
  id: 'makemake',
  kind: 'dwarf-planet',
  name: 'Makemake',
  parentId: 'sun',
  shape: {
    type: 'spheroid',
    equatorialRadiusKm: s(
      715,
      'nasa-dwarf-makemake',
      'Source says: With a radius of approximately 444 miles (715 kilometers). One radius is given; the same is used for both.',
    ),
    polarRadiusKm: s(
      715,
      'nasa-dwarf-makemake',
      'Source says: With a radius of approximately 444 miles (715 kilometers). One radius is given; the same is used for both.',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this body.'),
      poleRaDeg: unknown('The source used gives no pole direction for this body.'),
      poleDecDeg: unknown('The source used gives no pole direction for this body.'),
      rotationPeriodHours: s(
        22.8266,
        'jpl-sbdb-makemake',
        'The source gives no spin direction or pole; it is drawn turning the same way it goes around the Sun.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: unknown('The sources used give no mass for this body.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461200.5, 'jpl-sbdb-makemake'),
    semiMajorAxisAu: s(45.57093317300052, 'jpl-sbdb-makemake'),
    eccentricity: s(0.1588889953992523, 'jpl-sbdb-makemake'),
    inclinationDeg: s(29.02785603743067, 'jpl-sbdb-makemake'),
    longitudeOfAscendingNodeDeg: s(79.2948338209406, 'jpl-sbdb-makemake'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(297.0922733397207, 'jpl-sbdb-makemake'),
      meanAnomalyDeg: s(169.9379962048232, 'jpl-sbdb-makemake'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(112364.8068762869, 'jpl-sbdb-makemake'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/makemake.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltMakemake',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_SBDB_MAKEMAKE, NASA_DWARF_MAKEMAKE],
};
