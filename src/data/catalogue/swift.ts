// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft's path is
// changed by engine burns and by the pull of other bodies, so the size, shape and period
// drawn stay about right, but where it is along the path on another date is not to be
// trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_SWIFT } from './sources';

export const swift: Spacecraft = {
  id: 'swift',
  kind: 'spacecraft',
  name: 'Neil Gehrels Swift Observatory',
  parentId: 'earth',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0028194, 0.0028194, 0.0028194],
      'jpl-horizons-swift',
      'Half of the 18.5 feet the source gives as its longer side in its notes on the spacecraft (5.64 metres), used for all three so the model keeps its real shape.',
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
  massKg: unknown('The source used gives no mass for the spacecraft.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-swift'),
    semiMajorAxisKm: s(6692.314036573023, 'jpl-horizons-swift'),
    eccentricity: s(0.00188347961059576, 'jpl-horizons-swift'),
    inclinationDeg: s(
      20.69757283428065,
      'jpl-horizons-swift',
      "To the ecliptic, not to the planet's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(123.4062779397754, 'jpl-horizons-swift'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(22.33619763351795, 'jpl-horizons-swift'),
      meanAnomalyDeg: s(13.06775041694834, 'jpl-horizons-swift'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(0.06306112431048932, 'jpl-horizons-swift'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/swift.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltSwift',
      credit: 'NASA/Christopher R. Meaney',
    },
  ],
  sources: [JPL_HORIZONS_SWIFT],
};
