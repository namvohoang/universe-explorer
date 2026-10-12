/**
 * Reads one earthquake out of the USGS catalogue, with the instants its first wave was picked
 * on the recordings of seismic stations round the world, and writes it into `src/data/paths/`
 * as a `QuakeRecord`.
 *
 *   npx tsx tools/quakes/fetchArrivals.ts fiji2018Quake us1000gcii
 *
 * For each station the catalogue gives how far it is from the place on the ground over the
 * earthquake (in degrees round the Earth), in which direction, which wave was picked, and
 * when. The time is written here as seconds after the earthquake began.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2_440_587.5;

const [name, eventId] = process.argv.slice(2);
if (!name || !eventId) throw new Error('usage: fetchArrivals <name> <USGS event id>');

interface Product {
  readonly contents: Readonly<Record<string, { readonly url: string } | undefined>>;
}
interface Event {
  readonly properties: {
    readonly title: string;
    readonly time: number;
    readonly mag: number;
    readonly magType: string;
    readonly products: Readonly<Record<string, readonly Product[] | undefined>>;
  };
  readonly geometry: { readonly coordinates: readonly [number, number, number] };
}

const eventUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid=${eventId}`;
const event = (await (await fetch(eventUrl)).json()) as Event;
const { title, time, mag, magType, products } = event.properties;
const [lon, lat, depthKm] = event.geometry.coordinates;
const quakeMlUrl = products['phase-data']?.[0]?.contents['quakeml.xml']?.url;
if (quakeMlUrl === undefined) throw new Error(`${eventId} has no phase data`);
const quakeMl = await (await fetch(quakeMlUrl)).text();

const tag = (block: string, tagName: string): string | undefined =>
  new RegExp(`<${tagName}>([^<]*)</${tagName}>`).exec(block)?.[1];
// When each pick was made, by its id.
const pickedAtMs = new Map<string, number>();
for (const [, id, body] of quakeMl.matchAll(/<pick publicID="([^"]+)">([\s\S]*?)<\/pick>/g)) {
  const when = /<time>\s*<value>([^<]+)<\/value>/.exec(body ?? '')?.[1];
  if (id !== undefined && when !== undefined) pickedAtMs.set(id, Date.parse(when));
}
const rows = [...quakeMl.matchAll(/<arrival [^>]*>([\s\S]*?)<\/arrival>/g)]
  .flatMap(([, body = '']) => {
    const at = pickedAtMs.get(tag(body, 'pickID') ?? '');
    const phase = tag(body, 'phase');
    const distance = Number(tag(body, 'distance'));
    const azimuth = Number(tag(body, 'azimuth'));
    if (at === undefined || phase === undefined || Number.isNaN(distance + azimuth)) return [];
    return [
      [
        Number(distance.toFixed(3)),
        Number(azimuth.toFixed(2)),
        Number(((at - time) / 1000).toFixed(2)),
        phase,
      ] as const,
    ];
  })
  .sort((a, b) => a[0] - b[0]);
if (rows.length === 0) throw new Error(`${eventId}: no arrivals could be read`);

const today = new Date().toISOString().slice(0, 10);
const constant = name
  .replace(/([a-z])([A-Z0-9])/g, '$1_$2')
  .replace(/([0-9])([A-Z])/g, '$1_$2')
  .toUpperCase();
const sourceId = `usgs-event-${eventId}`;
writeFileSync(
  join(ROOT, 'src/data/paths', `${name}.ts`),
  `// Written by tools/quakes/fetchArrivals.ts on ${today}. Do not edit a number by hand: run the tool again.
// ${title} (${eventId}), from the USGS earthquake catalogue: when and where it began, how big
// it was (${magType}), and each instant its first wave was picked on a station's recording, nearest
// station first: [how far the station is from the place on the ground over the earthquake
// (degrees round the Earth), in which direction from there (degrees east of north), how long
// after the earthquake began (seconds), and the catalogue's name for the wave picked].
import type { QuakeRecord } from '../types';

export const ${constant}: QuakeRecord = {
  originJd: { value: ${(time / MS_PER_DAY + UNIX_EPOCH_JD).toFixed(9)}, sourceId: '${sourceId}' },
  place: { value: [${String(lon)}, ${String(lat)}, ${String(depthKm)}], sourceId: '${sourceId}' },
  magnitude: { value: ${String(mag)}, sourceId: '${sourceId}' },
  arrivals: {
    sourceId: '${sourceId}',
    value: [
${rows.map((row) => `      ${JSON.stringify(row).replace(/"/g, "'").replace(/,/g, ', ')},`).join('\n')}
    ],
  },
};
`,
);
console.log(`${name}: ${title}, ${String(rows.length)} arrivals; source id ${sourceId}`);
