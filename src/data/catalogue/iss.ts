// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft this low is
// pushed about by thin air and by Earth's bulge, and is boosted now and then, so its real
// path swings round Earth within weeks: the size, shape and period drawn stay about right,
// but where it is along the path on another date is not to be trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_ISS, NASA_ISS_FACTS } from './sources';

export const iss: Spacecraft = {
  id: 'iss',
  kind: 'spacecraft',
  name: 'International Space Station',
  parentId: 'earth',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0545, 0.0545, 0.0545],
      'nasa-iss-facts',
      'Half of the 109 metres the source gives end to end, used for all three so the model keeps its real shape.',
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
  massKg: unknown('The source used gives no mass for the station.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-iss'),
    semiMajorAxisKm: s(6793.27334082041, 'jpl-horizons-iss'),
    eccentricity: s(0.001214552018508841, 'jpl-horizons-iss'),
    inclinationDeg: s(
      66.02186808262034,
      'jpl-horizons-iss',
      "To the ecliptic, not to Earth's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(132.6747063872358, 'jpl-horizons-iss'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(101.7288246840973, 'jpl-horizons-iss'),
      meanAnomalyDeg: s(153.2230312441346, 'jpl-horizons-iss'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(0.06449348954357985, 'jpl-horizons-iss'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/iss.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltIss',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_HORIZONS_ISS, NASA_ISS_FACTS],
};
