import {
  AmbientLight,
  BufferAttribute,
  CanvasTexture,
  Color,
  ConeGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Group,
  InstancedMesh,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';
import { FIELD_OF_VIEW_DEG } from './stage';

/**
 * A 3D close-up of a rock-and-ice avalanche in a mountain valley, seen from above the far side
 * of the valley, looking north at the slope it came down:
 * 1. A glacier in a gully on the mountain, rock from the crumbling peak piling up on it, and
 *    the ice sliding faster as the day it breaks comes near.
 * 2. Houses on the valley floor, and a river along it.
 * 3. Once the glacier breaks, rock and ice pour down and spread along the valley floor, as far
 *    along it as the real avalanche reached, and up the far wall as high as it really climbed.
 *    A lake backs up behind it where it blocks the river.
 * 4. With its button, the real picture from space of that moment in place of the drawing.
 *
 * One unit is one kilometre, the same way across and up. What is real: how far along the
 * valley the avalanche reached and how high it climbed the far side (`runoutKm`, `runUpKm`).
 * What is a drawing: the shape of the valley and the mountain, the houses, how the ice moves,
 * how fast the avalanche spreads on screen, and how high the lake rises.
 */
const BACKGROUND = '#0a1020';
const GRASS = new Color('#5f8f4a');
const ROCK = new Color('#7d7468');
const SNOW = new Color('#f2f5f8');
const ICE = 0xcfe6f5;
const DEBRIS = 0x8a7f72;
const WATER = 0x2f7fc1;
const HOUSE = 0xd9c7a6;
const ROOF = 0x8c3b2e;
const MARK = 0xffd23f;

/** The block of ground drawn, in km: x along the valley (the river runs to -x), z to the viewer (south). */
const WEST = -2.2;
const EAST = 2.2;
const NORTH = -2.6;
const SOUTH = 0.95;
/** The bottom of the block of ground, cut open at its sides like a model. */
const BASE = -0.3;
/** Where the close look stands, from the middle of the valley: east, a little south, and above. */
const SEEN_FROM = new Vector3(1, 0.85, 0.75).normalize();
const GRID_X = 132;
const GRID_Z = 120;
/** The valley floor is this wide, either side of its middle. */
const FLOOR_HALF = 0.35;
/** The glacier's gully runs down the north side at x = 0, between these distances north. */
const GLACIER_TOP = -2.3;
const GLACIER_FOOT = -1.0;
const GLACIER_HALF_WIDTH = 0.28;
/** The drawn avalanche is this thick at most, and the lake rises this high at most. */
const DEBRIS_THICK = 0.05;
const LAKE_DEEP = 0.025;
/** Rocks drawn on the glacier when it breaks; fewer before. */
const ROCKS = 90;
const HOUSES = 16;
/** How many seconds the drawn avalanche takes to spread, the first time it is shown. */
const POUR_SECONDS = 4;
const DAY = 1;

export interface AvalancheSliceOptions {
  /** How far along the valley the avalanche reached, and how high up the far side it climbed. */
  readonly runoutKm: number;
  readonly runUpKm: number;
  /** When the glacier broke, and since when rock had been piling up on it, as Julian dates. */
  readonly breaksJd: number;
  readonly pilingFromJd: number;
  /** Words for the marks of the two real lengths ("2.5 km", "240 m"). */
  readonly runoutLabel: string;
  readonly runUpLabel: string;
  /** The real pictures, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface AvalancheSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Draws the valley as it was at a date, with the real picture of that moment ready. */
  set(jd: number, picture: number | null): void;
  /** Moves the ice and spreads the avalanche. */
  flow(seconds: number): void;
  /** Swaps the drawing for the real picture, or back. */
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

const smooth = (from: number, to: number, value: number): number => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/** How high the drawn ground stands, in km above the valley floor where the avalanche lies. */
function groundKm(x: number, z: number): number {
  const floor = 0.02 * ((x - WEST) / (EAST - WEST));
  const north = smooth(-FLOOR_HALF, -2.3, z);
  const south = smooth(FLOOR_HALF * 0.8, 1.6, z);
  // Ridges and side gullies down the mountain, and bumps everywhere: a drawing.
  const ridges =
    0.09 * Math.sin(5.2 * x + 0.7) * north +
    0.05 * Math.sin(3.1 * x + 1.3) * Math.sin(2.3 * z) +
    0.025 * Math.sin(9 * x - 5 * z) +
    0.012 * Math.sin(17 * x + 11 * z);
  const gully = 0.16 * north * Math.exp(-((x / 0.38) ** 2));
  return floor + 1.9 * north ** 1.3 + 1.0 * south ** 1.2 + (north + south) * ridges - gully;
}

/** Grass low down, bare rock higher, snow on top: a drawing. */
function groundColor(height: number, steep: number): Color {
  if (height > 1.25) return SNOW.clone();
  const rocky = Math.min(1, Math.max(0, (height - 0.35) / 0.5 + steep * 0.6));
  return GRASS.clone().lerp(ROCK, rocky);
}

/** Bands across the ice, like the cracks in a glacier, to show it moving. */
function iceTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#e8f3fb';
    context.fillRect(0, 0, 64, 256);
    context.strokeStyle = '#8fb3cc';
    context.lineWidth = 3;
    for (let y = 8; y < 256; y += 32) {
      context.beginPath();
      context.moveTo(4, y + 6);
      context.quadraticCurveTo(32, y - 6, 60, y + 6);
      context.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A fixed scatter of points, the same every time. */
function scatter(count: number, seed: number): (readonly [number, number])[] {
  let state = seed;
  const next = (): number => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  return Array.from({ length: count }, () => [next(), next()] as const);
}

export function createAvalancheSlice(options: AvalancheSliceOptions): AvalancheSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  scene.add(new AmbientLight(0xffffff, 0.55));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(1.5, 3, 2.5);
  scene.add(sun);

  const diorama = new Group();
  scene.add(diorama);

  // The ground: a block of valley, coloured by height.
  const groundGeometry = keep(new PlaneGeometry(EAST - WEST, SOUTH - NORTH, GRID_X, GRID_Z));
  groundGeometry.rotateX(-Math.PI / 2);
  groundGeometry.translate((EAST + WEST) / 2, 0, (SOUTH + NORTH) / 2);
  const groundPositions = groundGeometry.getAttribute('position') as BufferAttribute;
  const colors = new Float32Array(groundPositions.count * 3);
  for (let index = 0; index < groundPositions.count; index++) {
    const x = groundPositions.getX(index);
    const z = groundPositions.getZ(index);
    const height = groundKm(x, z);
    groundPositions.setY(index, height);
    const steep = Math.hypot(groundKm(x + 0.02, z) - height, groundKm(x, z + 0.02) - height) / 0.02;
    const color = groundColor(height, Math.min(1, steep / 1.5));
    colors.set([color.r, color.g, color.b], index * 3);
  }
  groundGeometry.setAttribute('color', new BufferAttribute(colors, 3));
  groundGeometry.computeVertexNormals();
  diorama.add(
    new Mesh(
      groundGeometry,
      keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: false })),
    ),
  );

  // The sides of the block, cut open down to its base like a model.
  const sideMaterial = keep(new MeshStandardMaterial({ color: 0x4a3d33, roughness: 1 }));
  const edges: readonly (readonly [number, number, number, number])[] = [
    [WEST, SOUTH, EAST, SOUTH],
    [EAST, SOUTH, EAST, NORTH],
    [EAST, NORTH, WEST, NORTH],
    [WEST, NORTH, WEST, SOUTH],
  ];
  for (const [x0, z0, x1, z1] of edges) {
    const side = keep(new PlaneGeometry(1, 1, 120, 1));
    const sidePositions = side.getAttribute('position') as BufferAttribute;
    for (let index = 0; index < sidePositions.count; index++) {
      const share = sidePositions.getX(index) + 0.5;
      const top = sidePositions.getY(index) > 0;
      const x = x0 + (x1 - x0) * share;
      const z = z0 + (z1 - z0) * share;
      sidePositions.setXYZ(index, x, top ? groundKm(x, z) : BASE, z);
    }
    side.computeVertexNormals();
    diorama.add(new Mesh(side, sideMaterial));
  }

  // The river along the valley floor.
  const riverZ = 0.12;
  const riverGeometry = keep(new PlaneGeometry(EAST - WEST, 0.05, 88, 1));
  riverGeometry.rotateX(-Math.PI / 2);
  const riverPositions = riverGeometry.getAttribute('position') as BufferAttribute;
  for (let index = 0; index < riverPositions.count; index++) {
    const x = riverPositions.getX(index);
    riverPositions.setXYZ(
      index,
      x,
      groundKm(x, riverZ) + 0.004,
      riverZ + riverPositions.getZ(index),
    );
  }
  const waterMaterial = keep(
    new MeshStandardMaterial({ color: WATER, roughness: 0.2, metalness: 0.1 }),
  );
  diorama.add(new Mesh(riverGeometry, waterMaterial));

  // The glacier, a tongue of ice in the gully, its bands moving as it slides.
  const ice = keep(iceTexture());
  ice.repeat.set(1, 4);
  const glacierGeometry = keep(
    new PlaneGeometry(2 * GLACIER_HALF_WIDTH, GLACIER_FOOT - GLACIER_TOP, 24, 60),
  );
  glacierGeometry.rotateX(-Math.PI / 2);
  glacierGeometry.translate(0, 0, (GLACIER_TOP + GLACIER_FOOT) / 2);
  const glacierPositions = glacierGeometry.getAttribute('position') as BufferAttribute;
  const glacierFlat = Float32Array.from(glacierPositions.array);
  const glacier = new Mesh(
    glacierGeometry,
    keep(new MeshStandardMaterial({ color: ICE, map: ice, roughness: 0.35 })),
  );
  diorama.add(glacier);
  /** Lays the ice over the gully, from its top down to `foot`, thickest in its middle. */
  const shapeGlacier = (foot: number): void => {
    for (let index = 0; index < glacierPositions.count; index++) {
      const x = glacierFlat[index * 3] ?? 0;
      const share =
        ((glacierFlat[index * 3 + 2] ?? 0) - GLACIER_TOP) / (GLACIER_FOOT - GLACIER_TOP);
      const z = GLACIER_TOP + share * (foot - GLACIER_TOP);
      const across = 1 - (x / GLACIER_HALF_WIDTH) ** 2;
      // Narrower towards its foot, as a glacier's tongue is.
      const narrow = x * (1 - 0.45 * share);
      glacierPositions.setXYZ(index, narrow, groundKm(narrow, z) + 0.035 * across, z);
    }
    glacierPositions.needsUpdate = true;
    glacierGeometry.computeVertexNormals();
  };
  shapeGlacier(GLACIER_FOOT);

  // Rock fallen from the peak onto the ice.
  const rocks = new InstancedMesh(
    keep(new DodecahedronGeometry(0.022, 0)),
    keep(new MeshStandardMaterial({ color: 0x5b5148, roughness: 1, flatShading: true })),
    ROCKS,
  );
  const placing = new Matrix4();
  for (const [index, [u, v]] of scatter(ROCKS, 7).entries()) {
    const z = GLACIER_TOP + 0.1 + v * 0.8;
    const x = (u - 0.5) * 1.4 * GLACIER_HALF_WIDTH;
    placing.makeRotationY(u * 9).setPosition(x, groundKm(x, z) + 0.04, z);
    placing.scale(new Vector3(1 + v, 0.8 + u, 1 + u));
    rocks.setMatrixAt(index, placing);
  }
  diorama.add(rocks);

  // The houses of the village, below the glacier's gully.
  const houseSpots = scatter(HOUSES, 11).map(([u, v]) => {
    const x = -0.45 + u * 0.9;
    const z = -0.3 + v * 0.3;
    return [x, z] as const;
  });
  const walls = new InstancedMesh(
    keep(new BoxGeometry(0.05, 0.035, 0.04)),
    keep(new MeshStandardMaterial({ color: HOUSE, roughness: 0.8 })),
    HOUSES,
  );
  const roofs = new InstancedMesh(
    keep(new ConeGeometry(0.04, 0.03, 4)),
    keep(new MeshStandardMaterial({ color: ROOF, roughness: 0.8 })),
    HOUSES,
  );
  for (const [index, [x, z]] of houseSpots.entries()) {
    const y = groundKm(x, z);
    walls.setMatrixAt(index, new Matrix4().makeTranslation(x, y + 0.0175, z));
    roofs.setMatrixAt(
      index,
      new Matrix4().makeRotationY(Math.PI / 4).setPosition(x, y + 0.035 + 0.015, z),
    );
  }
  diorama.add(walls, roofs);

  // Where the avalanche lies once it has come down: along the floor as far as it really
  // reached, up the far side as high as it really climbed, and down the gully from the ice.
  const reachX = options.runoutKm / 2;
  const floorAt = (x: number): number => groundKm(x, 0);
  /** How thick the drawn avalanche lies at a point, once it has all come down; 0 where none. */
  const debrisKm = (x: number, z: number): number => {
    const along = 1 - (x / reachX) ** 2;
    if (along <= 0) return 0;
    const height = groundKm(x, z) - floorAt(x);
    // Lumps of rock and ice: a drawing.
    const lumps = 0.75 + 0.25 * Math.sin(41 * x + 7 * z) * Math.sin(37 * z - 5 * x);
    const ends = smooth(0, 0.25, along);
    if (z > -FLOOR_HALF) {
      // Up the far side only as high as the real run-up, thinning to nothing at that height.
      const climb = options.runUpKm * Math.sqrt(along);
      const below = z > 0 ? smooth(climb, climb * 0.6, height) : 1;
      return DEBRIS_THICK * ends * below * lumps;
    }
    // The path down from the ice: a channel in the gully.
    const channel =
      smooth(0.34, 0.12, Math.abs(x)) * smooth(GLACIER_TOP + 0.3, GLACIER_TOP + 0.6, z);
    return DEBRIS_THICK * 0.6 * channel * lumps;
  };
  /** How far from where the ice broke a point is, along the way the avalanche came. */
  const fromSource = (x: number, z: number): number =>
    z < -FLOOR_HALF ? z - GLACIER_FOOT : -FLOOR_HALF - GLACIER_FOOT + Math.hypot(x, z + FLOOR_HALF);
  const farthest = -FLOOR_HALF - GLACIER_FOOT + Math.hypot(reachX, SOUTH);
  const debrisGeometry = keep(groundGeometry.clone());
  debrisGeometry.deleteAttribute('color');
  const debrisPositions = debrisGeometry.getAttribute('position') as BufferAttribute;
  const debrisFull = Float32Array.from({ length: debrisPositions.count }, (_, index) =>
    debrisKm(debrisPositions.getX(index), debrisPositions.getZ(index)),
  );
  const debris = new Mesh(
    debrisGeometry,
    keep(new MeshStandardMaterial({ color: DEBRIS, roughness: 1 })),
  );
  diorama.add(debris);
  /** Lays the avalanche as far as it has spread: `share` of the way from the ice, 0 to 1. */
  const spread = (share: number): void => {
    const reach = share * farthest;
    for (let index = 0; index < debrisPositions.count; index++) {
      const x = debrisPositions.getX(index);
      const z = debrisPositions.getZ(index);
      const front = smooth(reach, reach - 0.15, fromSource(x, z));
      const thick = (debrisFull[index] ?? 0) * front;
      // Where none lies, the surface is tucked just under the ground, out of sight.
      debrisPositions.setY(index, groundKm(x, z) + (thick > 0.002 ? thick : -0.01));
    }
    debrisPositions.needsUpdate = true;
    debrisGeometry.computeVertexNormals();
    // A house the avalanche has reached is under it.
    for (const [index, [x, z]] of houseSpots.entries()) {
      const under = debrisKm(x, z) > 0 && fromSource(x, z) <= reach;
      const y = groundKm(x, z) - (under ? 1 : 0);
      walls.setMatrixAt(index, new Matrix4().makeTranslation(x, y + 0.0175, z));
      roofs.setMatrixAt(
        index,
        new Matrix4().makeRotationY(Math.PI / 4).setPosition(x, y + 0.05, z),
      );
    }
    walls.instanceMatrix.needsUpdate = true;
    roofs.instanceMatrix.needsUpdate = true;
  };

  // The lake behind the avalanche, upstream (+x), where it blocks the river: water up to a
  // level wherever the ground lies lower, so it finds its own shore.
  const lakeGeometry = keep(new PlaneGeometry(EAST - reachX * 0.8, 1.4, 80, 40));
  lakeGeometry.rotateX(-Math.PI / 2);
  lakeGeometry.translate((EAST + reachX * 0.8) / 2, 0, 0);
  const lakePositions = lakeGeometry.getAttribute('position') as BufferAttribute;
  const lake = new Mesh(lakeGeometry, waterMaterial);
  diorama.add(lake);
  /** Fills the lake to `level` km, tucking it under the ground wherever the ground is higher. */
  const fillLake = (level: number): void => {
    for (let index = 0; index < lakePositions.count; index++) {
      const x = lakePositions.getX(index);
      const z = lakePositions.getZ(index);
      const ground = groundKm(x, z);
      lakePositions.setY(index, ground < level ? level : ground - 0.01);
    }
    lakePositions.needsUpdate = true;
    lakeGeometry.computeVertexNormals();
  };

  // Marks of the two real lengths: along the front of the avalanche, and up the far side.
  const markMaterial = keep(new LineBasicMaterial({ color: MARK }));
  const marks = new Group();
  const markZ = SOUTH + 0.05;
  const along = keep(
    new BufferGeometry().setFromPoints([
      new Vector3(-reachX, floorAt(-reachX) + 0.12, markZ),
      new Vector3(reachX, floorAt(reachX) + 0.12, markZ),
    ]),
  );
  marks.add(new Line(along, markMaterial));
  const runoutWords = keep(createLabel(options.runoutLabel, 0.2, '#ffd23f'));
  runoutWords.mesh.position.set(-reachX * 0.45, floorAt(0) + 0.32, markZ + 0.15);
  runoutWords.mesh.lookAt(runoutWords.mesh.position.clone().addScaledVector(SEEN_FROM, 10));
  marks.add(runoutWords.mesh);
  // The run-up: a level line on the far side at the height the avalanche climbed.
  const upY = floorAt(0) + options.runUpKm;
  let upZ = 0;
  while (upZ < SOUTH && groundKm(0, upZ) < upY) upZ += 0.005;
  const climb = keep(
    new BufferGeometry().setFromPoints([
      new Vector3(-reachX * 0.8, upY + 0.01, upZ),
      new Vector3(reachX * 0.8, upY + 0.01, upZ),
    ]),
  );
  marks.add(new Line(climb, markMaterial));
  const runUpWords = keep(createLabel(options.runUpLabel, 0.18, '#ffd23f'));
  runUpWords.mesh.position.set(-reachX * 0.2, upY + 0.16, upZ + 0.05);
  runUpWords.mesh.lookAt(runUpWords.mesh.position.clone().addScaledVector(SEEN_FROM, 10));
  marks.add(runUpWords.mesh);
  diorama.add(marks);

  // The real picture from space, in place of the drawing, with the button.
  const board = createPictureBoard(options.pictures);
  keep(board);
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0.15, y: 0.3, z: -0.45 };
  const direction = SEEN_FROM;
  const distance = 5.4;
  const eye = new Vector3(target.x, target.y, target.z).addScaledVector(direction, distance);
  // The board faces the eye and fills most of the view.
  board.group.position.set(target.x, target.y, target.z);
  board.group.lookAt(eye);
  board.group.scale.setScalar(
    (0.85 * 2 * distance * Math.tan((FIELD_OF_VIEW_DEG * Math.PI) / 360)) / board.height,
  );

  let broken: boolean | null = null;
  /** How far the avalanche has spread on screen, 0 to 1, and whether it is still spreading. */
  let poured = 0;
  let pouring = false;
  let slide = 0;
  let lakeLevel = -1;
  /** How fast the ice is drawn sliding: faster as the day it breaks comes near. A drawing. */
  let slideSpeed = 0.02;

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },

    set(jd, picture) {
      board.set(picture);
      const before = options.breaksJd - jd;
      const nowBroken = before <= 0;
      // Rock piles up on the ice from when the peak began to crumble until the ice broke.
      const piled = smooth(options.pilingFromJd - 2 * DAY, options.breaksJd, jd);
      rocks.count = nowBroken ? 0 : Math.round(ROCKS * (0.1 + 0.9 * piled));
      slideSpeed = nowBroken ? 0 : 0.02 + 0.5 * (1 - smooth(0, 12 * DAY, before));
      if (nowBroken !== broken) {
        // Shown broken after being whole, it pours down; shown whole again, it is undone.
        pouring = nowBroken && broken === false;
        poured = nowBroken && !pouring ? 1 : 0;
        broken = nowBroken;
        shapeGlacier(broken ? GLACIER_TOP + 0.45 : GLACIER_FOOT);
        spread(poured);
        marks.visible = broken && !pouring;
      }
      // The lake fills over the days after; how high is a drawing.
      const filled = nowBroken ? smooth(0, 10 * DAY, -before) : 0;
      lake.visible = filled > 0;
      const level = floorAt(reachX) + LAKE_DEEP * filled;
      if (Math.abs(level - lakeLevel) > 1e-4) {
        lakeLevel = level;
        fillLake(level);
      }
    },

    flow(seconds) {
      slide += seconds * slideSpeed;
      ice.offset.y = slide;
      if (pouring) {
        // With no motion asked for, it is all there at once.
        poured = seconds === 0 ? 1 : Math.min(1, poured + seconds / POUR_SECONDS);
        spread(poured);
        if (poured >= 1) {
          pouring = false;
          marks.visible = true;
        }
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
