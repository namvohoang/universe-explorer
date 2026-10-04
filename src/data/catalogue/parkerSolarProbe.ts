// Values are copied from the pages in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
// The orbit is the one JPL Horizons gives for a single instant. A spacecraft's path is
// changed by engine burns and by the pull of other bodies, so the size, shape and period
// drawn stay about right, but where it is along the path on another date is not to be
// trusted. The card says so.
import type { Spacecraft } from '../types';
import { s, unknown } from './helpers';
import { APL_PARKER, JPL_HORIZONS_PARKER } from './sources';

export const parkerSolarProbe: Spacecraft = {
  id: 'parker-solar-probe',
  kind: 'spacecraft',
  name: 'Parker Solar Probe',
  parentId: 'sun',
  shape: {
    type: 'triaxial',
    radiiKm: s(
      [0.0015, 0.0015, 0.0015],
      'apl-parker',
      'Half of the 3 metres the source gives for its height, used for all three so the model keeps its real shape.',
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
  massKg: unknown('The source gives only the mass at launch, with fuel.'),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: s(2461317.5, 'jpl-horizons-parker'),
    semiMajorAxisKm: s(58108945.00304206, 'jpl-horizons-parker'),
    eccentricity: s(0.8820254599238022, 'jpl-horizons-parker'),
    inclinationDeg: s(3.391116675629851, 'jpl-horizons-parker'),
    longitudeOfAscendingNodeDeg: s(76.48216724634202, 'jpl-horizons-parker'),
    phase: {
      form: 'anomalies',
      argumentOfPeriapsisDeg: s(68.64025819815969, 'jpl-horizons-parker'),
      meanAnomalyDeg: s(119.6697010308583, 'jpl-horizons-parker'),
    },
    motion: {
      type: 'precessing-ellipse',
      siderealPeriodDays: s(88.42494427932712, 'jpl-horizons-parker'),
    },
    validity: null,
  },
  media: [
    {
      file: 'public/media/models/parker-solar-probe.glb',
      kind: 'artist-concept',
      role: 'model',
      altKey: 'modelAltParkerSolarProbe',
      credit: 'NASA Visualization Technology Applications and Development (VTAD)',
    },
  ],
  sources: [APL_PARKER, JPL_HORIZONS_PARKER],
};
