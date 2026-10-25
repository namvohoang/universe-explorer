import {
  AmbientLight,
  BufferAttribute,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
} from 'three';
import { landHeightKm } from '../sim/scale';
import { addBlockSides, placeBoard, smooth, type UpCloseSlice } from './diorama';
import { createLandBlock, type LandBlockOptions } from './landBlock';
import { createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of how a canyon is made, over hundreds of millions of years, ending on the real
 * canyon. One unit is one kilometre across; heights are drawn as many times as tall as the real
 * land's (`drawnTimes`).
 * 1. Layer after layer of rock building up under a shallow sea, each its own colour.
 * 2. The land lifted up, the sea draining away.
 * 3. A river winding across the top, cutting down through the layers, its walls widening as it
 *    goes deeper, so that the coloured layers show in its sides.
 * 4. Today: the drawing gives way to the real canyon, from its measured heights with a picture
 *    from space laid over it.
 * 5. With its button, the real picture from space in place of the drawing.
 *
 * What is real: the land of today. What is a drawing: everything before, and how deep and how
 * wide the drawn canyon is cut at each moment; the years are the sources'.
 */
const BACKGROUND = '#0a1020';
const SEA = 0x2f86c9;
const LAYERS = [
  '#b4562e',
  '#d9a066',
  '#8c5a3c',
  '#e8c48a',
  '#a0522d',
  '#c97b4a',
  '#7a4a32',
  '#e0b070',
].map((hex) => new Color(hex));
/** The drawn block: its width and depth in km, the layers' total thickness, how high lifted. */
const WIDE = 36;
const DEEP = 44;
const STACK_KM = 2;
const LIFT_KM = 1.2;
const GRID_X = 150;
const GRID_Z = 180;
/** The drawn canyon at its deepest and widest, in km, before heights are stretched. */
const CUT_KM = 1.8;
const CUT_WIDE = 7;

export interface CanyonSliceOptions {
  /** How many years ago it is at a moment of the story. */
  readonly yearsAt: (jd: number) => number;
  /** When the layers start and finish building, the land is lifted, and the river cuts, in years ago. */
  readonly layersFromYearsAgo: number;
  readonly liftFromYearsAgo: number;
  readonly cutFromYearsAgo: number;
  /** From when the real canyon of today is shown, as a Julian date. */
  readonly todayFromJd: number;
  readonly land: Omit<LandBlockOptions, 'baseKm'>;
  /** The real picture, for the button. */
  readonly pictures: PictureBoardOptions;
}

/** Where the drawn river runs across the block, as how far north or south at `x`. */
const riverZ = (x: number): number => 4 * Math.sin(x / 5) + 1.5 * Math.sin(x / 2.1);

export function createCanyonSlice(options: CanyonSliceOptions): UpCloseSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  const times = options.land.drawnTimes;
  const up = (km: number): number => landHeightKm(km * 1000, times);

  scene.add(new AmbientLight(0xffffff, 0.6));
  const sun = new DirectionalLight(0xfff2dc, 2.2);
  sun.position.set(30, 60, 40);
  scene.add(sun);

  // The past: a block of layered rock, its top cut by the river.
  const past = new Group();
  scene.add(past);
  const topGeometry = keep(new PlaneGeometry(WIDE, DEEP, GRID_X, GRID_Z));
  topGeometry.rotateX(-Math.PI / 2);
  const topPositions = topGeometry.getAttribute('position') as BufferAttribute;
  const topColors = new BufferAttribute(new Float32Array(topPositions.count * 3), 3);
  topGeometry.setAttribute('color', topColors);
  past.add(
    new Mesh(topGeometry, keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }))),
  );
  const sideMaterial = keep(new MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  let sides: PlaneGeometry[] = [];
  const sea = new Mesh(
    keep(new PlaneGeometry(WIDE, DEEP)),
    keep(new MeshStandardMaterial({ color: SEA, roughness: 0.3, transparent: true, opacity: 0.8 })),
  );
  sea.rotation.x = -Math.PI / 2;
  past.add(sea);
  const river = new Mesh(
    keep(new PlaneGeometry(WIDE, DEEP, GRID_X, GRID_Z)),
    keep(new MeshStandardMaterial({ color: 0x3a7ab8, roughness: 0.3 })),
  );
  river.geometry.rotateX(-Math.PI / 2);
  past.add(river);

  /** The colour of the layer a height lies in, the layers counted from the block's bottom. */
  const layerColor = (km: number, bottomKm: number): Color => {
    const band = Math.floor(((km - bottomKm) / STACK_KM) * LAYERS.length);
    return (
      LAYERS[Math.min(LAYERS.length - 1, Math.max(0, band))] ??
      LAYERS[0] ??
      new Color()
    ).clone();
  };

  let shown = '';
  /** Draws the block: `built` of its layers laid, lifted by `lifted`, the canyon cut `cut` deep. */
  const draw = (built: number, lifted: number, cut: number): void => {
    const key = `${built.toFixed(3)}|${lifted.toFixed(3)}|${cut.toFixed(3)}`;
    if (key === shown) return;
    shown = key;
    const bottomKm = LIFT_KM * lifted;
    const topKm = bottomKm + STACK_KM * built;
    // The canyon: as deep as `cut`, and wider the deeper it goes, its walls in steps.
    const depthAt = (x: number, z: number): number => {
      const away = Math.abs(z - riverZ(x));
      const half = (CUT_WIDE / 2) * cut + 0.2;
      const share = smooth(half, 0.15, away);
      const steps = Math.round(share * 6) / 6;
      return CUT_KM * cut * (0.6 * share + 0.4 * steps);
    };
    const heightKm = (x: number, z: number): number => Math.max(bottomKm, topKm - depthAt(x, z));
    for (let index = 0; index < topPositions.count; index++) {
      const km = heightKm(topPositions.getX(index), topPositions.getZ(index));
      topPositions.setY(index, up(km));
      const color = layerColor(km - 0.001, bottomKm);
      topColors.setXYZ(index, color.r, color.g, color.b);
    }
    topPositions.needsUpdate = true;
    topColors.needsUpdate = true;
    topGeometry.computeVertexNormals();
    // The sides, banded by the layers.
    for (const side of sides) side.dispose();
    for (const child of [...past.children]) if (child.userData.side === true) past.remove(child);
    const before = past.children.length;
    sides = addBlockSides(
      past,
      (x, z) => up(heightKm(x, z)),
      { west: -WIDE / 2, east: WIDE / 2, north: -DEEP / 2, south: DEEP / 2 },
      up(bottomKm) - 0.6,
      sideMaterial,
    );
    for (const child of past.children.slice(before)) child.userData.side = true;
    for (const side of sides) {
      // Down each side in steps, so the bands of the layers show, not a blur between two edges.
      const rows = 24;
      const banded = new PlaneGeometry(1, 1, 120, rows);
      const old = side.getAttribute('position') as BufferAttribute;
      const positions = banded.getAttribute('position') as BufferAttribute;
      const colors = new Float32Array(positions.count * 3);
      for (let index = 0; index < positions.count; index++) {
        const column = index % 121;
        const share = positions.getY(index) + 0.5;
        const topY = old.getY(column);
        const bottomY = old.getY(121 + column);
        const y = bottomY + (topY - bottomY) * share;
        positions.setXYZ(index, old.getX(column), y, old.getZ(column));
        const color = layerColor(y / times, bottomKm);
        colors.set([color.r, color.g, color.b], index * 3);
      }
      side.setAttribute('position', positions);
      side.setIndex(banded.getIndex());
      side.setAttribute('color', new BufferAttribute(colors, 3));
      side.computeVertexNormals();
      banded.dispose();
    }
    // The sea over the layers while they are laid, gone once the land is lifted.
    sea.visible = lifted < 0.3;
    sea.position.y = up(topKm) + 0.15;
    // The river at the bottom of its canyon.
    const riverPositions = river.geometry.getAttribute('position') as BufferAttribute;
    for (let index = 0; index < riverPositions.count; index++) {
      const x = riverPositions.getX(index);
      const z = riverPositions.getZ(index);
      const inRiver = Math.abs(z - riverZ(x)) < 0.25 && cut > 0;
      riverPositions.setY(index, inRiver ? up(heightKm(x, z)) + 0.05 : up(bottomKm) - 0.3);
    }
    riverPositions.needsUpdate = true;
    river.visible = cut > 0;
  };

  // Today: the real canyon.
  const today = new Group();
  today.visible = false;
  scene.add(today);
  const land = keep(createLandBlock({ ...options.land, baseKm: 0 }));
  today.add(land.group);

  // The real picture from space, in place of the drawing, with the button.
  const board = keep(createPictureBoard(options.pictures));
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0, y: 4, z: 0 };
  const direction = new Vector3(0.45, 0.8, 1).normalize();
  const distance = 64;
  placeBoard(board, target, direction, distance);

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
      if (isToday) return;
      draw(
        0.08 + 0.92 * smooth(options.layersFromYearsAgo, options.liftFromYearsAgo, years),
        smooth(options.liftFromYearsAgo, options.cutFromYearsAgo, years),
        smooth(options.cutFromYearsAgo, 0, years),
      );
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
      for (const side of sides) side.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
