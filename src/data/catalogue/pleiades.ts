// Values are copied from the page in `sources`, by script, on the `retrieved` date.
// Do not edit a number by hand: re-read the source (CLAUDE.md, real numbers only).
import type { StarCluster } from '../types';
import { s, unknown } from './helpers';
import { ESA_GAIA_PLEIADES, NASA_HUBBLE_M45 } from './sources';
import { PLEIADES_STARS } from '../deep/pleiadesStars';

export const pleiades: StarCluster = {
  id: 'pleiades',
  kind: 'star-cluster',
  name: 'Pleiades',
  parentId: null,
  orbit: null,
  shape: {
    type: 'extended',
    structure: 'cluster',
    diameterLy: unknown('The source used gives no size for this object.'),
  },
  sky: {
    raDeg: unknown('The source used gives no sky position for this object.'),
    decDeg: unknown('The source used gives no sky position for this object.'),
    distanceLy: s(
      445,
      'nasa-hubble-m45',
      'Source says: M45 is located roughly 445 light-years from Earth',
    ),
  },
  stars: s(
    PLEIADES_STARS,
    'esa-gaia-pleiades',
    "The 120 stars brighter than magnitude 11 within 2 degrees of the cluster whose parallax (6.9 to 7.9 mas) and motion across the sky match it. Query: SELECT source_id, ra, dec, parallax, parallax_error, phot_g_mean_mag, bp_rp, pmra, pmdec FROM gaiadr3.gaia_source WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', 56.75, 24.12, 2.0)) AND parallax BETWEEN 6.9 AND 7.9 AND phot_g_mean_mag < 11 AND pmra BETWEEN 17 AND 23 AND pmdec BETWEEN -49 AND -41. The very brightest stars of the Pleiades are too bright for Gaia and are missing.",
  ),
  media: [
    {
      file: 'public/media/deep/pleiades.webp',
      kind: 'composite',
      role: 'picture',
      altKey: 'pictureAltPleiades',
      credit:
        'NASA and the Hubble Heritage Team (STScI/AURA); Acknowledgment: George Herbig and Theodore Simon (Institute for Astronomy, University of Hawaii)',
    },
  ],
  sources: [ESA_GAIA_PLEIADES, NASA_HUBBLE_M45],
};
