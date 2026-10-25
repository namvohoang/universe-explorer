// Written by tools/land/fetchHeights.ts on 2026-10-25. Do not edit a number by hand: run the tool again.
// The measured heights of a square of land, from the USGS 3D Elevation Program, kept in
// public/media/land/grandCanyon-heights.png: 300 cells across and 372 up, each in whole metres plus offsetM.
import type { LandHeights } from '../types';

export const GRAND_CANYON_HEIGHTS: LandHeights = {
  file: 'public/media/land/grandCanyon-heights.png',
  box: { value: [-112.3, 35.95, -111.9, 36.35], sourceId: 'usgs-3dep' },
  cellsAcross: 300,
  cellsUp: 372,
  offsetM: 11000,
  lowestM: { value: 706, sourceId: 'usgs-3dep' },
  highestM: { value: 2805, sourceId: 'usgs-3dep' },
};
