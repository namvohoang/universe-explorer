/**
 * Reads one storm out of the Japan Meteorological Agency's best-track file (RSMC Tokyo –
 * Typhoon Center) and writes it into `src/data/paths/` as a `StormTrack`: where the storm's
 * middle was every six hours, how hard it blew, how low the pressure at its middle was and how
 * far out its strong winds reached.
 *
 *   npx tsx tools/storms/fetchJmaTrack.ts noru2022Track 2216
 *
 * The number is the storm's international number: the last two digits of its year and its
 * place in that year's list. `unzip` must be installed.
 *
 * The file gives wind in knots and reach in nautical miles: a nautical mile is 1.852 km by
 * definition. Its wind is the mean over ten minutes, which reads lower than the one-minute
 * wind American agencies give for the same storm. For reach it gives the longest and the
 * shortest distance winds of 30 knots were found from the middle, not four quarters: the mean
 * of the two is written in all four quarters, since the app draws the storm round.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
/** Every year's storms in one file, as linked from the agency's best-track page on 2026-10-11. */
const ALL_TRACKS_URL =
  'https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst_all.zip';
const KM_PER_NAUTICAL_MILE = 1.852;
const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2_440_587.5;
/** What the file's grades stand for. */
const GRADES: Readonly<Record<string, string>> = { 2: 'TD', 3: 'TS', 4: 'STS', 5: 'TY', 6: 'L' };

const [name, stormId] = process.argv.slice(2);
if (!name || !stormId || !/^\d{4}$/.test(stormId)) {
  throw new Error('usage: fetchJmaTrack <name> <international number, such as 2216>');
}

const response = await fetch(ALL_TRACKS_URL);
if (!response.ok) throw new Error(`The agency answered ${String(response.status)}`);
const folder = mkdtempSync(join(tmpdir(), 'jma-tracks-'));
writeFileSync(join(folder, 'bst_all.zip'), Buffer.from(await response.arrayBuffer()));
execFileSync('unzip', ['-o', '-q', join(folder, 'bst_all.zip'), '-d', folder]);
const lines = readFileSync(join(folder, 'bst_all.txt'), 'utf8').split('\n');
// The same number comes round again every hundred years: the last storm with it is the one meant.
const head = lines.map((line) => line.startsWith(`66666 ${stormId} `)).lastIndexOf(true);
const header = (lines[head] ?? '').trim().split(/\s+/);
const count = Number(header[2]);
const stormName = header[7] ?? '';
if (head < 0 || !(count > 0)) throw new Error(`No storm ${stormId} in the file`);

const round = (value: number, places: number): number => Number(value.toFixed(places));
const rows = lines.slice(head + 1, head + 1 + count).flatMap((line) => {
  const when = line.slice(0, 8);
  const hour = when.slice(6, 8);
  // Only the six-hourly records: near Japan the file adds others every three hours.
  if (!/^(00|06|12|18)$/.test(hour)) return [];
  // A year of two digits: the file starts in 1951.
  const year = Number(when.slice(0, 2)) + (Number(when.slice(0, 2)) >= 51 ? 1900 : 2000);
  const ms = Date.UTC(year, Number(when.slice(2, 4)) - 1, Number(when.slice(4, 6)), Number(hour));
  const longest = Number(line.slice(53, 57));
  const shortest = Number(line.slice(58, 62));
  const reach = round(((longest + shortest) / 2) * KM_PER_NAUTICAL_MILE, 1);
  return [
    [
      round(ms / MS_PER_DAY + UNIX_EPOCH_JD, 5),
      Number(line.slice(19, 23)) / 10,
      Number(line.slice(15, 18)) / 10,
      // The file writes no wind for a storm too weak to be given one.
      Number(line.slice(33, 36)) > 0
        ? round(Number(line.slice(33, 36)) * KM_PER_NAUTICAL_MILE, 1)
        : null,
      Number(line.slice(24, 28)),
      reach,
      reach,
      reach,
      reach,
      GRADES[line.slice(13, 14)] ?? '',
    ],
  ];
});

const today = new Date().toISOString().slice(0, 10);
const constant = name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const sourceId = `jma-best-track-${stormId}`;
writeFileSync(
  join(ROOT, 'src/data/paths', `${name}.ts`),
  `// Written by tools/storms/fetchJmaTrack.ts on ${today}. Do not edit a number by hand: run the tool again.
// The best track of ${stormName} (${stormId}) from the Japan Meteorological Agency (RSMC Tokyo –
// Typhoon Center), one record every six hours: [Julian date (UTC), longitude (degrees east),
// latitude (degrees north), strongest wind, as a mean over ten minutes (km/h), pressure at the
// middle (hPa), how far out winds of 30 knots (56 km/h) reached, four times over (km), and the
// agency's grade for the storm then]. The file gives knots and nautical miles: each was
// multiplied by 1.852. It gives the longest and the shortest reach, not four quarters: their
// mean is written in all four. The wind is null while the storm was too weak for the agency
// to give it one.
import type { StormTrack } from '../types';

export const ${constant}: StormTrack = {
  reachWindKmPerH: { value: ${String(round(30 * KM_PER_NAUTICAL_MILE, 2))}, sourceId: '${sourceId}' },
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
