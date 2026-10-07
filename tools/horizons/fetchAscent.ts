/**
 * Turns a table of a rocket's climb (time, height, latitude, longitude at each event, as an
 * agency published it) into places in space, and writes them into `src/data/paths/`.
 *
 * A place on the turning Earth is somewhere else in space every second, so each row is given
 * to JPL Horizons as a point fixed to Earth, and Horizons says where that point was at that
 * instant, from Earth's centre, in the ecliptic frame of J2000. Horizons is also asked where
 * the point at latitude 0, longitude 0 was at the first instant, so the app can turn its
 * Earth to match.
 *
 *   npx tsx tools/horizons/fetchAscent.ts tools/horizons/apollo11Ascent.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
/** The international nautical mile, by definition. */
const KM_PER_NAUTICAL_MILE = 1.852;
const SECONDS_PER_DAY = 86_400;
const UNIX_EPOCH_JD = 2_440_587.5;

interface Input {
  readonly name: string;
  readonly centre: string;
  readonly centreId: string;
  readonly rangeZeroUtc: string;
  readonly tableUrl: string;
  readonly sourceId: string;
  readonly note: string;
  readonly rows: readonly (readonly [string, number, number, number, number])[];
}

const inputPath = process.argv[2];
if (!inputPath) throw new Error('usage: fetchAscent <input.json>');
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as Input;

async function horizons(parameters: Readonly<Record<string, string>>): Promise<string> {
  const query = new URLSearchParams({ format: 'text' });
  for (const [key, value] of Object.entries(parameters)) query.set(key, `'${value}'`);
  const response = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${query.toString()}`);
  return response.text();
}

const table = (text: string): string[][] => {
  const body = /\$\$SOE\n([\s\S]*?)\$\$EOE/.exec(text)?.[1];
  if (!body) throw new Error(`Horizons gave no table:\n${text.slice(0, 1500)}`);
  return body
    .trim()
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.trim()));
};

// How far Horizons' own clock (TDB) was ahead of clock time (UT) at range zero.
const rangeZero = input.rangeZeroUtc.replace('T', ' ').replace('Z', '');
const offsetText = await horizons({
  COMMAND: '301',
  OBJ_DATA: 'NO',
  MAKE_EPHEM: 'YES',
  EPHEM_TYPE: 'OBSERVER',
  CENTER: `500@${input.centre}`,
  TLIST: rangeZero,
  QUANTITIES: '30',
  CSV_FORMAT: 'YES',
});
const tdbMinusUtSeconds = Number(table(offsetText)[0]?.[3]);
if (!Number.isFinite(tdbMinusUtSeconds)) throw new Error('Cannot read TDB-UT');

const radiiText = /Center radii\s*:\s*([\d.]+),\s*[\d.]+,\s*([\d.]+) km/.exec(offsetText);
const equatorKm = Number(radiiText?.[1]);
const poleKm = Number(radiiText?.[2]);
if (!(equatorKm > 0) || !(poleKm > 0)) throw new Error('Cannot read the radii of the centre');

const rangeZeroJd = Date.parse(input.rangeZeroUtc) / 1000 / SECONDS_PER_DAY + UNIX_EPOCH_JD;

/** Where a point fixed to the centre body was at an instant of clock time: [x, y, z] in km. */
async function placeOf(
  lonDegEast: number,
  alongEquatorKm: number,
  alongPoleKm: number,
  utJd: number,
): Promise<[number, number, number]> {
  const text = await horizons({
    COMMAND: `c: ${String(lonDegEast)}, ${alongEquatorKm.toFixed(5)}, ${alongPoleKm.toFixed(5)} @${input.centre}`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: `500@${input.centre}`,
    REF_PLANE: 'ECLIPTIC',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '1',
    CSV_FORMAT: 'YES',
    TLIST: (utJd + tdbMinusUtSeconds / SECONDS_PER_DAY).toFixed(9),
  });
  const [, , x, y, z] = (table(text)[0] ?? []).map(Number);
  if (x === undefined || y === undefined || z === undefined || Number.isNaN(x + y + z)) {
    throw new Error(`Cannot read a place:\n${text.slice(0, 1500)}`);
  }
  return [Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))];
}

const points: (readonly [number, number, number, number])[] = [];
for (const [, seconds, altitudeNauticalMiles, latDeg, lonDeg] of input.rows) {
  const lat = (latDeg * Math.PI) / 180;
  // The table's latitude is measured from Earth's centre. The ground there is this far out
  // (the spheroid's radius along that line), and the height is added along the same line.
  const groundKm =
    (equatorKm * poleKm) / Math.hypot(poleKm * Math.cos(lat), equatorKm * Math.sin(lat));
  const radiusKm = groundKm + altitudeNauticalMiles * KM_PER_NAUTICAL_MILE;
  const utJd = rangeZeroJd + seconds / SECONDS_PER_DAY;
  const place = await placeOf(lonDeg, radiusKm * Math.cos(lat), radiusKm * Math.sin(lat), utJd);
  points.push([Number(utJd.toFixed(9)), ...place]);
}
const firstJd = points[0]?.[0] ?? rangeZeroJd;
const meridian = await placeOf(0, equatorKm, 0, firstJd);
const size = Math.hypot(...meridian);
const towards = meridian.map((part) => Number((part / size).toFixed(9)));

const today = new Date().toISOString().slice(0, 10);
const constant = input.name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const file = `// Written by tools/horizons/fetchAscent.ts on ${today}. Do not edit a number by hand: run the tool again.
// ${input.note}
// The table's page is the source '${input.sourceId}' in src/data/stories/sources.ts.
// Each row's place on Earth was given to JPL Horizons as a point fixed to Earth, and Horizons
// said where that point was at that instant: km from Earth's centre, ecliptic of J2000.
// Heights in nautical miles are turned to km at ${String(KM_PER_NAUTICAL_MILE)} km each. Times are clock time (UTC) as
// Julian dates; Horizons' own clock was ${String(tdbMinusUtSeconds)} s ahead and was asked accordingly.
import type { BodyTurn, StagedPath } from '../types';

export const ${constant}: StagedPath = {
  centreId: '${input.centreId}',
  points: {
    sourceId: '${input.sourceId}',
    value: [
${points.map((point) => `      [${point.join(', ')}],`).join('\n')}
    ],
  },
};

/** Which way latitude 0, longitude 0 on Earth pointed at the first instant above. */
export const ${constant}_TURN: BodyTurn = {
  atJd: { value: ${String(firstJd)}, sourceId: '${input.sourceId}' },
  primeMeridian: { value: [${towards.join(', ')}], sourceId: 'jpl-horizons-earth-turn-${input.name.toLowerCase()}' },
};
`;
writeFileSync(join(ROOT, 'src/data/paths', `${input.name}.ts`), file);
console.log(
  `${input.name}: ${String(points.length)} places; TDB-UT ${String(tdbMinusUtSeconds)} s`,
);
