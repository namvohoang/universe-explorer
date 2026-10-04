// The belt is drawn from real orbits; see src/data/belts/kuiperBeltOrbits.ts.
import { KUIPER_BELT_ORBITS } from '../belts/kuiperBeltOrbits';
import type { Belt } from '../types';
import { s } from './helpers';
import { JPL_SBDB_TNO, NASA_FACTS_KUIPER } from './sources';

export const kuiperBelt: Belt = {
  id: 'kuiper-belt',
  kind: 'belt',
  name: 'Kuiper Belt',
  parentId: 'sun',
  orbit: null,
  shape: {
    type: 'belt',
    innerRadiusAu: s(
      30,
      'nasa-facts-kuiper',
      'Source says: Its inner edge begins at the orbit of Neptune, at about 30 AU from the Sun.',
    ),
    outerRadiusAu: s(
      50,
      'nasa-facts-kuiper',
      'Source says: The inner, main region of the Kuiper Belt ends around 50 AU from the Sun.',
    ),
  },
  members: s(
    KUIPER_BELT_ORBITS,
    'jpl-sbdb-tno',
    'The 787 numbered trans-Neptunian objects whose semi-major axis is within the 50 AU where NASA says the main region ends. Objects farther out, in the scattered disk, are left out.',
  ),
  media: [],
  sources: [JPL_SBDB_TNO, NASA_FACTS_KUIPER],
};
