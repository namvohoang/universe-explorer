/**
 * Asks for the measured heights of a square of land and keeps them as numbers in the colours
 * of a PNG (`public/media/land/`), with a record of what they are in `src/data/paths/`.
 *
 * Two sources, both read for this in PLAN.md 14.15:
 * - `etopo`: NOAA's ETOPO 2022 at 15 arc-seconds (about 460 m), the whole world, by OPeNDAP
 *   from NOAA's THREDDS server. The square must lie inside one of its 15-degree tiles.
 * - `3dep`: the USGS 3D Elevation Program, the United States only, from its image service.
 *
 *   npx tsx tools/land/fetchHeights.ts himalaya etopo 86.2 27.4 87.6 28.6 160
 *   npx tsx tools/land/fetchHeights.ts grandCanyon 3dep -112.35 35.95 -111.85 36.35 200
 *
 * The edges are west, south, east, north in degrees; the last number is how many cells across
 * (as many up as keep the cells square on the ground). Each cell's height is in whole metres,
 * plus `OFFSET_M` so that land below the sea fits, as red × 256 + green; blue is 255.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const ROOT = join(import.meta.dirname, '..', '..');
/** Added to every height before it is kept, so the deepest sea is above nought. */
const OFFSET_M = 11_000;
const ETOPO_TILE_DEG = 15;
/** ETOPO 2022's cells: 15 arc-seconds. */
const ETOPO_CELLS_PER_DEG = 240;
const ETOPO_BASE =
  'https://www.ngdc.noaa.gov/thredds/dodsC/global/ETOPO2022/15s/15s_surface_elev_netcdf';
const DEP_BASE =
  'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage';

const [name, source, ...rest] = process.argv.slice(2);
const numbers = rest.map(Number);
const [west = NaN, south = NaN, east = NaN, north = NaN, across = NaN] = numbers;
if (
  !name ||
  (source !== 'etopo' && source !== '3dep') ||
  [west, south, east, north, across].some((value) => !Number.isFinite(value))
) {
  throw new Error(
    'usage: fetchHeights <name> <etopo|3dep> <west> <south> <east> <north> <cells across>',
  );
}
const box: [number, number, number, number] = [west, south, east, north];
const cellsAcross = Math.round(across);
// Square cells on the ground: a degree of longitude is shorter by the cosine of the latitude.
const middleRad = (((box[1] + box[3]) / 2) * Math.PI) / 180;
const cellsUp = Math.round(
  (cellsAcross * (box[3] - box[1])) / ((box[2] - box[0]) * Math.cos(middleRad)),
);

/** Heights in metres, row by row from the north, west to east. */
async function etopo(): Promise<Float32Array> {
  const tileWest = Math.floor(box[0] / ETOPO_TILE_DEG) * ETOPO_TILE_DEG;
  const tileNorth = Math.ceil(box[3] / ETOPO_TILE_DEG) * ETOPO_TILE_DEG;
  const tileSouth = tileNorth - ETOPO_TILE_DEG;
  if (box[2] > tileWest + ETOPO_TILE_DEG || box[1] < tileSouth) {
    throw new Error('The square must lie inside one 15-degree tile of ETOPO 2022');
  }
  const tile = `${tileNorth >= 0 ? 'N' : 'S'}${String(Math.abs(tileNorth)).padStart(2, '0')}${
    tileWest >= 0 ? 'E' : 'W'
  }${String(Math.abs(tileWest)).padStart(3, '0')}`;
  // Cell i of the tile is centred (i + 1/2) cells from its south (or west) edge.
  const index = (degrees: number, from: number): number =>
    Math.min(
      ETOPO_TILE_DEG * ETOPO_CELLS_PER_DEG - 1,
      Math.max(0, Math.floor((degrees - from) * ETOPO_CELLS_PER_DEG)),
    );
  const [j0, j1] = [index(box[0], tileWest), index(box[2], tileWest)];
  const [i0, i1] = [index(box[1], tileSouth), index(box[3], tileSouth)];
  const url = `${ETOPO_BASE}/ETOPO_2022_v1_15s_${tile}_surface.nc.ascii?z%5B${String(i0)}:1:${String(i1)}%5D%5B${String(j0)}:1:${String(j1)}%5D`;
  const text = await (await fetch(url)).text();
  // Rows come as "[row], v, v, v", south first.
  const rows = [...text.matchAll(/^\[(\d+)\], (.*)$/gm)].map((match) =>
    (match[2] ?? '').split(',').map(Number),
  );
  if (rows.length === 0) throw new Error(`ETOPO gave no heights:\n${text.slice(0, 500)}`);
  const sampled = rows.reverse();
  const rowsUp = sampled.length;
  const colsAcross = sampled[0]?.length ?? 0;
  console.log(`page: ${url}`);
  // Taken to the cells asked for by the nearest measured cell.
  const heights = new Float32Array(cellsAcross * cellsUp);
  for (let row = 0; row < cellsUp; row++) {
    for (let column = 0; column < cellsAcross; column++) {
      const from = sampled[Math.min(rowsUp - 1, Math.floor(((row + 0.5) / cellsUp) * rowsUp))];
      heights[row * cellsAcross + column] =
        from?.[Math.min(colsAcross - 1, Math.floor(((column + 0.5) / cellsAcross) * colsAcross))] ??
        0;
    }
  }
  return heights;
}

/** Reads a TIFF of one band of 32-bit floats, uncompressed, in strips or tiles. */
function readFloatTiff(data: Buffer): { width: number; height: number; values: Float32Array } {
  const little = data.toString('latin1', 0, 2) === 'II';
  const u16 = (at: number): number => (little ? data.readUInt16LE(at) : data.readUInt16BE(at));
  const u32 = (at: number): number => (little ? data.readUInt32LE(at) : data.readUInt32BE(at));
  const f32 = (at: number): number => (little ? data.readFloatLE(at) : data.readFloatBE(at));
  const ifd = u32(4);
  const tags = new Map<number, number[]>();
  for (let entry = 0; entry < u16(ifd); entry++) {
    const at = ifd + 2 + entry * 12;
    const [tag, type, count] = [u16(at), u16(at + 2), u32(at + 4)];
    const size = type === 3 ? 2 : 4;
    const from = count * size <= 4 ? at + 8 : u32(at + 8);
    tags.set(
      tag,
      Array.from({ length: count }, (_, k) => (size === 2 ? u16(from + k * 2) : u32(from + k * 4))),
    );
  }
  const one = (tag: number): number => tags.get(tag)?.[0] ?? 0;
  if (one(259) !== 1 || one(339) !== 3 || one(258) !== 32) {
    throw new Error('Expected an uncompressed TIFF of 32-bit floats');
  }
  const [width, height] = [one(256), one(257)];
  const values = new Float32Array(width * height);
  const tiled = tags.has(322);
  const tileWidth = tiled ? one(322) : width;
  const tileHeight = tiled ? one(323) : one(278) || height;
  const offsets = tags.get(tiled ? 324 : 273) ?? [];
  const tilesAcross = Math.ceil(width / tileWidth);
  for (const [tile, offset] of offsets.entries()) {
    const [tileX, tileY] = [
      (tile % tilesAcross) * tileWidth,
      Math.floor(tile / tilesAcross) * tileHeight,
    ];
    for (let y = 0; y < tileHeight; y++) {
      for (let x = 0; x < tileWidth; x++) {
        const [px, py] = [tileX + x, tileY + y];
        if (px < width && py < height)
          values[py * width + px] = f32(offset + (y * tileWidth + x) * 4);
      }
    }
  }
  return { width, height, values };
}

/** Heights in metres, row by row from the north, west to east. */
async function dep(): Promise<Float32Array> {
  const query = new URLSearchParams({
    bbox: box.join(','),
    bboxSR: '4326',
    imageSR: '4326',
    size: `${String(cellsAcross)},${String(cellsUp)}`,
    format: 'tiff',
    pixelType: 'F32',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'image',
  });
  const url = `${DEP_BASE}?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`3DEP answered ${String(response.status)}`);
  console.log(`page: ${url}`);
  const { width, height, values } = readFloatTiff(Buffer.from(await response.arrayBuffer()));
  if (width !== cellsAcross || height !== cellsUp) throw new Error('3DEP gave another size');
  return values;
}

/** A PNG of 8-bit RGB, written by hand: a signature, a header, the rows, an end. */
function png(width: number, height: number, rgb: Uint8Array): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (bytes: Buffer): number => {
    let c = 0xffffffff;
    for (const byte of bytes) c = (crcTable[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, body: Buffer): Buffer => {
    const head = Buffer.alloc(4);
    head.writeUInt32BE(body.length);
    const typed = Buffer.concat([Buffer.from(type, 'latin1'), body]);
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc(typed));
    return Buffer.concat([head, typed, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const rows = Buffer.alloc(height * (1 + width * 3));
  for (let row = 0; row < height; row++) {
    rows.set(rgb.subarray(row * width * 3, (row + 1) * width * 3), row * (1 + width * 3) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const heights = source === 'etopo' ? await etopo() : await dep();
const rgb = new Uint8Array(heights.length * 3);
let [lowest, highest] = [Infinity, -Infinity];
for (const [cell, metres] of heights.entries()) {
  const kept = Math.max(0, Math.min(65_535, Math.round(metres + OFFSET_M)));
  rgb.set([kept >> 8, kept & 0xff, 255], cell * 3);
  lowest = Math.min(lowest, metres);
  highest = Math.max(highest, metres);
}
const file = `public/media/land/${name}-heights.png`;
writeFileSync(join(ROOT, file), png(cellsAcross, cellsUp, rgb));
const constant = `${name.replace(/([A-Z])/g, '_$1').toUpperCase()}_HEIGHTS`;
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(ROOT, `src/data/paths/${name}Heights.ts`),
  `// Written by tools/land/fetchHeights.ts on ${today}. Do not edit a number by hand: run the tool again.
// The measured heights of a square of land, from ${source === 'etopo' ? "NOAA's ETOPO 2022 (15 arc-seconds)" : 'the USGS 3D Elevation Program'}, kept in
// ${file}: ${String(cellsAcross)} cells across and ${String(cellsUp)} up, each in whole metres plus offsetM.
import type { LandHeights } from '../types';

export const ${constant}: LandHeights = {
  file: '${file}',
  box: { value: [${box.join(', ')}], sourceId: '${source === 'etopo' ? 'noaa-etopo-2022' : 'usgs-3dep'}' },
  cellsAcross: ${String(cellsAcross)},
  cellsUp: ${String(cellsUp)},
  offsetM: ${String(OFFSET_M)},
  lowestM: { value: ${String(Math.round(lowest))}, sourceId: '${source === 'etopo' ? 'noaa-etopo-2022' : 'usgs-3dep'}' },
  highestM: { value: ${String(Math.round(highest))}, sourceId: '${source === 'etopo' ? 'noaa-etopo-2022' : 'usgs-3dep'}' },
};
`,
);
console.log(
  `${file}: ${String(cellsAcross)} × ${String(cellsUp)} cells, ${String(Math.round(lowest))} m to ${String(Math.round(highest))} m`,
);
