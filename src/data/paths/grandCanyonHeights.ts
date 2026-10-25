// Written by tools/land/fetchHeights.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// The measured heights of a square of land, from NOAA's ETOPO 2022 (15 arc-seconds), kept in
// public/media/land/grandCanyon-heights.png: 96 cells across and 119 up, each in whole metres plus offsetM.
import type { LandHeights } from '../types';

export const GRAND_CANYON_HEIGHTS: LandHeights = {
  file: 'public/media/land/grandCanyon-heights.png',
  box: { value: [-112.3, 35.95, -111.9, 36.35], sourceId: 'noaa-etopo-2022' },
  cellsAcross: 96,
  cellsUp: 119,
  offsetM: 11000,
  lowestM: { value: 736, sourceId: 'noaa-etopo-2022' },
  highestM: { value: 2793, sourceId: 'noaa-etopo-2022' },
};
