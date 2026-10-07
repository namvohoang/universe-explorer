import type { Story } from '../types';
import { apollo11Landing } from './apollo11Landing';
import { apollo11Launch } from './apollo11Launch';
import { artemis1 } from './artemis1';
import { artemis2 } from './artemis2';
import { halleyTail } from './halleyTail';
import { lunarEclipse } from './lunarEclipse';
import { moonPhases } from './moonPhases';
import { saturnRings } from './saturnRings';
import { seasons } from './seasons';
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
  saturnRings,
  apollo11Launch,
  apollo11Landing,
  artemis1,
  artemis2,
];
