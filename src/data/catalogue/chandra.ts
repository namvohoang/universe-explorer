// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft's path is
// changed by engine burns and by the pull of other bodies, so the size, shape and period
// drawn stay about right, but where it is along the path on another date is not to be
// trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_CHANDRA, NASA_CHANDRA_FACTS } from './sources';

export const chandra: Spacecraft = {
  id: 'chandra',
  kind: 'spacecraft',
  name: 'Chandra X-ray Observatory',
  parentId: 'earth',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0097536, 0.0097536, 0.0097536],
      'nasa-chandra-facts',
      'Half of the 64.0 feet the source gives for its width with solar arrays deployed (19.5 metres), used for all three so the model keeps its real shape. JPL Horizons prints 45.3 for the length with the unit metres; the NASA fact sheet gives that figure in feet.',
    ),
    orientation: {
      axialTiltDeg: unknown('The source used gives no tilt for this spacecraft.'),
      poleRaDeg: unknown('The source used gives no direction for this spacecraft.'),
      poleDecDeg: unknown('The source used gives no direction for this spacecraft.'),
      rotationPeriodHours: unknown(
        'The source used does not say how the spacecraft is turned, so it is drawn without turning.',
      ),
      rotation: 'prograde',
    },
  },
  massKg: s(
    4790,
    'nasa-chandra-facts',
    'Source says: Weight: 10,560 pounds. Converted to kilograms.',
  ),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-chandra'),
    semiMajorAxisKm: s(80810.68147112832, 'jpl-horizons-chandra'),
    eccentricity: s(0.766884345205448, 'jpl-horizons-chandra'),
    inclinationDeg: s(
      69.11133470622161,
      'jpl-horizons-chandra',
      "To the ecliptic, not to the planet's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(124.0706026498034, 'jpl-horizons-chandra'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(286.1414445696954, 'jpl-horizons-chandra'),
      meanAnomalyDeg: s(251.2682033203766, 'jpl-horizons-chandra'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(2.646064310604414, 'jpl-horizons-chandra'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/chandra.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltChandra',
      credit: 'NASA/Brian E. Kumanchik',
    },
  ],
  sources: [JPL_HORIZONS_CHANDRA, NASA_CHANDRA_FACTS],
};
