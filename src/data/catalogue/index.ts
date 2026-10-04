import type { CelestialObject } from '../types';
import { earth } from './earth';
import { jupiter } from './jupiter';
import { mars } from './mars';
import { mercury } from './mercury';
import { moon } from './moon';
import { neptune } from './neptune';
import { saturn } from './saturn';
import { saturnRings } from './saturnRings';
import { sun } from './sun';
import { uranus } from './uranus';
import { uranusRings } from './uranusRings';
import { venus } from './venus';

/** Every object in the app. Order is from the Sun outwards, moons and rings after their planet. */
export const catalogue: readonly CelestialObject[] = [
  sun,
  mercury,
  venus,
  earth,
  moon,
  mars,
  jupiter,
  saturn,
  saturnRings,
  uranus,
  uranusRings,
  neptune,
];
