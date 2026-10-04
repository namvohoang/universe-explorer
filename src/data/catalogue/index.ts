import type { CelestialObject } from '../types';
import { earth } from './earth';
import { jupiter } from './jupiter';
import { deimos } from './deimos';
import { mars } from './mars';
import { phobos } from './phobos';
import { mercury } from './mercury';
import { moon } from './moon';
import { neptune } from './neptune';
import { saturn } from './saturn';
import { saturnRings } from './saturnRings';
import { sun } from './sun';
import { uranus } from './uranus';
import { uranusRings } from './uranusRings';
import { venus } from './venus';
import { io } from './io';
import { europa } from './europa';
import { ganymede } from './ganymede';
import { callisto } from './callisto';
import { mimas } from './mimas';
import { enceladus } from './enceladus';
import { tethys } from './tethys';
import { dione } from './dione';
import { rhea } from './rhea';
import { titan } from './titan';
import { iapetus } from './iapetus';
import { miranda } from './miranda';
import { ariel } from './ariel';
import { umbriel } from './umbriel';
import { titania } from './titania';
import { oberon } from './oberon';
import { triton } from './triton';
import { ceres } from './ceres';
import { pluto } from './pluto';
import { makemake } from './makemake';
import { eris } from './eris';
import { asteroidBelt } from './asteroidBelt';
import { eros } from './eros';
import { kuiperBelt } from './kuiperBelt';
import { vesta } from './vesta';
import { halley } from './halley';

/** Every object in the app. Order is from the Sun outwards, moons and rings after their planet,
 * dwarf planets where their orbits put them. */
export const catalogue: readonly CelestialObject[] = [
  sun,
  mercury,
  venus,
  earth,
  moon,
  mars,
  phobos,
  deimos,
  eros,
  asteroidBelt,
  vesta,
  ceres,
  jupiter,
  io,
  europa,
  ganymede,
  callisto,
  saturn,
  saturnRings,
  mimas,
  enceladus,
  tethys,
  dione,
  rhea,
  titan,
  iapetus,
  uranus,
  uranusRings,
  miranda,
  ariel,
  umbriel,
  titania,
  oberon,
  neptune,
  triton,
  pluto,
  makemake,
  eris,
  halley,
  kuiperBelt,
];
