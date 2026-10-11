/**
 * Reads one storm out of the US National Hurricane Center's best-track file (HURDAT2) and
 * writes it into `src/data/paths/` as a `StormTrack`: where the storm's middle was every six
 * hours, how hard it blew, how low the pressure at its middle was and how far out its gales
 * reached.
 *
 *   npx tsx tools/storms/fetchTrack.ts sam2021Track AL182021
 *
 * The file gives wind in knots, reach in nautical miles and pressure in millibars. A knot is
 * one nautical mile an hour and a nautical mile is 1.852 km by definition, so both are turned
 * into km with that one number; a millibar is a hectopascal.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
/** The Atlantic file, as linked from https://www.nhc.noaa.gov/data/ on 2026-10-11. */
const HURDAT2_URL = 'https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2025-092326.txt';
const KM_PER_NAUTICAL_MILE = 1.852;
const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2_440_587.5;
/** The file writes this where a value was not measured. */
const MISSING = -999;

const [name, stormId] = process.argv.slice(2);
if (!name || !stormId) throw new Error('usage: fetchTrack <name> <storm id, such as AL182021>');

const response = await fetch(HURDAT2_URL);
if (!response.ok) throw new Error(`The hurricane centre answered ${String(response.status)}`);
const lines = (await response.text()).split('\n');
const head = lines.findIndex((line) => line.startsWith(`${stormId},`));
const [, stormName = '', count = '0'] = (lines[head] ?? '').split(',').map((cell) => cell.trim());
if (head < 0 || !(Number(count) > 0)) throw new Error(`No storm ${stormId} in the file`);

const round = (value: number, places: number): number => Number(value.toFixed(places));
/** "10.3N" or "46.4W" as degrees north or east. */
const degrees = (cell: string): number => {
  const size = Number(cell.slice(0, -1));
  return cell.endsWith('S') || cell.endsWith('W') ? -size : size;
};
const km = (cell: string): number | null =>
  Number(cell) === MISSING ? null : round(Number(cell) * KM_PER_NAUTICAL_MILE, 1);

const rows = lines.slice(head + 1, head + 1 + Number(count)).flatMap((line) => {
  const cells = line.split(',').map((cell) => cell.trim());
  const [date = '', time = '', mark = '', status = '', lat = '', lon = '', wind = '', mb = ''] =
    cells;
  // Only the six-hourly records: the file adds others at odd times (a landfall, a peak).
  if (!/^(00|06|12|18)00$/.test(time) || mark !== '') return [];
  const ms = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(4, 6)) - 1,
    Number(date.slice(6, 8)),
    Number(time.slice(0, 2)),
  );
  const reach = cells.slice(8, 12).map((cell) => km(cell));
  return [
    [
      round(ms / MS_PER_DAY + UNIX_EPOCH_JD, 5),
      degrees(lon),
      degrees(lat),
      round(Number(wind) * KM_PER_NAUTICAL_MILE, 1),
      Number(mb) === MISSING ? null : Number(mb),
      ...reach,
      status,
    ],
  ];
});

const today = new Date().toISOString().slice(0, 10);
const constant = name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const sourceId = `nhc-hurdat2-${stormId.toLowerCase()}`;
writeFileSync(
  join(ROOT, 'src/data/paths', `${name}.ts`),
  `// Written by tools/storms/fetchTrack.ts on ${today}. Do not edit a number by hand: run the tool again.
// The best track of ${stormName} (${stormId}) from the US National Hurricane Center's HURDAT2 file,
// one record every six hours: [Julian date (UTC), longitude (degrees east), latitude (degrees
// north), strongest steady wind (km/h), pressure at the middle (hPa), how far out winds of gale
// force (34 knots, 63 km/h) reached to the north-east, south-east, south-west and north-west
// (km), and what the centre called the storm then]. The file gives knots and nautical miles:
// each was multiplied by 1.852.
import type { StormTrack } from '../types';

export const ${constant}: StormTrack = {
  points: {
    sourceId: '${sourceId}',
    value: [
${rows.map((row) => `      ${JSON.stringify(row).replace(/"/g, "'").replace(/,/g, ', ')},`).join('\n')}
    ],
  },
};
`,
);
console.log(`${name}: ${stormName}, ${String(rows.length)} records; source id ${sourceId}`);
