import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
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
import { addBlockSides, fadeGroup, placeBoard, scatter, smooth } from './diorama';
import { settling } from './settle';
import { createLabel, createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of the water cycle: a block of sea, land and mountains cut open like a model,
 * with the Sun above the sea.
 * 1. The sea, where most of the water is.
 * 2. The Sun warming the sea, and water vapour rising from it: evaporation.
 * 3. Vapour rising from the trees too.
 * 4. The vapour cooling high over the mountains into clouds: condensation.
 * 5. Rain from the clouds, and snow on the peaks: precipitation.
 * 6. A river carrying the water back down to the sea, and round it goes again.
 * 7. With its button, the real picture of the whole world that day, every cloud in it water.
 * Each step is named on screen as it comes, and the step being told is the brightest.
 *
 * Everything here is a drawing.
 */
const BACKGROUND = '#0a1020';
const LAND = new Color('#5f9447');
const ROCK = new Color('#857c70');
const SNOW = new Color('#f4f7fa');
const SAND = new Color('#dcc792');
const SEA = 0x2a6ca6;
const RIVER = 0x3b8ad0;
const VAPOUR = 0xeaf6ff;
const CLOUD = 0xf0f3f6;
const RAIN_CLOUD_COLOR = new Color(0x9aa4af);
/** The sea glowing a little while the Sun warms it. */
const WARM_SEA = new Color(0x0a2a4a);
const RAIN = 0xb8d4f0;
const TREE = 0x3c6b33;
const SUN = 0xffd85a;

const HALF_X = 4;
const HALF_Z = 2.4;
const BASE = -0.4;
const GRID = 110;
/** The coast runs north to south here: sea to the west, land to the east. */
const COAST_X = -0.7;
const SUN_AT = new Vector3(-3, 3.4, -1.2);
const CLOUD_AT = new Vector3(2.3, 2.3, -0.2);
const VAPOUR_BITS = 70;
const PLANT_BITS = 24;
const TREES = 36;
const CLOUD_PUFFS = 14;
const RAIN_DROPS = 400;
const RIVER_DOTS = 40;

/** The names of the steps, as the screen gives them. */
export interface WaterCycleWords {
  readonly ocean: string;
  readonly evaporation: string;
  readonly condensation: string;
  readonly precipitation: string;
  readonly back: string;
}

export interface WaterCycleSliceOptions {
  /** When each step is told, as Julian dates, in order. */
  readonly oceanJd: number;
  readonly evaporationJd: number;
  readonly plantsJd: number;
  readonly cloudsJd: number;
  readonly rainJd: number;
  readonly backJd: number;
  readonly words: WaterCycleWords;
  /** The real picture, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface WaterCycleSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  /** Draws the cycle as far as the story has told it, with the real picture ready. */
  set(jd: number, picture: number | null): void;
  /** Moves the vapour, the rain and the river. */
  flow(seconds: number): void;
  /** Swaps the drawing for the real picture, or back. */
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/** How high the drawn land stands; below the sea to the west of the coast. */
function landHeight(x: number, z: number): number {
  const coast = COAST_X + 0.25 * Math.sin(1.6 * z + 0.4);
  if (x < coast) return -0.08 - 0.12 * smooth(0, 0.8, coast - x);
  const rise = 0.06 * smooth(coast, coast + 0.5, x);
  const mountains =
    smooth(1.2, 2.8, x) * (1.5 + 0.3 * Math.sin(3.4 * z) + 0.15 * Math.sin(8 * z + 1));
  const valley = 0.35 * smooth(1.2, 2.8, x) * Math.exp(-((z / 0.35) ** 2));
  return rise + mountains - valley + 0.02 * Math.sin(5 * x) * Math.sin(4 * z);
}

const landColor = (x: number, z: number): Color => {
  const height = landHeight(x, z);
  if (height > 1.25) return SNOW.clone();
  if (height < 0.04) return SAND.clone();
  return LAND.clone().lerp(ROCK, smooth(0.35, 0.95, height));
};

/** The river's way, from high in the valley down to the sea, as a share along it. */
function riverAt(share: number): Vector3 {
  const x = 3.1 - share * (3.1 - (COAST_X - 0.1));
  const z = 0.25 * Math.sin(share * 5);
  return new Vector3(x, Math.max(0, landHeight(x, z)) + 0.02, z);
}

/** A glow for the Sun. */
function glowTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const glow = context.createRadialGradient(32, 32, 4, 32, 32, 32);
    glow.addColorStop(0, 'rgba(255,230,140,1)');
    glow.addColorStop(1, 'rgba(255,200,80,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  return texture;
}

export function createWaterCycleSlice(options: WaterCycleSliceOptions): WaterCycleSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  scene.add(new AmbientLight(0xffffff, 0.55));
  const sunlight = new DirectionalLight(0xfff2d6, 2.2);
  sunlight.position.copy(SUN_AT);
  scene.add(sunlight);

  const diorama = new Group();
  scene.add(diorama);

  // The land and the sea floor.
  const landGeometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, GRID, GRID));
  landGeometry.rotateX(-Math.PI / 2);
  const positions = landGeometry.getAttribute('position') as BufferAttribute;
  const colors = new Float32Array(positions.count * 3);
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(index, landHeight(x, z));
    const color = landColor(x, z);
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
  const seaMaterial = keep(
    new MeshStandardMaterial({ color: SEA, roughness: 0.25, metalness: 0.1 }),
  );
  const sea = new Mesh(keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z)), seaMaterial);
  sea.rotation.x = -Math.PI / 2;
  diorama.add(sea);

  // The Sun, with its glow.
  const sun = new Mesh(
    keep(new SphereGeometry(0.28, 24, 16)),
    keep(new MeshBasicMaterial({ color: SUN })),
  );
  sun.position.copy(SUN_AT);
  const glow = new Mesh(
    keep(new PlaneGeometry(1.6, 1.6)),
    keep(new MeshBasicMaterial({ map: keep(glowTexture()), transparent: true, depthWrite: false })),
  );
  glow.position.copy(SUN_AT);
  diorama.add(sun, glow);

  // Trees on the land between the coast and the mountains.
  const treeSpots = scatter(TREES, 81).map(([u, v]) => {
    const x = COAST_X + 0.5 + u * 1.3;
    const z = -HALF_Z + 0.3 + v * (2 * HALF_Z - 0.6);
    return [x, z] as const;
  });
  const trees = new InstancedMesh(
    keep(new ConeGeometry(0.08, 0.26, 7)),
    keep(new MeshStandardMaterial({ color: TREE, roughness: 0.9 })),
    TREES,
  );
  for (const [index, [x, z]] of treeSpots.entries()) {
    trees.setMatrixAt(index, new Matrix4().makeTranslation(x, landHeight(x, z) + 0.13, z));
  }
  diorama.add(trees);

  // Water vapour rising from the sea and from the trees, drifting towards the mountains.
  const vapourMaterial = keep(
    new MeshBasicMaterial({ color: VAPOUR, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  const bit = keep(new SphereGeometry(0.035, 6, 4));
  const vapour = new InstancedMesh(bit, vapourMaterial, VAPOUR_BITS);
  const plantVapour = new InstancedMesh(bit, vapourMaterial, PLANT_BITS);
  const vapourSpots = scatter(VAPOUR_BITS, 91);
  const plantSpots = scatter(PLANT_BITS, 93);
  diorama.add(vapour, plantVapour);

  // The cloud over the mountains, and rain and snow from it.
  const cloud = new Group();
  cloud.position.copy(CLOUD_AT);
  const cloudMaterial = keep(
    new MeshStandardMaterial({ color: CLOUD, roughness: 1, transparent: true, opacity: 0.95 }),
  );
  const puff = keep(new SphereGeometry(1, 16, 12));
  for (const [u, v] of scatter(CLOUD_PUFFS, 97)) {
    const mesh = new Mesh(puff, cloudMaterial);
    mesh.position.set((u - 0.5) * 1.5, (v - 0.5) * 0.25, (v - 0.5) * 1.4);
    mesh.scale.set(0.35 + u * 0.25, 0.22 + v * 0.1, 0.3 + v * 0.2);
    cloud.add(mesh);
  }
  diorama.add(cloud);
  const rainPositions = new Float32Array(RAIN_DROPS * 6);
  const rainGeometry = keep(new BufferGeometry());
  rainGeometry.setAttribute('position', new BufferAttribute(rainPositions, 3));
  const rain = new LineSegments(
    rainGeometry,
    keep(new LineBasicMaterial({ color: RAIN, transparent: true, opacity: 0.6 })),
  );
  const drops = scatter(RAIN_DROPS, 99);
  diorama.add(rain);

  // The river, and water flowing down it.
  const riverGeometry = keep(new PlaneGeometry(1, 1, 1, 80));
  const riverPositions = riverGeometry.getAttribute('position') as BufferAttribute;
  for (let index = 0; index < riverPositions.count; index++) {
    const share = riverPositions.getY(index) + 0.5;
    const side = riverPositions.getX(index) * (0.05 + 0.07 * share);
    const at = riverAt(share);
    riverPositions.setXYZ(index, at.x, at.y - 0.012, at.z + side);
  }
  riverGeometry.computeVertexNormals();
  diorama.add(
    new Mesh(
      riverGeometry,
      keep(new MeshStandardMaterial({ color: RIVER, roughness: 0.3, side: DoubleSide })),
    ),
  );
  const riverDots = new InstancedMesh(
    keep(new SphereGeometry(0.03, 6, 4)),
    keep(new MeshBasicMaterial({ color: 0xcfeaff })),
    RIVER_DOTS,
  );
  diorama.add(riverDots);

  // The names of the steps.
  const stepAt = (text: string, at: Vector3): { readonly mesh: Mesh; dispose(): void } => {
    const label = keep(createLabel(text, 0.36, '#ffe08a'));
    label.mesh.position.copy(at);
    diorama.add(label.mesh);
    return label;
  };
  const steps = {
    ocean: stepAt(options.words.ocean, new Vector3(-2.6, 0.3, 1.4)),
    evaporation: stepAt(options.words.evaporation, new Vector3(-2.3, 1.6, 0.6)),
    condensation: stepAt(options.words.condensation, new Vector3(2.2, 2.95, 0.4)),
    precipitation: stepAt(options.words.precipitation, new Vector3(3.3, 1.7, 1.0)),
    back: stepAt(options.words.back, new Vector3(0.9, 0.55, 1.2)),
  };

  // The real picture, in place of the drawing, with the button.
  const board = createPictureBoard(options.pictures);
  keep(board);
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0.3, y: 1.0, z: 0 };
  const direction = new Vector3(0.15, 0.55, 1).normalize();
  const distance = 10.5;
  placeBoard(board, target, direction, distance);
  const facing = new Matrix4().lookAt(direction, new Vector3(), new Vector3(0, 1, 0));
  for (const label of Object.values(steps)) label.mesh.quaternion.setFromRotationMatrix(facing);

  let time = 0;
  // Where the story is, each settling into place over a moment when it changes.
  const risingTo = settling();
  const plantsTo = settling();
  const cloudedTo = settling();
  const rainTo = settling();
  const flowingTo = settling();
  const warmTo = settling();
  const named = new Map(Object.values(steps).map((label) => [label, settling()] as const));
  const settlings = [risingTo, plantsTo, cloudedTo, rainTo, flowingTo, warmTo, ...named.values()];
  const cloudNow = new Color();
  const place = new Matrix4();

  /** Places everything that moves, for the time gone by. */
  const move = (): void => {
    for (const [index, [u, v]] of vapourSpots.entries()) {
      const up = (v + time * 0.12) % 1;
      const x = -3.8 + u * 3 + up * 2.2;
      place.makeTranslation(x, 0.05 + up * (CLOUD_AT.y - 0.1), (u - 0.5) * 3.6 * (1 - up * 0.6));
      vapour.setMatrixAt(index, place);
    }
    vapour.instanceMatrix.needsUpdate = true;
    for (const [index, [u, v]] of plantSpots.entries()) {
      const spot = treeSpots[index % TREES] ?? [0, 0];
      const up = (v + time * 0.12) % 1;
      place.makeTranslation(
        spot[0] + up * 1.2,
        landHeight(spot[0], spot[1]) + 0.25 + up * (CLOUD_AT.y - 0.5),
        spot[1] * (1 - up * 0.6) + (u - 0.5) * 0.1,
      );
      plantVapour.setMatrixAt(index, place);
    }
    plantVapour.instanceMatrix.needsUpdate = true;
    if (rain.visible) {
      for (const [index, [u, v]] of drops.entries()) {
        const x = CLOUD_AT.x + (u - 0.5) * 1.6;
        const z = CLOUD_AT.z + (v - 0.5) * 1.4;
        const ground = Math.max(0, landHeight(x, z));
        const fallen = (u * 5.1 + v * 3.7 + time * 1.3) % 1;
        const y = CLOUD_AT.y - 0.15 - fallen * (CLOUD_AT.y - 0.15 - ground);
        rainPositions.set([x, y, z, x, y - 0.1, z], index * 6);
      }
      (rainGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
    }
    for (let index = 0; index < RIVER_DOTS; index++) {
      const share = (index / RIVER_DOTS + time * 0.06) % 1;
      place.makeTranslation(...riverAt(share).toArray());
      riverDots.setMatrixAt(index, place);
    }
    riverDots.instanceMatrix.needsUpdate = true;
  };

  /** Shows a step's name once it has been told, brightest while it is being told. */
  const name = (
    label: (typeof steps)[keyof typeof steps],
    from: number,
    until: number,
    jd: number,
  ): void => {
    named.get(label)?.aim(jd < from - 1e-6 ? 0 : jd < until ? 1 : 0.4);
  };

  /** Draws the cycle as far as the settling values have reached. */
  const show = (): void => {
    fadeGroup(vapour, risingTo.value);
    fadeGroup(plantVapour, plantsTo.value);
    cloud.scale.setScalar(0.35 + 0.65 * cloudedTo.value);
    fadeGroup(cloud, smooth(0, 0.15, cloudedTo.value));
    cloudMaterial.color.copy(cloudNow.set(CLOUD).lerp(RAIN_CLOUD_COLOR, rainTo.value));
    fadeGroup(rain, rainTo.value);
    fadeGroup(riverDots, flowingTo.value);
    seaMaterial.emissive.setScalar(0).lerp(WARM_SEA, warmTo.value);
    for (const [label, shown] of named) {
      label.mesh.visible = shown.value > 0.002;
      (label.mesh.material as MeshBasicMaterial).opacity = shown.value;
    }
  };

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    bounds: {
      min: { x: -HALF_X, y: BASE, z: -HALF_Z },
      max: { x: HALF_X, y: CLOUD_AT.y, z: HALF_Z },
    },

    set(jd, picture) {
      board.set(picture);
      const first = Number.isNaN(risingTo.value);
      risingTo.aim(jd >= options.evaporationJd ? 1 : 0);
      plantsTo.aim(jd >= options.plantsJd ? 1 : 0);
      cloudedTo.aim(smooth(options.evaporationJd, options.cloudsJd, jd));
      rainTo.aim(jd >= options.rainJd ? 1 : 0);
      flowingTo.aim(jd >= options.backJd ? 1 : 0);
      warmTo.aim(jd >= options.oceanJd && jd < options.evaporationJd ? 1 : 0);
      name(steps.ocean, options.oceanJd, options.evaporationJd, jd);
      name(steps.evaporation, options.evaporationJd, options.cloudsJd, jd);
      name(steps.condensation, options.cloudsJd, options.rainJd, jd);
      name(steps.precipitation, options.rainJd, options.backJd, jd);
      name(steps.back, options.backJd, Infinity, jd);
      if (first) show();
    },

    flow(seconds) {
      let moved = false;
      for (const one of settlings) moved = one.step(seconds) || moved;
      if (moved) show();
      time += seconds;
      if (seconds > 0) move();
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
