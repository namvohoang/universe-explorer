import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  InstancedMesh,
  CurvePath,
  LineCurve3,
  TubeGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Bounds } from './flight';
import type { Vec3 } from '../sim/vec3';
import { addBlockSides, placeBoard, scatter, smooth } from './diorama';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of lightning over a lake: a block of land and water cut open like a model,
 * mountains on two sides, and a thunderstorm cloud growing over the water through the
 * afternoon into the night.
 * 1. Inside the cloud, once the story looks there: small bits of ice carried up and soft hail
 *    falling, the ice gaining a plus charge at the top and the hail a minus one in the middle.
 * 2. Flashes, counted at the lake's real average rate as the story's clock runs, with the count
 *    beside the cloud. No more than two are drawn in a second, however fast the clock runs,
 *    since quick flashing can harm some people; the count goes on regardless. With no motion
 *    asked for, a flash stays lit until the next instead of flickering.
 * 3. The light of the day going as the evening comes, by the lake's own clock.
 * 4. With its button, the real picture from space of that moment in place of the drawing.
 *
 * What is real: how many flashes the lake has on an average day. What is a drawing: the land,
 * the cloud, where and how each flash is drawn, and that the flashes come evenly: real ones
 * come in bursts, and this average is over years, not that night.
 */
const BACKGROUND = '#070b16';
const LAND = new Color('#4f7d3e');
const ROCK = new Color('#6f6a60');
const WATER = 0x2c5f86;
const CLOUD = 0xd7dde4;
const ICE = 0xffffff;
const HAIL = 0x7c8794;
const BOLT = 0xf4f0ff;
const PLUS = '#ff8a7a';
const MINUS = '#8fc8ff';

/** The block, in drawing units: x east, z south (towards the eye). */
const HALF_X = 3.2;
const HALF_Z = 2.6;
const BASE = -0.35;
const GRID = 100;
/** The lake: an oval in the middle of the block. */
const LAKE_HALF_X = 1.5;
const LAKE_HALF_Z = 1.7;
/** The storm cloud: where its middle stands, how high its base and its top, how wide. */
const CLOUD_X = 0.2;
const CLOUD_Z = -0.2;
const CLOUD_BASE = 0.9;
const CLOUD_TOP = 3.2;
const CLOUD_WIDE = 1.0;
const PUFFS = 40;
/** How thick a drawn flash is. */
const BOLT_RADIUS = 0.018;
const ICE_BITS = 60;
const HAIL_BITS = 30;
/** How long a drawn flash lasts, in seconds, and the most drawn in any one second. */
const FLASH_SECONDS = 0.18;
const MOST_PER_SECOND = 2;
/** The lake's longitude east, for its own clock: the hour of day there from the hour in UTC. */
const LONGITUDE_EAST = -71.6;

export interface LightningSliceOptions {
  /** The lake's average flashes in a day, and from when they are counted. */
  readonly flashesPerDay: number;
  readonly countFromJd: number;
  /** When the story looks inside the cloud, and when the cloud has grown to its full height. */
  readonly insideFromJd: number;
  readonly grownJd: number;
  /** The words beside the count ("12 flashes"). */
  readonly countLabel: (flashes: number) => string;
  /** The real pictures, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface LightningSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  /** Draws the storm as it was at a date, with the real picture of that moment ready. */
  set(jd: number, picture: number | null): void;
  /** Moves the ice and the hail, and draws the flashes. */
  flow(seconds: number): void;
  /** Swaps the drawing for the real picture, or back. */
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/** How far into the lake a point is: below 1 inside it. */
const inLake = (x: number, z: number): number =>
  Math.hypot((x - 0.1 * Math.sin(2 * z)) / LAKE_HALF_X, z / LAKE_HALF_Z);

/** How high the drawn land stands; the lake floor below the water. */
function landHeight(x: number, z: number): number {
  const lake = inLake(x, z);
  if (lake < 1) return -0.06 * (1 - lake);
  const hills = 0.02 * Math.sin(3 * x) * Math.sin(2.5 * z);
  // Mountains to the west and to the south-east, as round the real lake: a drawing.
  const west = smooth(-1.9, -3.1, x) * (0.9 + 0.2 * Math.sin(5 * z));
  const south = smooth(1.3, 2.5, z - 0.4 * x) * (0.6 + 0.15 * Math.sin(6 * x));
  return 0.02 * smooth(1, 1.2, lake) + hills + west + south;
}

/** The colour of the land: green, rocky up high. */
const landColor = (height: number): Color => LAND.clone().lerp(ROCK, smooth(0.25, 0.7, height));

/** A jagged flash from a point under the cloud down to the ground, with a short fork. */
function boltPoints(from: Vector3, seed: number): Vector3[] {
  const [first] = scatter(1, seed);
  const toX = from.x + ((first?.[0] ?? 0.5) - 0.5) * 0.8;
  const toZ = from.z + ((first?.[1] ?? 0.5) - 0.5) * 0.6;
  const ground = Math.max(0, landHeight(toX, toZ));
  const steps = 12;
  return scatter(steps + 1, seed + 1).map(([u, v], index) => {
    const share = index / steps;
    const wobble = index === 0 || index === steps ? 0 : 0.12;
    return new Vector3(
      from.x + (toX - from.x) * share + (u - 0.5) * wobble,
      from.y + (ground - from.y) * share,
      from.z + (toZ - from.z) * share + (v - 0.5) * wobble,
    );
  });
}

export function createLightningSlice(options: LightningSliceOptions): LightningSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new DirectionalLight(0xfff0d8, 2);
  sun.position.set(2, 3, 2);
  scene.add(sun);

  const diorama = new Group();
  scene.add(diorama);

  // The land round the lake.
  const landGeometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, GRID, GRID));
  landGeometry.rotateX(-Math.PI / 2);
  const positions = landGeometry.getAttribute('position') as BufferAttribute;
  const colors = new Float32Array(positions.count * 3);
  for (let index = 0; index < positions.count; index++) {
    const height = landHeight(positions.getX(index), positions.getZ(index));
    positions.setY(index, height);
    const color = landColor(height);
    colors.set([color.r, color.g, color.b], index * 3);
  }
  landGeometry.setAttribute('color', new BufferAttribute(colors, 3));
  landGeometry.computeVertexNormals();
  diorama.add(
    new Mesh(landGeometry, keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }))),
  );
  for (const side of addBlockSides(
    diorama,
    (x, z) => Math.max(0, landHeight(x, z)),
    { west: -HALF_X, east: HALF_X, north: -HALF_Z, south: HALF_Z },
    BASE,
    keep(new MeshStandardMaterial({ color: 0x4a3d33, roughness: 1 })),
  )) {
    keep(side);
  }
  const lake = new Mesh(
    keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z)),
    keep(new MeshStandardMaterial({ color: WATER, roughness: 0.2, metalness: 0.2 })),
  );
  lake.rotation.x = -Math.PI / 2;
  diorama.add(lake);

  // The storm cloud: a tower of puffs, spreading into a flat top.
  const cloud = new Group();
  cloud.position.set(CLOUD_X, 0, CLOUD_Z);
  const cloudMaterial = keep(
    new MeshStandardMaterial({
      color: CLOUD,
      roughness: 1,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
  );
  const puff = keep(new SphereGeometry(1, 18, 14));
  for (const [index, [u, v]] of scatter(PUFFS, 51).entries()) {
    const share = index / PUFFS;
    const height = CLOUD_BASE + 0.2 + share * (CLOUD_TOP - CLOUD_BASE - 0.2);
    // Wide at the base, narrower up the tower, and spread out flat at the top.
    const spread = share > 0.85 ? 2.6 : 1 - 0.3 * share;
    const angle = u * 2 * Math.PI;
    const mesh = new Mesh(puff, cloudMaterial);
    mesh.position.set(
      Math.cos(angle) * v * 0.5 * spread * CLOUD_WIDE,
      height,
      Math.sin(angle) * v * 0.4 * spread * CLOUD_WIDE,
    );
    const size = (0.6 + 0.3 * u) * CLOUD_WIDE * (share > 0.85 ? 1.5 : 1);
    mesh.scale.set(size, share > 0.85 ? size * 0.35 : size * 0.8, size);
    cloud.add(mesh);
  }
  diorama.add(cloud);

  // Inside the cloud: ice carried up and soft hail falling, and their charges.
  const inside = new Group();
  const ice = new InstancedMesh(
    keep(new SphereGeometry(0.025, 6, 4)),
    keep(new MeshBasicMaterial({ color: ICE })),
    ICE_BITS,
  );
  const hail = new InstancedMesh(
    keep(new SphereGeometry(0.05, 8, 6)),
    keep(new MeshBasicMaterial({ color: HAIL })),
    HAIL_BITS,
  );
  const iceSpots = scatter(ICE_BITS, 61);
  const hailSpots = scatter(HAIL_BITS, 71);
  inside.add(ice, hail);
  const signs: { readonly mesh: Mesh }[] = [];
  for (const [x, y, text, color] of [
    [-0.6, CLOUD_TOP - 0.3, '+', PLUS],
    [0.1, CLOUD_TOP - 0.15, '+', PLUS],
    [0.7, CLOUD_TOP - 0.35, '+', PLUS],
    [-0.4, CLOUD_BASE + 0.8, '−', MINUS],
    [0.4, CLOUD_BASE + 0.7, '−', MINUS],
  ] as const) {
    const sign = keep(createLabel(text, 0.5, color));
    sign.mesh.position.set(x, y, 0.7);
    inside.add(sign.mesh);
    signs.push(sign);
  }
  cloud.add(inside);

  // The flashes: a few thin tubes ready to be drawn, and a light for them.
  const boltMaterial = keep(new MeshBasicMaterial({ color: BOLT }));
  const bolts = Array.from({ length: 3 }, () => {
    const line = new Mesh(new BufferGeometry(), boltMaterial);
    line.visible = false;
    diorama.add(line);
    return { line, left: 0 };
  });
  const flashLight = new PointLight(0xdfe8ff, 0, 6);
  flashLight.position.set(CLOUD_X, CLOUD_BASE, CLOUD_Z);
  diorama.add(flashLight);

  const target = { x: 0.4, y: 1.5, z: 0 };
  const direction = new Vector3(0.45, 0.45, 1).normalize();
  const distance = 7;
  /** Words turn to face the eye. */
  const facing = new Matrix4().lookAt(direction, new Vector3(), new Vector3(0, 1, 0));
  const faceEye = (mesh: Mesh): void => {
    mesh.quaternion.setFromRotationMatrix(facing);
  };
  for (const sign of signs) faceEye(sign.mesh);

  // The count of flashes, beside the cloud.
  const counter = new Group();
  counter.position.set(CLOUD_X + 1.9, CLOUD_TOP - 0.4, CLOUD_Z);
  diorama.add(counter);
  let countWords: { readonly mesh: Mesh; dispose(): void } | null = null;
  let counted = -1;
  const showCount = (flashes: number): void => {
    if (flashes === counted) return;
    counted = flashes;
    if (countWords) {
      counter.remove(countWords.mesh);
      countWords.dispose();
    }
    countWords = createLabel(options.countLabel(flashes), 0.28, '#ffe08a');
    counter.add(countWords.mesh);
    faceEye(countWords.mesh);
  };

  // The real picture from space, in place of the drawing, with the button.
  const board = createPictureBoard(options.pictures);
  keep(board);
  board.group.visible = false;
  scene.add(board.group);

  placeBoard(board, target, direction, distance);

  let time = 0;
  /** Flashes counted but not yet drawn, and when one was last drawn. */
  let waiting = 0;
  let sinceLast = Infinity;
  let reduced = false;
  let seed = 1;

  /** Draws one flash from under the cloud, in a free line. */
  const flash = (): void => {
    const bolt = bolts.find((candidate) => candidate.left <= 0) ?? bolts[0];
    if (!bolt) return;
    const [spot] = scatter(1, (seed += 7));
    const from = new Vector3(
      CLOUD_X + ((spot?.[0] ?? 0.5) - 0.5) * CLOUD_WIDE,
      CLOUD_BASE * cloud.scale.y + 0.05,
      CLOUD_Z + ((spot?.[1] ?? 0.5) - 0.5) * CLOUD_WIDE * 0.8,
    );
    const path = new CurvePath<Vector3>();
    const points = boltPoints(from, (seed += 13));
    for (let index = 1; index < points.length; index++) {
      const [start, end] = [points[index - 1], points[index]];
      if (start && end) path.add(new LineCurve3(start, end));
    }
    bolt.line.geometry.dispose();
    bolt.line.geometry = new TubeGeometry(path, 60, BOLT_RADIUS, 5, false);
    bolt.line.visible = true;
    bolt.left = FLASH_SECONDS;
    flashLight.position.copy(from);
    flashLight.intensity = 30;
    sinceLast = 0;
  };

  let lastCount = Number.NaN;
  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    bounds: {
      min: { x: -HALF_X, y: BASE, z: -HALF_Z },
      max: { x: HALF_X, y: CLOUD_TOP, z: HALF_Z },
    },

    set(jd, picture) {
      board.set(picture);
      // The day going, by the lake's own clock.
      const localHour = (((((jd + 0.5) % 1) * 24 + LONGITUDE_EAST / 15) % 24) + 24) % 24;
      const day = smooth(5.6, 7, localHour) * (1 - smooth(18, 19.3, localHour));
      sun.intensity = 0.15 + 1.9 * day;
      ambient.intensity = 0.25 + 0.4 * day;
      // The cloud grows through the afternoon (a drawing), and is seen inside once asked.
      const grown = 0.45 + 0.55 * smooth(options.countFromJd, options.grownJd, jd);
      cloud.scale.setScalar(grown);
      inside.visible = jd >= options.insideFromJd;
      cloudMaterial.opacity = inside.visible ? 0.4 : 0.75;
      // Flashes counted at the real average rate since the story began.
      const count = Math.max(0, Math.floor((jd - options.countFromJd) * options.flashesPerDay));
      if (Number.isFinite(lastCount) && count > lastCount) {
        waiting = Math.min(waiting + count - lastCount, 6);
      } else if (!Number.isFinite(lastCount) || count < lastCount) {
        waiting = 0;
      }
      lastCount = count;
      showCount(count);
    },

    flow(seconds) {
      reduced = seconds === 0;
      time += seconds;
      sinceLast += seconds;
      // Ice rising and hail falling inside the cloud.
      if (inside.visible) {
        const place = new Matrix4();
        for (const [index, [u, v]] of iceSpots.entries()) {
          const rise = (v + time * 0.15) % 1;
          place.makeTranslation((u - 0.5) * 1.2, CLOUD_BASE + 0.6 + rise * 1.6, (v - 0.5) * 0.6);
          ice.setMatrixAt(index, place);
        }
        for (const [index, [u, v]] of hailSpots.entries()) {
          const fall = (v + time * 0.08) % 1;
          place.makeTranslation((u - 0.5) * 1.0, CLOUD_TOP - 1.0 - fall * 1.2, (v - 0.5) * 0.5);
          hail.setMatrixAt(index, place);
        }
        ice.instanceMatrix.needsUpdate = true;
        hail.instanceMatrix.needsUpdate = true;
      }
      if (waiting > 0 && sinceLast >= 1 / MOST_PER_SECOND) {
        waiting -= 1;
        flash();
      }
      for (const bolt of bolts) {
        // With no motion asked for, a flash stays until the next takes its place.
        if (reduced) continue;
        bolt.left -= seconds;
        if (bolt.left <= 0) bolt.line.visible = false;
      }
      if (!reduced) flashLight.intensity = Math.max(0, flashLight.intensity - seconds * 200);
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      diorama.visible = !board.group.visible;
    },

    dispose() {
      countWords?.dispose();
      for (const bolt of bolts) bolt.line.geometry.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
