import type { CelestialObject } from '../types';
import { earth } from './earth';
import { jupiter } from './jupiter';
import { deimos } from './deimos';
import { mars } from './mars';
import { phobos } from './phobos';
import { mercury } from './mercury';
import { moon } from './moon';
import { iss } from './iss';
import { hubble } from './hubble';
import { spaceShuttle } from './spaceShuttle';
import { saturnV } from './saturnV';
import { cassini } from './cassini';
import { voyager } from './voyager';
import { lunarModule } from './lunarModule';
import { gemini } from './gemini';
import { pioneer10 } from './pioneer10';
import { newHorizons } from './newHorizons';
import { curiosity } from './curiosity';
import { swift } from './swift';
import { chandra } from './chandra';
import { mro } from './mro';
import { juno } from './juno';
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
import { ida } from './ida';
import { psyche } from './psyche';
import { kuiperBelt } from './kuiperBelt';
import { vesta } from './vesta';
import { halley } from './halley';
import { pleiades } from './pleiades';
import { orionNebula } from './orionNebula';
import { crabNebula } from './crabNebula';
import { andromeda } from './andromeda';
import { triangulum } from './triangulum';
import { sombrero } from './sombrero';
import { whirlpool } from './whirlpool';
import { m87 } from './m87';
import { betelgeuse } from './betelgeuse';
import { antares } from './antares';
import { vyCanisMajoris } from './vyCanisMajoris';
import { proximaCentauri } from './proximaCentauri';
import { trappist1 } from './trappist1';
import { milkyWay } from './milkyWay';
import { m87BlackHole } from './m87BlackHole';
import { cassiopeia } from './cassiopeia';
import { southernCross } from './southernCross';
import { bigDipper } from './bigDipper';
import { orion } from './orion';

/** Every object in the app. Order is from the Sun outwards, moons and rings after their planet,
 * dwarf planets where their orbits put them.
 * Things beyond the solar system come last, nearest first. */
export const catalogue: readonly CelestialObject[] = [
  sun,
  mercury,
  venus,
  earth,
  moon,
  iss,
  hubble,
  swift,
  chandra,
  mars,
  phobos,
  deimos,
  mro,
  eros,
  ida,
  psyche,
  asteroidBelt,
  vesta,
  ceres,
  jupiter,
  io,
  europa,
  ganymede,
  callisto,
  juno,
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
  proximaCentauri,
  trappist1,
  pleiades,
  antares,
  betelgeuse,
  orionNebula,
  vyCanisMajoris,
  crabNebula,
  milkyWay,
  andromeda,
  triangulum,
  sombrero,
  whirlpool,
  m87,
  m87BlackHole,
  orion,
  bigDipper,
  southernCross,
  cassiopeia,
  gemini,
  saturnV,
  lunarModule,
  pioneer10,
  voyager,
  spaceShuttle,
  cassini,
  newHorizons,
  curiosity,
];
