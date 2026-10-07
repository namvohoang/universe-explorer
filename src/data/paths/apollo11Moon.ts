// Written by tools/paths/fromGroundTable.ts on 2026-10-07. Do not edit a number by hand: change
// tools/paths/apollo11Moon.json and run the tool again.
// Places of Apollo 11's two craft over the Moon. Latitude and longitude are from Table 7-II
// (trajectory parameters) of NASA's Apollo 11 Mission Report, MSC-00171, read by eye from the
// scanned page (7-9), since its text layer is garbled. Times, heights (nautical miles) and
// speeds (feet a second) are from NASA SP-2000-4029's Apollo 11 lunar orbit table and
// timeline, which print the same figures cleanly. The landing place is the one SP-4029's
// summary gives; there the craft stands still. The row 'terminal phase finalize' is left out:
// its latitude is smudged on the scan.
// Each row: [Julian date (UTC), longitude (deg E), latitude (deg N), height (km), speed (km/s)].
// Heights are turned from nautical miles at 1.852 km each, and speeds from feet a second at
// 0.0003048 km a foot. Times count from range zero, 1969-07-16T13:32:00Z.
import type { GroundPath } from '../types';

export const APOLLO_11_LANDER: GroundPath = {
  centreId: 'moon',
  heading: {
    value: 'west',
    sourceId: 'nasa-apollo11-mission-report',
    note: 'Table 7-II gives a space-fixed heading between -52 and -107 degrees east of north at every event in lunar orbit: westwards.',
  },
  points: {
    sourceId: 'nasa-apollo11-mission-report',
    value: [
      // CSM/LM undocked, 100:12:00.0 after range zero.
      [2440423.238888889, 116.21, 1.11, 116.4908, 1.625742],
      // CSM/LM separation cutoff, 100:40:01.9 after range zero.
      [2440423.258355324, 31.41, 1.05, 115.75, 1.625255],
      // LM descent orbit insertion cutoff, 101:36:44.0 after range zero.
      [2440423.297731481, -141.88, -1.16, 107.0456, 1.610838],
      // LM powered descent initiation, 102:33:05.01 after range zero.
      [2440423.336863542, 39.39, 1.02, 11.8528, 1.696182],
      // LM lunar landing, 102:45:39.9 after range zero.
      [2440423.345600694, 23.47297, 0.67408, 0, 0],
      // LM lunar liftoff ignition, 124:22:00.79 after range zero.
      [2440424.245842477, 23.47297, 0.67408, 0, 0],
      // LM orbit insertion cutoff, 124:29:15.67 after range zero.
      [2440424.25087581, 12.99, 0.73, 18.52, 1.687952],
      // LM coelliptic sequence initiation cutoff, 125:20:22.0 after range zero.
      [2440424.28636574, -149.57, -0.91, 89.6368, 1.638788],
      // LM terminal phase initiation cutoff, 127:04:14.5 after range zero.
      [2440424.358501157, -111.46, -1.17, 81.488, 1.649943],
      // CSM/LM docked, 128:03:00.0 after range zero.
      [2440424.399305556, 67.31, 1.18, 112.2312, 1.628089],
    ],
  },
};

export const APOLLO_11_COLUMBIA: GroundPath = {
  centreId: 'moon',
  heading: {
    value: 'west',
    sourceId: 'nasa-apollo11-mission-report',
    note: 'Table 7-II gives a space-fixed heading between -52 and -107 degrees east of north at every event in lunar orbit: westwards.',
  },
  points: {
    sourceId: 'nasa-apollo11-mission-report',
    value: [
      // CSM/LM undocked, 100:12:00.0 after range zero.
      [2440423.238888889, 116.21, 1.11, 116.4908, 1.625742],
      // CSM/LM separation cutoff, 100:40:01.9 after range zero.
      [2440423.258355324, 31.41, 1.05, 115.75, 1.625255],
      // CSM/LM docked, 128:03:00.0 after range zero.
      [2440424.399305556, 67.31, 1.18, 112.2312, 1.628089],
    ],
  },
};
