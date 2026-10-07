import type { Story } from '../types';
import { apollo11Landing } from './apollo11Landing';
import { aurora } from './aurora';
import { apollo11Launch } from './apollo11Launch';
import { artemis1 } from './artemis1';
import { artemis2 } from './artemis2';
import { halleyTail } from './halleyTail';
import { lunarEclipse } from './lunarEclipse';
import { marsBackwards } from './marsBackwards';
import { meteorShower } from './meteorShower';
import { moonPhases } from './moonPhases';
import { saturnRings } from './saturnRings';
import { seasons } from './seasons';
import { shuttleDocking } from './shuttleDocking';
import { solarEclipse } from './solarEclipse';
import { supermoon } from './supermoon';

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
  artemis1,
  artemis2,
  shuttleDocking,
];
