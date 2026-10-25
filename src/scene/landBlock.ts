import {
  BufferAttribute,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import { landHeightKm } from '../sim/scale';
import { addBlockSides } from './diorama';

/**
 * A block of real land, built from its measured heights and cut open like a model: one unit is
 * one kilometre across, heights drawn `drawnTimes` as tall as they are (`landHeightKm`). A
 * real picture from space of the same square can be laid over it; until then, and without
 * one, it is coloured by height. Its middle is at x = z = 0, north towards -z.
 */
export interface LandBlockOptions {
  /** Where the app serves the heights PNG from, and how it is laid out. */
  readonly heightsUrl: string;
  readonly cellsAcross: number;
  readonly cellsUp: number;
  readonly offsetM: number;
  /** How much ground the square shows, east to west and north to south. */
  readonly widthKm: number;
  readonly depthKm: number;
  readonly drawnTimes: number;
  /** A picture from space of the same square, laid over the land; `null` for none. */
  readonly pictureUrl: string | null;
  /** How far below sea level the block's base is cut, in km, as drawn. */
  readonly baseKm: number;
}

export interface LandBlock {
  readonly group: Group;
  /** Settles once the heights have come and the block is built. */
  readonly ready: Promise<void>;
  /** How high the drawn land stands at a point, once built; nought before. */
  heightAt(x: number, z: number): number;
  dispose(): void;
}

const LOW = new Color('#5d8a4a');
const HIGH = new Color('#8a8072');
const SNOW = new Color('#f2f5f8');

/** Reads the heights, in metres, from the PNG's colours: row by row from the north. */
function readHeights(image: HTMLImageElement, options: LandBlockOptions): Float32Array | null {
  const canvas = document.createElement('canvas');
  canvas.width = options.cellsAcross;
  canvas.height = options.cellsUp;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, options.cellsAcross, options.cellsUp).data;
  const heights = new Float32Array(options.cellsAcross * options.cellsUp);
  for (let cell = 0; cell < heights.length; cell++) {
    heights[cell] = (pixels[cell * 4] ?? 0) * 256 + (pixels[cell * 4 + 1] ?? 0) - options.offsetM;
  }
  return heights;
}

export function createLandBlock(options: LandBlockOptions): LandBlock {
  const group = new Group();
  const disposables: { dispose: () => void }[] = [];
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  disposables.push(material);
  const sideMaterial = new MeshStandardMaterial({ color: 0x4a3d33, roughness: 1 });
  disposables.push(sideMaterial);
  let heights: Float32Array | null = null;
  const { cellsAcross, cellsUp, widthKm, depthKm } = options;

  /** The drawn height of a cell, clamped to the square. */
  const cellY = (column: number, row: number): number => {
    const c = Math.min(cellsAcross - 1, Math.max(0, column));
    const r = Math.min(cellsUp - 1, Math.max(0, row));
    return landHeightKm(heights?.[r * cellsAcross + c] ?? 0, options.drawnTimes);
  };
  const heightAt = (x: number, z: number): number => {
    if (!heights) return 0;
    // Bilinear between the four nearest cells.
    const u = (x / widthKm + 0.5) * (cellsAcross - 1);
    const v = (z / depthKm + 0.5) * (cellsUp - 1);
    const [c, r] = [Math.floor(u), Math.floor(v)];
    const [fu, fv] = [u - c, v - r];
    const top = cellY(c, r) * (1 - fu) + cellY(c + 1, r) * fu;
    const bottom = cellY(c, r + 1) * (1 - fu) + cellY(c + 1, r + 1) * fu;
    return top * (1 - fv) + bottom * fv;
  };

  const ready = new Promise<void>((settle) => {
    const image = new Image();
    image.addEventListener('load', () => {
      heights = readHeights(image, options);
      if (!heights) {
        settle();
        return;
      }
      const geometry = new PlaneGeometry(widthKm, depthKm, cellsAcross - 1, cellsUp - 1);
      disposables.push(geometry);
      geometry.rotateX(-Math.PI / 2);
      const positions = geometry.getAttribute('position') as BufferAttribute;
      const colors = new Float32Array(positions.count * 3);
      const highest = Math.max(...heights);
      for (let index = 0; index < positions.count; index++) {
        // The plane's points run row by row from the north, west to east, as the cells do.
        const metres = heights[index] ?? 0;
        positions.setY(index, landHeightKm(metres, options.drawnTimes));
        const share = highest > 0 ? metres / highest : 0;
        const color = share > 0.82 ? SNOW : LOW.clone().lerp(HIGH, Math.min(1, share * 1.3));
        colors.set([color.r, color.g, color.b], index * 3);
      }
      geometry.setAttribute('color', new BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      group.add(new Mesh(geometry, material));
      disposables.push(
        ...addBlockSides(
          group,
          heightAt,
          { west: -widthKm / 2, east: widthKm / 2, north: -depthKm / 2, south: depthKm / 2 },
          options.baseKm,
          sideMaterial,
        ),
      );
      settle();
    });
    image.addEventListener('error', () => {
      settle();
    });
    image.src = options.heightsUrl;
  });

  if (options.pictureUrl) {
    const picture: Texture = new TextureLoader().load(options.pictureUrl, () => {
      material.map = picture;
      material.vertexColors = false;
      material.needsUpdate = true;
    });
    picture.colorSpace = SRGBColorSpace;
    disposables.push(picture);
  }

  return {
    group,
    ready,
    heightAt,
    dispose() {
      for (const item of disposables) item.dispose();
    },
  };
}
