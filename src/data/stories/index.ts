import type { Story } from '../types';
import { artemis1 } from './artemis1';
import { moonPhases } from './moonPhases';

/** Everything the Watch screen can play, in the order shown within each group. */
export const stories: readonly Story[] = [moonPhases, artemis1];
