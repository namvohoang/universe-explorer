import type { Story } from '../types';
import { apollo11Landing } from './apollo11Landing';
import { aurora } from './aurora';
import { apollo11Launch } from './apollo11Launch';
import { artemis1 } from './artemis1';
import { artemis1Launch } from './artemis1Launch';
import { shuttleLaunch } from './shuttleLaunch';
import { artemis2 } from './artemis2';
import { earthquakeFiji } from './earthquakeFiji';
import { halleyTail } from './halleyTail';
import { hurricaneSam } from './hurricaneSam';
import { lunarEclipse } from './lunarEclipse';
import { marsBackwards } from './marsBackwards';
import { meteorShower } from './meteorShower';
import { moonPhases } from './moonPhases';
import { saharaDust } from './saharaDust';
import { saturnRings } from './saturnRings';
import { seasons } from './seasons';
import { shuttleDocking } from './shuttleDocking';
import { solarEclipse } from './solarEclipse';
import { supermoon } from './supermoon';
import { tides } from './tides';
import { tornadoTescott } from './tornadoTescott';
import { tsunamiKermadec } from './tsunamiKermadec';
import { typhoonNoru } from './typhoonNoru';

/** Everything the Watch screen can play, in the order shown within each group. */
export const stories: readonly Story[] = [
  moonPhases,
  supermoon,
  seasons,
  solarEclipse,
  lunarEclipse,
  halleyTail,
  meteorShower,
  aurora,
  saturnRings,
  marsBackwards,
  apollo11Launch,
  apollo11Landing,
  artemis1Launch,
  artemis1,
  artemis2,
  shuttleLaunch,
  shuttleDocking,
  earthquakeFiji,
  tsunamiKermadec,
  hurricaneSam,
  typhoonNoru,
  tornadoTescott,
  tides,
  saharaDust,
];
