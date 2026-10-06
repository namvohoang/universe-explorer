// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { Galaxy } from '../types';
import { s, unknown } from './helpers';
import { NASA_HUBBLE_MARKARIAN_231 } from './sources';

export const markarian231: Galaxy = {
  id: 'markarian-231',
  kind: 'galaxy',
  name: 'Markarian 231',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    // The source gives no type. It calls this an "interacting galaxy" and the picture shows a
    // lopsided one with long tails, so it is drawn as a deep cloud and not as a flat disc.
    structure: 'irregular',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      581e6,
      'nasa-hubble-markarian-231',
      'Source says: the nearest quasar to Earth. Located 581 million light-years away',
    ),
  },
  media: [
    {
      file: 'public/media/deep/markarian-231.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltMarkarian231',
      credit:
        'NASA, ESA, the Hubble Heritage Team (STScI/AURA)-ESA/Hubble Collaboration, and A. Evans (University of Virginia, Charlottesville/NRAO/Stony Brook University)',
    },
  ],
  sources: [NASA_HUBBLE_MARKARIAN_231],
};
