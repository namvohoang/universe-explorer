// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft this low is
// pushed about by thin air and by Earth's bulge, and is boosted now and then, so its real
// path swings round Earth within weeks: the size, shape and period drawn stay about right,
// but where it is along the path on another date is not to be trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_HUBBLE, NASA_HUBBLE_NUMBERS } from './sources';

export const hubble: Spacecraft = {
  id: 'hubble',
  kind: 'spacecraft',
  name: 'Hubble Space Telescope',
  parentId: 'earth',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0065, 0.0065, 0.0065],
      'nasa-hubble-numbers',
      'Half of the 13 metres the source gives for its length, used for all three so the model keeps its real shape.',
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
  massKg: s(12200, 'nasa-hubble-numbers'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-hubble'),
    semiMajorAxisKm: s(6850.805826311082, 'jpl-horizons-hubble'),
    eccentricity: s(0.001083176944299657, 'jpl-horizons-hubble'),
    inclinationDeg: s(
      24.22515896370254,
      'jpl-horizons-hubble',
      "To the ecliptic, not to Earth's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(104.7127472825156, 'jpl-horizons-hubble'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(40.05845589624359, 'jpl-horizons-hubble'),
      meanAnomalyDeg: s(9.495271895589516, 'jpl-horizons-hubble'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(0.06531451842168862, 'jpl-horizons-hubble'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/hubble.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltHubble',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_HORIZONS_HUBBLE, NASA_HUBBLE_NUMBERS],
};
