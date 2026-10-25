/**
 * Asks NASA Worldview for a true-colour picture of a square of Earth on one day, as one of the
 * two satellites that carry the VIIRS camera saw it that afternoon, or as the MODIS camera on
 * Terra saw it that morning or the one on Aqua that afternoon, or, for a small place, as
 * Landsat (L30) or Sentinel-2 (S30) saw it, from NASA's Harmonized Landsat and Sentinel-2
 * pictures, 30 metres to a pixel. It writes the picture into
 * `public/media/stories/` as WebP. The picture is laid out evenly in longitude and latitude
 * (EPSG:4326), so it can be put back on a globe where it belongs.
 *
 *   npx tsx tools/storms/fetchPicture.ts sam-2021-09-26 2021-09-26 NOAA20 -50 14
 *
 * The two numbers after the satellite are the middle of the square: longitude east and latitude
 * north, in whole degrees (in hundredths of a degree for L30 and S30). A last number, if given,
 * is how far the square reaches from its middle, in degrees (15 if not given). `cwebp` must be
 * installed.
 *
 *   npx tsx tools/storms/fetchPicture.ts blatten-2025-05-29 2025-05-29 L30 7.84 46.42 0.07
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
/** How far the square reaches from its middle, in degrees, unless asked otherwise, and how many pixels it is across. */
const DEFAULT_HALF_DEG = 15;
const PIXELS = 1536;
/** A Landsat or Sentinel-2 picture is asked for no finer than its own 30 metres to a pixel. */
const FINE_PIXELS = 768;
const WEBP_QUALITY = 72;
const LAYERS = {
  SNPP: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
  NOAA20: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
  TERRA: 'MODIS_Terra_CorrectedReflectance_TrueColor',
  AQUA: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
  L30: 'HLS_L30_Nadir_BRDF_Adjusted_Reflectance',
  S30: 'HLS_S30_Nadir_BRDF_Adjusted_Reflectance',
} as const;

const [name, day, satellite, lonText, latText, halfText] = process.argv.slice(2);
const layer = LAYERS[satellite as keyof typeof LAYERS] as string | undefined;
const lon = Number(lonText);
const lat = Number(latText);
const HALF_DEG = halfText === undefined ? DEFAULT_HALF_DEG : Number(halfText);
const fine = satellite === 'L30' || satellite === 'S30';
/** Whole degrees, or hundredths of a degree for a small place. */
const onGrid = (value: number): boolean =>
  fine ? Number.isInteger(Math.round(value * 100 * 1e6) / 1e6) : Number.isInteger(value);
if (
  !name ||
  !day ||
  layer === undefined ||
  !onGrid(lon) ||
  !onGrid(lat) ||
  !(onGrid(HALF_DEG) && HALF_DEG > 0)
) {
  throw new Error(
    'usage: fetchPicture <name> <yyyy-mm-dd> <SNPP|NOAA20|TERRA|AQUA|L30|S30> <lon east> <lat north> [half width]',
  );
}

/** Rounded to hundredths, so the edges written down are the ones asked for. */
const edge = (value: number): number => Math.round(value * 100) / 100;
const [west, south, east, north] = [
  lon - HALF_DEG,
  lat - HALF_DEG,
  lon + HALF_DEG,
  lat + HALF_DEG,
].map(edge) as [number, number, number, number];
const query = new URLSearchParams({
  REQUEST: 'GetSnapshot',
  TIME: day,
  BBOX: [south, west, north, east].join(','),
  CRS: 'EPSG:4326',
  LAYERS: layer,
  FORMAT: 'image/jpeg',
  WIDTH: String(fine ? FINE_PIXELS : PIXELS),
  HEIGHT: String(fine ? FINE_PIXELS : PIXELS),
});
const response = await fetch(`https://wvs.earthdata.nasa.gov/api/v1/snapshot?${query.toString()}`);
if (!response.ok || !(response.headers.get('content-type') ?? '').startsWith('image/')) {
  throw new Error(`Worldview answered ${String(response.status)}: ${await response.text()}`);
}
const jpeg = join(mkdtempSync(join(tmpdir(), 'storm-picture-')), `${name}.jpg`);
writeFileSync(jpeg, Buffer.from(await response.arrayBuffer()));
const file = `public/media/stories/${name}.webp`;
execFileSync('cwebp', ['-quiet', '-q', String(WEBP_QUALITY), jpeg, '-o', join(ROOT, file)]);
console.log(
  `${file}: ${layer} on ${day}; west ${String(west)}, south ${String(south)}, east ${String(east)}, north ${String(north)}`,
);
console.log(
  `page: https://worldview.earthdata.nasa.gov/?v=${[west, south, east, north].join(',')}&l=${layer}&t=${day}`,
);
