/**
 * Fetches a path from JPL Horizons and writes it into `src/data/paths/`, thinned to the
 * fewest samples that still draw it true, with some of the samples left out kept in
 * `tests/fixtures/` to check the drawing against.
 *
 *   npx tsx tools/horizons/fetchPath.ts <name> <horizons id> <centre id> <catalogue centre> \
 *     "<start>" "<stop>" <step> <tolerance km>
 *   npx tsx tools/horizons/fetchPath.ts artemis1Orion -1023 399 earth \
 *     "2022-11-16 09:00" "2022-12-11 17:00" 10m 1
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PathSample } from '../../src/data/types';
import { thinPath } from '../../src/sim/trajectory';

const ROOT = join(import.meta.dirname, '..', '..');
/** One left-out sample in this many is kept for the test. */
const FIXTURE_EVERY = 12;

const [name, command, centre, centreId, start, stop, step, tolerance] = process.argv.slice(2);
if (!name || !command || !centre || !centreId || !start || !stop || !step || !tolerance) {
  throw new Error(
    'usage: fetchPath <name> <id> <centre> <catalogue centre> <start> <stop> <step> <km>',
  );
}
const toleranceKm = Number(tolerance);

const quoted = (value: string): string => `'${value}'`;
const query = new URLSearchParams({
  format: 'text',
  COMMAND: quoted(command),
  OBJ_DATA: quoted('NO'),
  MAKE_EPHEM: quoted('YES'),
  EPHEM_TYPE: quoted('VECTORS'),
  CENTER: quoted(`500@${centre}`),
  REF_PLANE: quoted('ECLIPTIC'),
  REF_SYSTEM: quoted('ICRF'),
  OUT_UNITS: quoted('KM-S'),
  VEC_TABLE: quoted('2'),
  CSV_FORMAT: quoted('YES'),
  START_TIME: quoted(start),
  STOP_TIME: quoted(stop),
  STEP_SIZE: quoted(step),
});
const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${query.toString()}`;
const response = await fetch(url);
const text = await response.text();
const table = /\$\$SOE\n([\s\S]*?)\$\$EOE/.exec(text)?.[1];
if (!table) throw new Error(`Horizons gave no table:\n${text.slice(0, 2000)}`);
const targetName = /Target body name: (.*?)\s*\{/.exec(text)?.[1] ?? command;

/** Positions to the metre and speeds to the millimetre a second: finer than the tracking is. */
const round = (value: number, places: number): number => Number(value.toFixed(places));
const all: PathSample[] = table
  .trim()
  .split('\n')
  .map((line) => {
    const cells = line.split(',').map((cell) => cell.trim());
    const [jd, , x, y, z, vx, vy, vz] = cells.map(Number);
    if ([jd, x, y, z, vx, vy, vz].some((value) => value === undefined || !Number.isFinite(value))) {
      throw new Error(`Cannot read: ${line}`);
    }
    return [
      round(jd ?? 0, 9),
      round(x ?? 0, 3),
      round(y ?? 0, 3),
      round(z ?? 0, 3),
      round(vx ?? 0, 6),
      round(vy ?? 0, 6),
      round(vz ?? 0, 6),
    ] as const;
  });

const kept = thinPath(all, toleranceKm);
const keptDates = new Set(kept.map((sample) => sample[0]));
const leftOut = all.filter((sample) => !keptDates.has(sample[0]));
const fixture = leftOut.filter((_, index) => index % FIXTURE_EVERY === 0);

const today = new Date().toISOString().slice(0, 10);
const constant = name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const file = `// Written by tools/horizons/fetchPath.ts on ${today}. Do not edit a number by hand: run the tool again.
// ${targetName} from the centre of body ${centre}, as JPL Horizons gives it every ${step} from
// ${start} to ${stop} (TDB), ecliptic of J2000, km and km/s. Of ${String(all.length)} samples the
// ${String(kept.length)} here are the ones needed to draw the rest to within ${tolerance} km.
import type { SampledPath } from '../types';

/** Cite as \`sourceId: 'jpl-horizons-path-${name.toLowerCase()}'\`; the page is in catalogue/sources.ts. */
export const ${constant}: SampledPath = {
  centreId: '${centreId}',
  samples: {
    sourceId: 'jpl-horizons-path-${name.toLowerCase()}',
    value: [
${kept.map((sample) => `      [${sample.join(', ')}],`).join('\n')}
    ],
  },
};
`;
writeFileSync(join(ROOT, 'src/data/paths', `${name}.ts`), file);
writeFileSync(
  join(ROOT, 'tests/fixtures', `${name}.heldout.json`),
  `${JSON.stringify({ url, retrieved: today, toleranceKm, samples: fixture })}\n`,
);
console.log(
  `${name}: kept ${String(kept.length)} of ${String(all.length)}; ${String(fixture.length)} held out`,
);
console.log(url);
