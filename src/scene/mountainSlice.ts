import {
  AmbientLight,
  ArrowHelper,
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { landHeightKm } from '../sim/scale';
import type { Bounds } from './flight';
import type { Vec3 } from '../sim/vec3';
import { addBlockSides, fadeGroup, placeBoard, smooth } from './diorama';
import { createLandBlock, type LandBlockOptions } from './landBlock';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';
import { settling } from './settle';

/**
 * A 3D close-up of how a mountain range is made, over tens of millions of years, ending on the
 * real range. One unit is one kilometre across; heights are drawn as many times as tall as the
 * real land's (`drawnTimes`).
 * 1. Two plates of land with a wide sea between; the southern one moving north.
 * 2. They meet, the sea between is squeezed out, and the ground between them crumples into
 *    long ridges, highest near where they meet, low hills to the south and high flat land to
 *    the north, growing as the years go by, snow on their tops.
 * 3. Rivers of ice carve deep valleys down through the ridges; then rain and the mud it carries
 *    run down those valleys, wearing the tops down a little while the range still grows.
 * 4. Today: the drawing fades into the real range, built from its measured heights with a
 *    picture from space laid over it. Arrows show it still rising, then India still pushing
 *    north.
 * 5. Beside it, two bars by the same factor: the highest point measured in the block, and the
 *    tallest mountain of the solar system, so their heights keep their true ratio.
 * 6. With its button, the real picture from space in place of the drawing.
 *
 * What is real: the land of today (its heights and the picture), and the two heights of the
 * bars. What is a drawing: everything before today, how it is drawn to happen, and the arrows;
 * the years it is said to happen in are the sources'.
 */
const BACKGROUND = '#0a1020';
const SEA = 0x2a6ca6;
const INDIA = 0x7d8a52;
const ASIA = 0x8a7a5a;
const ROCK_LAYERS = ['#8d7b5f', '#a48e68', '#7a6a51', '#b39c74'];
const BAR = 0xffd23f;
const ARROW = 0xffd23f;
const MUD = 0x8fc4ff;
const ROCK = new Color('#8a7a5e');
const HILLS = new Color('#5f7a40');
const SNOW = new Color('#f2f5f8');
const ICE = new Color('#8cc8ee');

/** The drawn plates: each this wide and long, the meeting line at z = 0, north towards -z. */
const PLATE_WIDE = 140;
const PLATE_LONG = 90;
const PLATE_THICK = 12;
/** How far apart the plates are drawn at the start, in km, and how wide the crumpled zone. */
const START_GAP = 120;
const ZONE = 50;
const GRID_X = 180;
const GRID_Z = 70;
/** The drawn ridges at their highest, and how deep the ice carves, in km: a drawing. */
const PEAK_KM = 7.5;
const CARVE_KM = 1.6;
/** How far apart the valleys the ice carves are, in km. */
const VALLEY_EVERY = 15;
const VALLEYS = Math.floor(PLATE_WIDE / VALLEY_EVERY);
const MUD_PER_VALLEY = 9;

export interface MountainSliceOptions {
  /** How many years ago it is at a moment of the story. */
  readonly yearsAt: (jd: number) => number;
  /** When the plates are drawn starting to move, and when they meet, in years ago. */
  readonly startYearsAgo: number;
  readonly meetYearsAgo: number;
  /** When ice is drawn carving the valleys, and rain wearing them, in years ago. */
  readonly iceFromYearsAgo: number;
  readonly wornFromYearsAgo: number;
  /** From when the real range of today is shown, as a Julian date. */
  readonly todayFromJd: number;
  /** When the arrow of India still pushing north is shown, and the real range alone, as Julian dates. */
  readonly pushingFromJd: number;
  readonly realFromJd: number;
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
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  /** From when it shows the real land, measured, and no longer a drawing, as a Julian date. */
  readonly realFromJd: number;
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

/** A smooth bumpiness between 0 and 1, the same every time for the same place. */
function bumps(x: number, z: number): number {
  const corner = (i: number, j: number): number => {
    const h = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const i = Math.floor(x);
  const j = Math.floor(z);
  const u = smooth(0, 1, x - i);
  const v = smooth(0, 1, z - j);
  const top = corner(i, j) + (corner(i + 1, j) - corner(i, j)) * u;
  const bottom = corner(i, j + 1) + (corner(i + 1, j + 1) - corner(i, j + 1)) * u;
  return top + (bottom - top) * v;
}

/** How high the ground is lifted across the zone: low hills south, the highest ridges near the meeting line, high flat land north. */
function across(z: number): number {
  const north = z < -6 ? 0.6 + 0.4 * smooth(-17, -6, z) : 1;
  return smooth(ZONE / 2, 2, z) * smooth(-ZONE / 2, -17, z) * north;
}

/** How deep in one of the valleys the ice carves a place is, from 0 to 1. */
function inValley(x: number, z: number): number {
  const along = x / VALLEY_EVERY + 0.3 * Math.sin(z / 9);
  const off = along - Math.floor(along) - 0.5;
  return Math.exp(-((off / 0.12) ** 2));
}

/** Where the middle of valley `index` runs at `z`. */
function valleyX(index: number, z: number): number {
  return VALLEY_EVERY * (index + 0.5 - 0.3 * Math.sin(z / 9)) - PLATE_WIDE / 2 + VALLEY_EVERY / 2;
}

/**
 * How high the drawn ground stands in the crumpled zone, in km before stretching: long folded
 * ridges and peaks, `grown` of the way risen, valleys carved `carved` deep, tops `worn` down. A
 * drawing.
 */
function ridgeKm(x: number, z: number, grown: number, carved: number, worn: number): number {
  const shifted = x + PLATE_WIDE / 2 - VALLEY_EVERY / 2;
  const folds = 1 - Math.abs(Math.sin(z * 0.45 + 0.8 * Math.sin(x / 13)));
  const peaks = 0.65 * bumps(x / 9, z / 9) + 0.35 * bumps(x / 3.5, z / 3.5);
  const lifted = across(z);
  const raw = PEAK_KM * lifted * (0.3 + 0.3 * folds + 0.55 * peaks ** 1.5) * (1 - 0.07 * worn);
  const carve = CARVE_KM * carved * inValley(shifted, z) * lifted;
  return Math.max(0, grown * raw - carve);
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
  const up = (km: number): number => landHeightKm(km * 1000, times);

  scene.add(new AmbientLight(0xffffff, 0.55));
  const sun = new DirectionalLight(0xfff2dc, 2.4);
  sun.position.set(-60, 120, 140);
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
  const layers = keep(layersTexture());
  const sideMaterial = keep(new MeshStandardMaterial({ map: layers, roughness: 1 }));
  const plateBox = keep(new BoxGeometry(PLATE_WIDE, PLATE_THICK, PLATE_LONG));
  const plate = (color: number): Mesh => {
    const top = keep(new MeshStandardMaterial({ color, roughness: 0.95 }));
    // Its top its own colour, its cut sides in layers of rock.
    const mesh = new Mesh(plateBox, [
      sideMaterial,
      sideMaterial,
      top,
      sideMaterial,
      sideMaterial,
      sideMaterial,
    ]);
    past.add(mesh);
    return mesh;
  };
  const asia = plate(ASIA);
  asia.position.set(0, -PLATE_THICK / 2, -PLATE_LONG / 2 - ZONE / 2);
  const india = plate(INDIA);

  // The crumpled zone: a surface that rises into ridges, on folded layers of rock.
  const crumpled = new Group();
  past.add(crumpled);
  const zoneGeometry = keep(new PlaneGeometry(PLATE_WIDE, ZONE, GRID_X, GRID_Z));
  zoneGeometry.rotateX(-Math.PI / 2);
  const zonePositions = zoneGeometry.getAttribute('position') as BufferAttribute;
  const zoneFlat = Float32Array.from(zonePositions.array);
  const zoneColors = new BufferAttribute(new Float32Array(zonePositions.count * 3), 3);
  zoneGeometry.setAttribute('color', zoneColors);
  crumpled.add(
    new Mesh(zoneGeometry, keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }))),
  );
  const zoneSides = new Group();
  crumpled.add(zoneSides);
  let zoneSideGeometries: PlaneGeometry[] = [];
  const zoneSideMaterial = keep(new MeshStandardMaterial({ map: layers, roughness: 1 }));

  // Rain and the mud it carries, running down the valleys to the south.
  const mud = new InstancedMesh(
    keep(new SphereGeometry(0.7, 6, 4)),
    keep(new MeshBasicMaterial({ color: MUD })),
    VALLEYS * MUD_PER_VALLEY,
  );
  past.add(mud);

  let shown = '';
  let heightAt: (x: number, z: number) => number = () => 0;
  const color = new Color();
  /** Raises the zone to `grown` (0 flat, 1 fully risen), carves and wears it, and cuts its sides. */
  const raise = (grown: number, carved: number, worn: number): void => {
    const key = `${grown.toFixed(3)}|${carved.toFixed(3)}|${worn.toFixed(3)}`;
    if (key === shown) return;
    shown = key;
    heightAt = (x, z) => up(ridgeKm(x, z, grown, carved, worn));
    for (let index = 0; index < zonePositions.count; index++) {
      const x = zoneFlat[index * 3] ?? 0;
      const z = zoneFlat[index * 3 + 2] ?? 0;
      const km = ridgeKm(x, z, grown, carved, worn);
      zonePositions.setY(index, up(km));
      // Green low hills, bare rock, snow on the tops; ice down the carved valleys.
      color
        .copy(HILLS)
        .lerp(ROCK, smooth(1, 2.5, km))
        .lerp(SNOW, smooth(5.2, 6.4, km));
      const shifted = x + PLATE_WIDE / 2 - VALLEY_EVERY / 2;
      color.lerp(ICE, carved * smooth(0.4, 0.8, inValley(shifted, z)) * smooth(2.5, 4, km));
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
      zoneSideMaterial,
    );
  };

  let time = 0;
  const place = new Matrix4();
  /** Moves the mud down the valleys, from the high ground to the southern edge. */
  const runMud = (): void => {
    for (let valley = 0; valley < VALLEYS; valley++) {
      for (let bit = 0; bit < MUD_PER_VALLEY; bit++) {
        const share = (bit / MUD_PER_VALLEY + time * 0.08 + valley * 0.37) % 1;
        const z = -6 + share * (ZONE / 2 + 6);
        const x = valleyX(valley, z);
        place.makeTranslation(x, heightAt(x, z) + 0.8, z);
        mud.setMatrixAt(valley * MUD_PER_VALLEY + bit, place);
      }
    }
    mud.instanceMatrix.needsUpdate = true;
  };

  // Today: the real range, from its measured heights, the arrows on it, and the bars beside it.
  const today = new Group();
  today.visible = false;
  scene.add(today);
  const land = keep(createLandBlock({ ...options.land, baseKm: -PLATE_THICK }));
  today.add(land.group);
  const arrowHead = 7;
  const rising = new Group();
  for (const x of [-options.land.widthKm / 4, 0, options.land.widthKm / 4]) {
    rising.add(
      new ArrowHelper(new Vector3(0, 1, 0), new Vector3(x, 32, 0), 22, ARROW, arrowHead, 5),
    );
  }
  today.add(rising);
  const pushing = new Group();
  pushing.add(
    new ArrowHelper(
      new Vector3(0, 0, -1),
      new Vector3(0, 6, options.land.depthKm / 2 + 50),
      42,
      ARROW,
      arrowHead * 1.4,
      9,
    ),
  );
  today.add(pushing);
  const bars = new Group();
  today.add(bars);
  const barMaterial = keep(new MeshStandardMaterial({ color: BAR, roughness: 0.6 }));
  const barX = options.land.widthKm / 2 + 18;
  const words: { readonly mesh: Mesh }[] = [];
  const barMeshes: { readonly bar: Mesh; readonly height: number }[] = [];
  const heights: readonly (readonly [number, string])[] = [
    [options.highestKm, options.highestLabel],
    [options.tallestKm, options.tallestLabel],
  ];
  for (const [index, [km, label]] of heights.entries()) {
    const height = landHeightKm(km * 1000, times);
    // Each bar stands on the ground and grows up from it.
    const bar = new Mesh(
      keep(new BoxGeometry(8, height, 8).translate(0, height / 2, 0)),
      barMaterial,
    );
    const x = barX + index * 16;
    bar.position.set(x, 0, 0);
    bars.add(bar);
    barMeshes.push({ bar, height });
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

  // Where the story is, each settling into place over a moment when it changes.
  const comingTo = settling();
  const grownTo = settling();
  const carvedTo = settling();
  const wornTo = settling();
  const todayTo = settling();
  const risingTo = settling();
  const pushingTo = settling();
  const barsTo = settling();
  const settlings = [comingTo, grownTo, carvedTo, wornTo, todayTo, risingTo, pushingTo, barsTo];

  /** Draws the moment the settling values have reached. */
  const show = (): void => {
    if (board.group.visible) return;
    const coming = comingTo.value;
    // The southern plate comes north until they meet; the sea between is squeezed out.
    india.position.set(0, -PLATE_THICK / 2, PLATE_LONG / 2 + ZONE / 2 + (1 - coming) * START_GAP);
    // Each piece fades by itself: the past as a whole gives way to today.
    const then = 1 - todayTo.value;
    past.visible = then > 0.002;
    today.visible = todayTo.value > 0.002;
    fadeGroup(asia, then);
    fadeGroup(india, then);
    fadeGroup(sea, then * (1 - smooth(0.9, 1, coming)));
    fadeGroup(crumpled, then * smooth(0.9, 1, coming));
    if (crumpled.visible) raise(grownTo.value, carvedTo.value, wornTo.value);
    fadeGroup(mud, then * smooth(0, 0.3, wornTo.value));
    if (mud.visible) runMud();
    fadeGroup(land.group, todayTo.value);
    fadeGroup(rising, risingTo.value);
    fadeGroup(pushing, pushingTo.value);
    // The bars grow up from the ground.
    fadeGroup(bars, barsTo.value);
    for (const { bar } of barMeshes) bar.scale.y = Math.max(0.001, barsTo.value);
    for (const [index, named] of words.entries()) {
      const height = barMeshes[index]?.height ?? 0;
      named.mesh.position.y = height * barsTo.value + 6;
    }
  };

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    realFromJd: options.todayFromJd,
    bounds: {
      min: { x: -PLATE_WIDE / 2, y: -PLATE_THICK, z: -PLATE_LONG / 2 - ZONE / 2 },
      max: {
        x: barX + 20,
        y: landHeightKm(options.tallestKm * 1000, times),
        z: PLATE_LONG / 2 + ZONE / 2,
      },
    },

    set(jd, picture) {
      board.set(picture);
      const first = Number.isNaN(todayTo.value);
      const years = options.yearsAt(jd);
      const isToday = jd >= options.todayFromJd;
      comingTo.aim(smooth(options.startYearsAgo, options.meetYearsAgo, years));
      grownTo.aim(smooth(options.meetYearsAgo, 0, years));
      carvedTo.aim(smooth(options.iceFromYearsAgo, options.wornFromYearsAgo, years));
      wornTo.aim(smooth(options.wornFromYearsAgo, 0, years));
      todayTo.aim(isToday ? 1 : 0);
      risingTo.aim(isToday && jd < options.pushingFromJd ? 1 : 0);
      pushingTo.aim(jd >= options.pushingFromJd && jd < options.realFromJd ? 1 : 0);
      barsTo.aim(jd >= options.barsFromJd ? 1 : 0);
      if (first) show();
    },

    flow(seconds) {
      time += seconds;
      let moved = false;
      for (const one of settlings) moved = one.step(seconds) || moved;
      if (moved || (seconds > 0 && mud.visible)) show();
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      if (board.group.visible) {
        past.visible = false;
        today.visible = false;
      } else if (!Number.isNaN(todayTo.value)) {
        show();
      }
    },

    dispose() {
      for (const side of zoneSideGeometries) side.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
