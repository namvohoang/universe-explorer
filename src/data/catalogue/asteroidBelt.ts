// The belt is drawn from real orbits; see src/data/belts/asteroidBeltOrbits.ts.
import { ASTEROID_BELT_ORBITS } from '../belts/asteroidBeltOrbits';
import type { Belt } from '../types';
import { s } from './helpers';
import { JPL_SBDB_MAIN_BELT } from './sources';

export const asteroidBelt: Belt = {
  id: 'asteroid-belt',
  kind: 'belt',
  name: 'Asteroid Belt',
  parentId: 'sun',
  orbit: null,
  shape: {
    type: 'belt',
    innerRadiusAu: s(
      2.172,
      'jpl-sbdb-main-belt',
      'The smallest semi-major axis among the orbits drawn.',
    ),
    outerRadiusAu: s(
      3.2,
      'jpl-sbdb-main-belt',
      'The largest semi-major axis among the orbits drawn.',
    ),
  },
  members: s(
    ASTEROID_BELT_ORBITS,
    'jpl-sbdb-main-belt',
    'The first 1500 numbered main-belt asteroids, which are the earliest found and so mostly the biggest. The real belt has millions.',
  ),
  media: [],
  sources: [JPL_SBDB_MAIN_BELT],
};
