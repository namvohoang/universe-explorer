/**
 * Writes a path round a body into `src/data/paths/` from rows copied out of an agency's table:
 * event, time since range zero (hhh:mm:ss), longitude (degrees east), latitude (degrees
 * north), height (nautical miles), speed (feet a second). It only changes the units.
 *
 *   npx tsx tools/paths/fromGroundTable.ts tools/paths/apollo11Moon.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
/** The international nautical mile and the international foot, by definition. */
const KM_PER_NAUTICAL_MILE = 1.852;
const KM_PER_FOOT = 0.0003048;
const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_JD = 2_440_587.5;

type Row = readonly [string, string, number, number, number, number];
interface Input {
  readonly file: string;
  readonly centreId: string;
  readonly rangeZeroUtc: string;
  readonly heading: 'east' | 'west';
  readonly headingSourceId: string;
  readonly headingNote: string;
  readonly sourceId: string;
  readonly note: readonly string[];
  readonly paths: Readonly<Record<string, readonly Row[]>>;
}

const inputPath = process.argv[2];
if (!inputPath) throw new Error('usage: fromGroundTable <input.json>');
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as Input;
const rangeZeroJd = Date.parse(input.rangeZeroUtc) / 1000 / SECONDS_PER_DAY + UNIX_EPOCH_JD;

const secondsOf = (elapsed: string): number => {
  const [hours = 0, minutes = 0, seconds = 0] = elapsed.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const one = (name: string, rows: readonly Row[]): string => `export const ${name}: GroundPath = {
  centreId: '${input.centreId}',
  heading: {
    value: '${input.heading}',
    sourceId: '${input.headingSourceId}',
    note: '${input.headingNote}',
  },
  points: {
    sourceId: '${input.sourceId}',
    value: [
${rows
  .map(([event, elapsed, lon, lat, nauticalMiles, feetPerSecond]) => {
    const jd = (rangeZeroJd + secondsOf(elapsed) / SECONDS_PER_DAY).toFixed(9);
    const km = Number((nauticalMiles * KM_PER_NAUTICAL_MILE).toFixed(4));
    const kmPerS = Number((feetPerSecond * KM_PER_FOOT).toFixed(6));
    return `      // ${event}, ${elapsed} after range zero.\n      [${String(Number(jd))}, ${String(lon)}, ${String(lat)}, ${String(km)}, ${String(kmPerS)}],`;
  })
  .join('\n')}
    ],
  },
};
`;

const today = new Date().toISOString().slice(0, 10);
const file = `// Written by tools/paths/fromGroundTable.ts on ${today}. Do not edit a number by hand: change
// ${inputPath} and run the tool again.
${input.note.map((line) => `// ${line}`).join('\n')}
// Each row: [Julian date (UTC), longitude (deg E), latitude (deg N), height (km), speed (km/s)].
// Heights are turned from nautical miles at ${String(KM_PER_NAUTICAL_MILE)} km each, and speeds from feet a second at
// ${String(KM_PER_FOOT)} km a foot. Times count from range zero, ${input.rangeZeroUtc}.
import type { GroundPath } from '../types';

${Object.entries(input.paths)
  .map(([name, rows]) => one(name, rows))
  .join('\n')}`;
writeFileSync(join(ROOT, 'src/data/paths', `${input.file}.ts`), file);
console.log(`${input.file}: ${Object.keys(input.paths).join(', ')}`);
