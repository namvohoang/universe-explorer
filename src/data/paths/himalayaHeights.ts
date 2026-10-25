// Written by tools/land/fetchHeights.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// The measured heights of a square of land, from NOAA's ETOPO 2022 (15 arc-seconds), kept in
// public/media/land/himalaya-heights.png: 336 cells across and 381 up, each in whole metres plus offsetM.
import type { LandHeights } from '../types';

export const HIMALAYA_HEIGHTS: LandHeights = {
  file: 'public/media/land/himalaya-heights.png',
  box: { value: [86.2, 27.3, 87.6, 28.7], sourceId: 'noaa-etopo-2022' },
  cellsAcross: 336,
  cellsUp: 381,
  offsetM: 11000,
  lowestM: { value: 292, sourceId: 'noaa-etopo-2022' },
  highestM: { value: 8586, sourceId: 'noaa-etopo-2022' },
};
