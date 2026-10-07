/**
 * Asks JPL Horizons which way a body was turned at an instant of clock time (UTC): where its
 * point at latitude 0, longitude 0 was, from its centre, in the ecliptic frame of J2000.
 * Writes it into `src/data/paths/` as a `BodyTurn`.
 *
 *   npx tsx tools/horizons/fetchTurn.ts eclipse2027EarthTurn 399 2027-08-02T08:00:00Z
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_JD = 2_440_587.5;

const [name, body, utc] = process.argv.slice(2);
if (!name || !body || !utc) throw new Error('usage: fetchTurn <name> <horizons body> <utc>');

async function horizons(parameters: Readonly<Record<string, string>>): Promise<string> {
  const query = new URLSearchParams({ format: 'text' });
  for (const [key, value] of Object.entries(parameters)) query.set(key, `'${value}'`);
  const response = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${query.toString()}`);
  return response.text();
}
const firstRow = (text: string): string[] => {
  const body = /\$\$SOE\n([\s\S]*?)\$\$EOE/.exec(text)?.[1];
  if (!body) throw new Error(`Horizons gave no table:\n${text.slice(0, 1500)}`);
  return (body.trim().split('\n')[0] ?? '').split(',').map((cell) => cell.trim());
};

// How far Horizons' own clock (TDB) was ahead of clock time at that instant, and the body's size.
const offsetText = await horizons({
  COMMAND: '10',
  OBJ_DATA: 'NO',
  MAKE_EPHEM: 'YES',
  EPHEM_TYPE: 'OBSERVER',
  CENTER: `500@${body}`,
  TLIST: utc.replace('T', ' ').replace('Z', ''),
  QUANTITIES: '30',
  CSV_FORMAT: 'YES',
});
const tdbMinusUtSeconds = Number(firstRow(offsetText)[3]);
const equatorKm = Number(/Center radii\s*:\s*([\d.]+)/.exec(offsetText)?.[1]);
if (!Number.isFinite(tdbMinusUtSeconds) || !(equatorKm > 0)) {
  throw new Error(`Cannot read the clock offset or the radius:\n${offsetText.slice(0, 1500)}`);
}

const utJd = Date.parse(utc) / 1000 / SECONDS_PER_DAY + UNIX_EPOCH_JD;
const tdbJd = utJd + tdbMinusUtSeconds / SECONDS_PER_DAY;
const text = await horizons({
  COMMAND: `c: 0, ${equatorKm.toFixed(5)}, 0.00000 @${body}`,
  OBJ_DATA: 'NO',
  MAKE_EPHEM: 'YES',
  EPHEM_TYPE: 'VECTORS',
  CENTER: `500@${body}`,
  REF_PLANE: 'ECLIPTIC',
  OUT_UNITS: 'KM-S',
  VEC_TABLE: '1',
  CSV_FORMAT: 'YES',
  TLIST: tdbJd.toFixed(9),
});
const [, , x, y, z] = firstRow(text).map(Number);
if (x === undefined || y === undefined || z === undefined || Number.isNaN(x + y + z)) {
  throw new Error(`Cannot read a place:\n${text.slice(0, 1500)}`);
}
const size = Math.hypot(x, y, z);
const towards = [x, y, z].map((part) => Number((part / size).toFixed(9)));

const today = new Date().toISOString().slice(0, 10);
const constant = name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const sourceId = `jpl-horizons-turn-${name.toLowerCase()}`;
writeFileSync(
  join(ROOT, 'src/data/paths', `${name}.ts`),
  `// Written by tools/horizons/fetchTurn.ts on ${today}. Do not edit a number by hand: run the tool again.
// Which way latitude 0, longitude 0 on body ${body} pointed at ${utc}, from JPL Horizons: a
// unit vector in the ecliptic frame of J2000. The date is given as a Julian date on Horizons'
// own clock (TDB), which was ${String(tdbMinusUtSeconds)} s ahead of clock time (UTC) then.
import type { BodyTurn } from '../types';

export const ${constant}: BodyTurn = {
  atJd: { value: ${tdbJd.toFixed(9)}, sourceId: '${sourceId}' },
  primeMeridian: { value: [${towards.join(', ')}], sourceId: '${sourceId}' },
};
`,
);
console.log(`${name}: TDB-UT ${String(tdbMinusUtSeconds)} s; source id ${sourceId}`);
