import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { landHeightKm } from '../sim/scale';
import type { Vec3 } from '../sim/vec3';
import { addBlockSides, placeBoard, smooth } from './diorama';
import { createLandBlock, type LandBlockOptions } from './landBlock';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of how a mountain range is made, over tens of millions of years, ending on the
 * real range. One unit is one kilometre across; heights are drawn as many times as tall as the
 * real land's (`drawnTimes`).
 * 1. Two plates of land with a wide sea between; the southern one moving north.
 * 2. They meet, and the ground between them crumples: its layers fold and rise into ridges,
 *    growing as the years go by, snow on their tops.
 * 3. Today: the drawing gives way to the real range, built from its measured heights with a
 *    picture from space laid over it.
 * 4. Beside it, two bars by the same factor: the highest point measured in the block, and the
 *    tallest mountain of the solar system, so their heights keep their true ratio.
 * 5. With its button, the real picture from space in place of the drawing.
 *
 * What is real: the land of today (its heights and the picture), and the two heights of the
 * bars. What is a drawing: everything before today, and how it is drawn to happen; the years
 * it is said to happen in are the source's.
 */
const BACKGROUND = '#0a1020';
const SEA = 0x2a6ca6;
const INDIA = 0x8c7a55;
const ASIA = 0x7a6b52;
const ROCK_LAYERS = ['#8d7b5f', '#a48e68', '#7a6a51', '#b39c74'];
const BAR = 0xffd23f;

/** The drawn plates: each this wide and long, the meeting line at z = 0, north towards -z. */
const PLATE_WIDE = 140;
const PLATE_LONG = 90;
const PLATE_THICK = 12;
/** How far apart the plates are drawn at the start, in km, and how wide the crumpled zone. */
const START_GAP = 120;
const ZONE = 50;
const GRID = 80;

export interface MountainSliceOptions {
  /** How many years ago it is at a moment of the story. */
  readonly yearsAt: (jd: number) => number;
  /** When the plates are drawn starting to move, and when they meet, in years ago. */
  readonly startYearsAgo: number;
  readonly meetYearsAgo: number;
  /** From when the real range of today is shown, as a Julian date. */
  readonly todayFromJd: number;
  /** From when the bars of the two heights are shown, as a Julian date. */
  readonly barsFromJd: number;
  /** The real land, and the heights of the two bars with their words. */
  readonly land: Omit<LandBlockOptions, 'baseKm'>;
  readonly highestKm: number;
  readonly tallestKm: number;
  readonly highestLabel: string;
  readonly tallestLabel: string;
  /** The real picture, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface MountainSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  set(jd: number, picture: number | null): void;
  flow(seconds: number): void;
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/** Bands of rock, to show the layers of the crumpled ground on its cut side. */
function layersTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    for (let band = 0; band < 8; band++) {
      context.fillStyle = ROCK_LAYERS[band % ROCK_LAYERS.length] ?? '#8d7b5f';
      context.fillRect(0, band * 8, 8, 8);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** How high the drawn ridges stand in the crumpled zone, in km before stretching: a drawing. */
function ridgeKm(x: number, z: number, grown: number): number {
  const across = smooth(ZONE / 2, 0, Math.abs(z));
  const ridges = 0.55 + 0.25 * Math.sin(x / 9) + 0.2 * Math.sin(x / 4.3 + z / 7);
  const folds = 0.5 + 0.5 * Math.cos(z / 4);
  return grown * 7 * across * ridges * (0.7 + 0.3 * folds);
}

export function createMountainSlice(options: MountainSliceOptions): MountainSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  const times = options.land.drawnTimes;

  scene.add(new AmbientLight(0xffffff, 0.6));
  const sun = new DirectionalLight(0xfff2dc, 2.2);
  sun.position.set(80, 160, 120);
  scene.add(sun);

  // The drawing of the past: two plates, the sea between, and the ground that crumples.
  const past = new Group();
  scene.add(past);
  const sea = new Mesh(
    keep(new PlaneGeometry(PLATE_WIDE, START_GAP + 2 * PLATE_LONG)),
    keep(new MeshStandardMaterial({ color: SEA, roughness: 0.3 })),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.5;
  past.add(sea);
  const plate = (color: number): Mesh => {
    const mesh = new Mesh(
      keep(new BoxGeometry(PLATE_WIDE, PLATE_THICK, PLATE_LONG)),
      keep(new MeshStandardMaterial({ color, roughness: 0.9 })),
    );
    past.add(mesh);
    return mesh;
  };
  const asia = plate(ASIA);
  asia.position.set(0, -PLATE_THICK / 2, -PLATE_LONG / 2 - ZONE / 2);
  const india = plate(INDIA);

  // The crumpled zone: a surface that rises into ridges, on folded layers of rock.
  const zoneGeometry = keep(new PlaneGeometry(PLATE_WIDE, ZONE, GRID, GRID / 2));
  zoneGeometry.rotateX(-Math.PI / 2);
  const zonePositions = zoneGeometry.getAttribute('position') as BufferAttribute;
  const zoneFlat = Float32Array.from(zonePositions.array);
  const zoneColors = new BufferAttribute(new Float32Array(zonePositions.count * 3), 3);
  zoneGeometry.setAttribute('color', zoneColors);
  const zone = new Mesh(
    zoneGeometry,
    keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })),
  );
  past.add(zone);
  const rock = new Color('#8a7a5e');
  const snow = new Color('#f2f5f8');
  const zoneSides = new Group();
  past.add(zoneSides);
  let zoneSideGeometries: PlaneGeometry[] = [];
  const layers = keep(layersTexture());
  const sideMaterial = keep(new MeshStandardMaterial({ map: layers, roughness: 1 }));
  let shownGrown = -1;
  /** Raises the zone to `grown` (0 flat, 1 fully risen) and cuts its sides. */
  const raise = (grown: number): void => {
    if (Math.abs(grown - shownGrown) < 0.005) return;
    shownGrown = grown;
    const heightAt = (x: number, z: number): number =>
      landHeightKm(ridgeKm(x, z, grown) * 1000, times);
    for (let index = 0; index < zonePositions.count; index++) {
      const height = heightAt(zoneFlat[index * 3] ?? 0, zoneFlat[index * 3 + 2] ?? 0);
      zonePositions.setY(index, height);
      const color = rock.clone().lerp(snow, smooth(6, 10, height));
      zoneColors.setXYZ(index, color.r, color.g, color.b);
    }
    zonePositions.needsUpdate = true;
    zoneColors.needsUpdate = true;
    zoneGeometry.computeVertexNormals();
    for (const side of zoneSideGeometries) side.dispose();
    zoneSides.clear();
    zoneSideGeometries = addBlockSides(
      zoneSides,
      heightAt,
      { west: -PLATE_WIDE / 2, east: PLATE_WIDE / 2, north: -ZONE / 2, south: ZONE / 2 },
      -PLATE_THICK,
      sideMaterial,
    );
  };

  // Today: the real range, from its measured heights, and the bars beside it.
  const today = new Group();
  today.visible = false;
  scene.add(today);
  const land = keep(createLandBlock({ ...options.land, baseKm: -PLATE_THICK }));
  today.add(land.group);
  const bars = new Group();
  bars.visible = false;
  today.add(bars);
  const barMaterial = keep(new MeshStandardMaterial({ color: BAR, roughness: 0.6 }));
  const barX = options.land.widthKm / 2 + 18;
  const words: { readonly mesh: Mesh }[] = [];
  const heights: readonly (readonly [number, string])[] = [
    [options.highestKm, options.highestLabel],
    [options.tallestKm, options.tallestLabel],
  ];
  for (const [index, [km, label]] of heights.entries()) {
    const height = landHeightKm(km * 1000, times);
    const bar = new Mesh(keep(new BoxGeometry(8, height, 8)), barMaterial);
    const x = barX + index * 16;
    bar.position.set(x, height / 2, 0);
    bars.add(bar);
    const named = keep(createLabel(label, 7, '#ffe08a'));
    named.mesh.position.set(x, height + 6, 0);
    bars.add(named.mesh);
    words.push(named);
  }

  // The real picture from space, in place of the drawing, with the button.
  const board = keep(createPictureBoard(options.pictures));
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 10, y: 10, z: 0 };
  const direction = new Vector3(0.35, 0.7, 1).normalize();
  const distance = 290;
  placeBoard(board, target, direction, distance);
  for (const named of words) {
    named.mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction);
  }

  let lastJd = Number.NaN;
  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },

    set(jd, picture) {
      board.set(picture);
      lastJd = jd;
      const years = options.yearsAt(jd);
      const isToday = jd >= options.todayFromJd;
      past.visible = !isToday && !board.group.visible;
      today.visible = isToday && !board.group.visible;
      bars.visible = jd >= options.barsFromJd;
      // The southern plate comes north until they meet; then the ground between rises.
      const coming = smooth(options.startYearsAgo, options.meetYearsAgo, years);
      india.position.set(0, -PLATE_THICK / 2, PLATE_LONG / 2 + ZONE / 2 + (1 - coming) * START_GAP);
      zone.visible = coming >= 1;
      zoneSides.visible = coming >= 1;
      sea.visible = coming < 1;
      if (coming >= 1) raise(smooth(options.meetYearsAgo, 0, years));
    },

    flow() {
      // The past moves with the story's clock alone.
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      if (Number.isFinite(lastJd)) {
        past.visible = !board.group.visible && lastJd < options.todayFromJd;
        today.visible = !board.group.visible && lastJd >= options.todayFromJd;
      }
    },

    dispose() {
      for (const side of zoneSideGeometries) side.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
