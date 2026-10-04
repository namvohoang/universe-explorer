// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft's path is
// changed by engine burns and by the pull of other bodies, so the size, shape and period
// drawn stay about right, but where it is along the path on another date is not to be
// trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_MRO } from './sources';

export const mro: Spacecraft = {
  id: 'mro',
  kind: 'spacecraft',
  name: 'Mars Reconnaissance Orbiter',
  parentId: 'mars',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0068, 0.0068, 0.0068],
      'jpl-horizons-mro',
      'Half of the 13.6 metres tip to tip that the source gives in its notes on the spacecraft, used for all three so the model keeps its real shape.',
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
  massKg: unknown('The source gives only the launch weight, with fuel.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-mro'),
    semiMajorAxisKm: s(3651.127763376775, 'jpl-horizons-mro'),
    eccentricity: s(0.0112536647226268, 'jpl-horizons-mro'),
    inclinationDeg: s(
      72.73183559275013,
      'jpl-horizons-mro',
      "To the ecliptic, not to the planet's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(306.5595813830604, 'jpl-horizons-mro'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(260.0593116252396, 'jpl-horizons-mro'),
      meanAnomalyDeg: s(193.5246666643115, 'jpl-horizons-mro'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(0.07752483916388643, 'jpl-horizons-mro'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/mro.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltMro',
      credit: 'NASA/JPL-Caltech',
    },
  ],
  sources: [JPL_HORIZONS_MRO],
};
