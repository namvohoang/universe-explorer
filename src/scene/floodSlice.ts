import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { Bounds } from './flight';
import type { Vec3 } from '../sim/vec3';
import { floodPlainM, floodStageM, type FloodStage } from './floodStage';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';
import { addBlockSides, placeBoard, scatter, smooth } from './diorama';

/**
 * A 3D close-up of a river in flood, cut open like a model, seen from above one bank:
 * 1. The river in its channel between two built banks, fields and a village on the land
 *    behind them, and a measuring post on the near bank marked in metres.
 * 2. While it rains, dark clouds and falling rain over it all.
 * 3. The river rising up the post to its highest mark, over the top of the banks, and out
 *    across the fields and round the houses; then falling back, the land draining more slowly.
 * 4. With its button, the real picture from space of that moment in place of the drawing.
 *
 * What is real: the highest the water stood on the post, and when (`stage.peakM`,
 * `stage.peakJd`), and when the rain fell. What is a drawing: the shape of the river and the
 * land, where the water starts and how it rises and falls between, how high the banks are,
 * and the depth, drawn far taller next to the width than it is: the screen says so.
 */
const BACKGROUND = '#0a1020';
const FIELD_GREENS = ['#6fa04a', '#86b04f', '#5d8a3f', '#a7b35a'].map((hex) => new Color(hex));
const MUD = new Color('#8a7457');
const BANK = new Color('#9c8a62');
const WATER = 0x3b7fb8;
const FLOOD = 0x6b8a8c;
const HOUSE = 0xe0d0b0;
const ROOF = 0x9a4a32;
const TREE = 0x3e6b34;
const CLOUD = 0x5d6672;
const RAIN = 0xb8d4f0;
const PEAK_MARK = 0xff5a4a;

/** The block of land, in drawing units: x along the river, z across it (+z towards the eye). */
const HALF_X = 4;
const HALF_Z = 3;
const BASE = -0.45;
const GRID_X = 100;
const GRID_Z = 120;
/** Drawing units per metre up the post: the depth drawn far taller than the land is wide. */
const UNITS_PER_M = 0.07;
/** The drawn land, in metres up the post: the river bed, the top of the banks, the fields. */
const BED_M = 0;
const BANK_TOP_M = 10;
const FIELD_M = 9;
/** Across the river: the channel's half-width, the inner and outer foot of each bank. */
const CHANNEL = 0.55;
const BANK_INNER = 0.95;
const BANK_CREST = 1.15;
const BANK_OUTER = 1.45;
/** The post stands on the near bank's inner slope; its marks every two metres. */
const POST_X = -1.6;
const POST_Z = 0.82;
const POST_TOP_M = 14;
const RAIN_DROPS = 900;
const RAIN_TOP = 2.2;
const HOUSES = 14;
const TREES = 40;
/** The drawn water before the rain, and how many days it takes to fall after its highest. */
const LOW_M = 2.5;
const FALL_DAYS = 6;

export interface FloodSliceOptions {
  /** The highest the water stood on the post, and when, and when the rain fell. */
  readonly peakM: number;
  readonly peakJd: number;
  readonly rainFromJd: number;
  readonly rainUntilJd: number;
  /** Words for the highest mark ("11.94 m"). */
  readonly peakLabel: string;
  /** The real pictures, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface FloodSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  /** Draws the river as it was at a date, with the real picture of that moment ready. */
  set(jd: number, picture: number | null): void;
  /** Moves the water and the rain. */
  flow(seconds: number): void;
  /** Swaps the drawing for the real picture, or back. */
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/** How high the drawn land stands across the river, in metres up the post. */
function landM(x: number, z: number): number {
  const across = Math.abs(z);
  const bumps = 0.15 * Math.sin(1.7 * x + 0.4) * Math.sin(2.1 * z);
  if (across < CHANNEL) return BED_M + 0.6 * (across / CHANNEL) ** 2;
  if (across < BANK_INNER)
    return BED_M + 0.6 + (FIELD_M - 0.6) * smooth(CHANNEL, BANK_INNER, across);
  if (across < BANK_CREST)
    return FIELD_M + (BANK_TOP_M - FIELD_M) * smooth(BANK_INNER, BANK_CREST, across);
  if (across < BANK_OUTER)
    return BANK_TOP_M - (BANK_TOP_M - FIELD_M) * smooth(BANK_CREST, BANK_OUTER, across);
  return FIELD_M + bumps * smooth(BANK_OUTER, BANK_OUTER + 0.3, across);
}

/** Fields in a patchwork behind the banks, mud in the channel, bare earth on the banks. */
function landColor(x: number, z: number): Color {
  const across = Math.abs(z);
  if (across < BANK_INNER) return MUD.clone();
  if (across < BANK_OUTER) return BANK.clone();
  const patch = Math.abs(Math.floor(x * 1.6) * 7 + Math.floor(z * 1.6) * 3) % FIELD_GREENS.length;
  return (FIELD_GREENS[patch] ?? MUD).clone();
}

/** Ripples on the river, scrolled along it to show it flowing. */
function rippleTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 128, 128);
    context.strokeStyle = '#c9dceb';
    context.lineWidth = 2;
    for (let row = 0; row < 8; row++) {
      context.beginPath();
      for (let x = 0; x <= 128; x += 8) {
        const y = row * 16 + 8 + 3 * Math.sin((x / 128) * 2 * Math.PI * 2 + row);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createFloodSlice(options: FloodSliceOptions): FloodSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  const stage: FloodStage = {
    peakM: options.peakM,
    peakJd: options.peakJd,
    rainFromJd: options.rainFromJd,
    lowM: LOW_M,
    fallDays: FALL_DAYS,
  };
  const up = (metres: number): number => metres * UNITS_PER_M;
  const landY = (x: number, z: number): number => up(landM(x, z));

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new DirectionalLight(0xffffff, 2);
  sun.position.set(2, 4, 3);
  scene.add(sun);

  const diorama = new Group();
  scene.add(diorama);

  // The land: channel, banks and fields.
  const landGeometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, GRID_X, GRID_Z));
  landGeometry.rotateX(-Math.PI / 2);
  const landPositions = landGeometry.getAttribute('position') as BufferAttribute;
  const colors = new Float32Array(landPositions.count * 3);
  for (let index = 0; index < landPositions.count; index++) {
    const x = landPositions.getX(index);
    const z = landPositions.getZ(index);
    landPositions.setY(index, landY(x, z));
    const color = landColor(x, z);
    colors.set([color.r, color.g, color.b], index * 3);
  }
  landGeometry.setAttribute('color', new BufferAttribute(colors, 3));
  landGeometry.computeVertexNormals();
  diorama.add(
    new Mesh(landGeometry, keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }))),
  );

  // The sides of the block, cut open down to its base like a model.
  const sideMaterial = keep(new MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }));
  for (const side of addBlockSides(
    diorama,
    landY,
    { west: -HALF_X, east: HALF_X, north: -HALF_Z, south: HALF_Z },
    BASE,
    sideMaterial,
  ))
    keep(side);

  // The houses of a village and some trees, on the far side behind the bank.
  const houseSpots = scatter(HOUSES, 5).map(([u, v]) => [-1.2 + u * 2.4, -2.0 - v * 0.8] as const);
  const walls = new InstancedMesh(
    keep(new BoxGeometry(0.16, 0.1, 0.13)),
    keep(new MeshStandardMaterial({ color: HOUSE, roughness: 0.8 })),
    HOUSES,
  );
  const roofs = new InstancedMesh(
    keep(new ConeGeometry(0.13, 0.08, 4)),
    keep(new MeshStandardMaterial({ color: ROOF, roughness: 0.8 })),
    HOUSES,
  );
  for (const [index, [x, z]] of houseSpots.entries()) {
    const y = landY(x, z);
    walls.setMatrixAt(index, new Matrix4().makeTranslation(x, y + 0.05, z));
    roofs.setMatrixAt(index, new Matrix4().makeRotationY(Math.PI / 4).setPosition(x, y + 0.14, z));
  }
  const trees = new InstancedMesh(
    keep(new ConeGeometry(0.07, 0.22, 7)),
    keep(new MeshStandardMaterial({ color: TREE, roughness: 0.9 })),
    TREES,
  );
  for (const [index, [u, v]] of scatter(TREES, 9).entries()) {
    const x = -HALF_X + 0.2 + u * (2 * HALF_X - 0.4);
    const far = v < 0.5;
    const z = far ? -BANK_OUTER - 0.15 - v * 2.4 : BANK_OUTER + 0.15 + (v - 0.5) * 2.4;
    trees.setMatrixAt(index, new Matrix4().makeTranslation(x, landY(x, z) + 0.11, z));
  }
  diorama.add(walls, roofs, trees);

  // The water: the river between its banks, and the flood on the land behind them. Each is a
  // surface at a level wherever the land lies lower, tucked under it elsewhere.
  const ripples = keep(rippleTexture());
  ripples.repeat.set(4, 3);
  const waterSurface = (
    inside: (z: number) => boolean,
    material: MeshStandardMaterial,
  ): { readonly fill: (levelM: number) => void } => {
    const geometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, GRID_X, GRID_Z));
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.getAttribute('position') as BufferAttribute;
    const mesh = new Mesh(geometry, material);
    diorama.add(mesh);
    let shown = Number.NaN;
    return {
      fill(levelM) {
        if (Math.abs(levelM - shown) < 1e-3) return;
        shown = levelM;
        const level = up(levelM);
        for (let index = 0; index < positions.count; index++) {
          const x = positions.getX(index);
          const z = positions.getZ(index);
          const land = landY(x, z);
          positions.setY(index, inside(z) && land < level ? level : land - 0.02);
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      },
    };
  };
  const river = waterSurface(
    (z) => Math.abs(z) < BANK_CREST,
    keep(
      new MeshStandardMaterial({
        color: WATER,
        map: ripples,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92,
      }),
    ),
  );
  const plain = waterSurface(
    (z) => Math.abs(z) >= BANK_CREST,
    keep(
      new MeshStandardMaterial({
        color: FLOOD,
        map: ripples,
        roughness: 0.4,
        transparent: true,
        opacity: 0.88,
      }),
    ),
  );

  // The measuring post, marked every two metres, with the highest mark in red.
  const post = new Group();
  post.position.set(POST_X, 0, POST_Z);
  const pole = new Mesh(
    keep(new CylinderGeometry(0.06, 0.06, up(POST_TOP_M), 12)),
    keep(new MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 })),
  );
  pole.position.y = up(POST_TOP_M) / 2;
  post.add(pole);
  const tick = keep(new BoxGeometry(0.18, 0.02, 0.02));
  const tickMaterial = keep(new MeshBasicMaterial({ color: 0x20262e }));
  for (let metres = 2; metres <= POST_TOP_M; metres += 2) {
    const mark = new Mesh(tick, tickMaterial);
    mark.position.y = up(metres);
    post.add(mark);
  }
  const peak = new Mesh(
    keep(new BoxGeometry(0.3, 0.035, 0.035)),
    keep(new MeshBasicMaterial({ color: PEAK_MARK })),
  );
  peak.position.y = up(options.peakM);
  post.add(peak);
  const peakWords = keep(createLabel(options.peakLabel, 0.26, '#ff8a7a'));
  peakWords.mesh.position.set(0.55, up(options.peakM) + 0.02, 0);
  post.add(peakWords.mesh);
  diorama.add(post);

  // Storm clouds and rain, while it rains.
  const weather = new Group();
  const cloudMaterial = keep(
    new MeshStandardMaterial({ color: CLOUD, roughness: 1, transparent: true, opacity: 0.92 }),
  );
  const puff = keep(new SphereGeometry(1, 16, 12));
  for (const [u, v] of scatter(9, 3)) {
    const cloud = new Mesh(puff, cloudMaterial);
    cloud.position.set(
      -HALF_X + u * 2 * HALF_X,
      RAIN_TOP + 0.15 + v * 0.2,
      -HALF_Z + v * HALF_Z * 1.2,
    );
    cloud.scale.set(0.6 + u * 0.4, 0.14, 0.5 + v * 0.3);
    weather.add(cloud);
  }
  const rainPositions = new Float32Array(RAIN_DROPS * 6);
  const drops = scatter(RAIN_DROPS, 13);
  const rainGeometry = keep(new BufferGeometry());
  rainGeometry.setAttribute('position', new BufferAttribute(rainPositions, 3));
  weather.add(
    new LineSegments(
      rainGeometry,
      keep(new LineBasicMaterial({ color: RAIN, transparent: true, opacity: 0.55 })),
    ),
  );
  diorama.add(weather);
  let rainTime = 0;
  /** Puts each drop where it has fallen to, starting again at the top once it lands. */
  const fallRain = (): void => {
    for (const [index, [u, v]] of drops.entries()) {
      const x = -HALF_X + u * 2 * HALF_X;
      const z = -HALF_Z + v * 2 * HALF_Z;
      const fallen = (u * 7.3 + v * 3.1 + rainTime * 1.6) % 1;
      const y = RAIN_TOP - fallen * (RAIN_TOP - up(FIELD_M));
      rainPositions.set([x, y, z, x - 0.02, y - 0.14, z], index * 6);
    }
    (rainGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
  };
  fallRain();

  // The real picture from space, in place of the drawing, with the button.
  const board = createPictureBoard(options.pictures);
  keep(board);
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: -0.6, y: 0.55, z: 0.2 };
  const direction = new Vector3(0.55, 0.75, 1).normalize();
  const distance = 7;
  // The words on the post turn to face the eye.
  peakWords.mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction);
  placeBoard(board, target, direction, distance);

  let flowing = 0;
  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    bounds: { min: { x: -HALF_X, y: BASE, z: -HALF_Z }, max: { x: HALF_X, y: 0.8, z: HALF_Z } },

    set(jd, picture) {
      board.set(picture);
      river.fill(floodStageM(stage, jd));
      plain.fill(floodPlainM(stage, BANK_TOP_M, FIELD_M - 0.5, jd));
      const raining = jd >= options.rainFromJd && jd < options.rainUntilJd;
      weather.visible = raining;
      sun.intensity = raining ? 0.8 : 2;
      ambient.intensity = raining ? 0.45 : 0.6;
    },

    flow(seconds) {
      flowing += seconds;
      ripples.offset.x = -flowing * 0.05;
      if (weather.visible && seconds > 0) {
        rainTime += seconds;
        fallRain();
      }
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      diorama.visible = !board.group.visible;
    },

    dispose() {
      for (const item of disposables) item.dispose();
    },
  };
}
