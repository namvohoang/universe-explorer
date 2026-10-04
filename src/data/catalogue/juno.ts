// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft's path is
// changed by engine burns and by the pull of other bodies, so the size, shape and period
// drawn stay about right, but where it is along the path on another date is not to be
// trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { JPL_HORIZONS_JUNO, NASA_JUNO } from './sources';

export const juno: Spacecraft = {
  id: 'juno',
  kind: 'spacecraft',
  name: 'Juno',
  parentId: 'jupiter',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.01, 0.01, 0.01],
      'nasa-juno',
      'Half of the 20 metres the source gives for its overall width, used for all three so the model keeps its real shape.',
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
    epochJd: s(2461317.5, 'jpl-horizons-juno'),
    semiMajorAxisKm: s(2948141.870747066, 'jpl-horizons-juno'),
    eccentricity: s(0.9729534100125479, 'jpl-horizons-juno'),
    inclinationDeg: s(
      100.2579032463955,
      'jpl-horizons-juno',
      "To the ecliptic, not to the planet's equator.",
    ),
    longitudeOfAscendingNodeDeg: s(293.031194881249, 'jpl-horizons-juno'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(104.0310902077447, 'jpl-horizons-juno'),
      meanAnomalyDeg: s(272.3568846099517, 'jpl-horizons-juno'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(32.70570163626571, 'jpl-horizons-juno'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/juno.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltJuno',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [JPL_HORIZONS_JUNO, NASA_JUNO],
};
