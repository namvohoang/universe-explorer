import {
  AmbientLight,
  ArrowHelper,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
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
import { createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of a monsoon: a block of land and sea cut open like a model, seen from over
 * the sea, with mountains at the back of the land.
 * 1. Before the rains, dry brown land under a strong sun.
 * 2. The land warming faster than the sea: heat rising off it.
 * 3. The wind turning round and blowing in from the sea, full of water.
 * 4. Clouds building over the land, and rain.
 * 5. The land turned green, and the rivers fuller.
 * 6. In winter, the wind turning back and blowing dry off the land.
 * 7. With its button, the real picture from space of that moment in place of the drawing.
 *
 * Everything here is a drawing: the shape of the land, how the air moves and how strongly.
 * Which turn of the season is shown when is set by the story's parts.
 */
const BACKGROUND = '#0a1020';
const DRY = new Color('#b39a6a');
const GREEN = new Color('#4f8f3e');
const ROCK = new Color('#8a8072');
const SNOW = new Color('#f2f5f8');
const SAND = new Color('#d9c38f');
const SEA = 0x2b6ea8;
const RIVER = 0x3a86c8;
const HEAT = 0xff8a4a;
const WET_WIND = 0xbfe6ff;
const DRY_WIND = 0xe0c08a;
const CLOUD = 0xe6ebf0;
const RAIN_CLOUD_COLOR = new Color(0x7d8794);
const RAIN = 0xb8d4f0;

/** The block, in drawing units: x east, z south (towards the eye); the sea lies to the south. */
const HALF_X = 4;
const HALF_Z = 3;
const BASE = -0.4;
const GRID = 110;
const SEA_LEVEL = 0;
const HEAT_ARROWS = 14;
const WIND_ARROWS = 20;
const WIND_Y = 0.75;
const CLOUDS = 14;
const RAIN_DROPS = 700;
const CLOUD_Y = 1.25;

export interface MonsoonSliceOptions {
  /** When each turn of the season is shown, as Julian dates, in order. */
  readonly warmsJd: number;
  readonly windTurnsJd: number;
  readonly rainJd: number;
  readonly greenJd: number;
  readonly winterJd: number;
  /** The real pictures, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface MonsoonSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  /** Draws the season as it was at a date, with the real picture of that moment ready. */
  set(jd: number, picture: number | null): void;
  /** Moves the wind, the heat, the rain and the sea. */
  flow(seconds: number): void;
  /** Swaps the drawing for the real picture, or back. */
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/** Where the coast lies, as how far south the land reaches at `x`. */
const coastZ = (x: number): number =>
  0.5 + 0.25 * Math.sin(1.3 * x + 0.5) + 0.1 * Math.sin(3.7 * x);

/** How high the drawn land stands; below the sea where the sea is. */
function landHeight(x: number, z: number): number {
  const inland = coastZ(x) - z;
  if (inland < 0) return SEA_LEVEL - 0.08 - 0.1 * smooth(0, 0.6, -inland);
  const plain = 0.05 * smooth(0, 0.4, inland) + 0.02 * Math.sin(2.1 * x) * Math.sin(1.7 * z);
  const mountains =
    smooth(-1.6, -2.6, z) * (1.1 + 0.25 * Math.sin(4.3 * x) + 0.12 * Math.sin(9 * x + 2));
  return plain + mountains;
}

/** The colour of the land: sand at the coast, dry or green plains, rock and snow up high. */
function landColor(x: number, z: number, green: number): Color {
  const height = landHeight(x, z);
  if (height > 0.95) return SNOW.clone();
  if (height > 0.35) return ROCK.clone().lerp(SNOW, smooth(0.75, 0.95, height));
  const inland = coastZ(x) - z;
  if (inland < 0.08) return SAND.clone();
  return DRY.clone().lerp(GREEN, green);
}

/** Ripples on the sea, scrolled to show it moving. */
function rippleTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 128, 128);
    context.strokeStyle = '#cfe0ee';
    context.lineWidth = 2;
    for (let row = 0; row < 8; row++) {
      context.beginPath();
      for (let x = 0; x <= 128; x += 8) {
        const y = row * 16 + 8 + 3 * Math.sin((x / 128) * 4 * Math.PI + row);
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

export function createMonsoonSlice(options: MonsoonSliceOptions): MonsoonSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new DirectionalLight(0xfff4dc, 2.4);
  sun.position.set(1, 4, 2);
  scene.add(sun);

  const diorama = new Group();
  scene.add(diorama);

  // The land, coloured by how green it is.
  const landGeometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, GRID, GRID));
  landGeometry.rotateX(-Math.PI / 2);
  const landPositions = landGeometry.getAttribute('position') as BufferAttribute;
  for (let index = 0; index < landPositions.count; index++) {
    landPositions.setY(index, landHeight(landPositions.getX(index), landPositions.getZ(index)));
  }
  landGeometry.computeVertexNormals();
  const colors = new BufferAttribute(new Float32Array(landPositions.count * 3), 3);
  landGeometry.setAttribute('color', colors);
  let shownGreen = Number.NaN;
  /** Colours the plains from dry (0) to green (1). */
  const paint = (green: number): void => {
    if (Math.abs(green - shownGreen) < 0.01) return;
    shownGreen = green;
    for (let index = 0; index < landPositions.count; index++) {
      const color = landColor(landPositions.getX(index), landPositions.getZ(index), green);
      colors.setXYZ(index, color.r, color.g, color.b);
    }
    colors.needsUpdate = true;
  };
  paint(0);
  diorama.add(
    new Mesh(landGeometry, keep(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }))),
  );
  for (const side of addBlockSides(
    diorama,
    (x, z) => Math.max(landHeight(x, z), SEA_LEVEL),
    { west: -HALF_X, east: HALF_X, north: -HALF_Z, south: HALF_Z },
    BASE,
    keep(new MeshStandardMaterial({ color: 0x5a4632, roughness: 1 })),
  )) {
    keep(side);
  }

  // The sea.
  const ripples = keep(rippleTexture());
  ripples.repeat.set(5, 4);
  const sea = new Mesh(
    keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z)),
    keep(new MeshStandardMaterial({ color: SEA, map: ripples, roughness: 0.3, metalness: 0.1 })),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = SEA_LEVEL;
  diorama.add(sea);

  // Rivers from the mountains to the sea, fuller once the rain has come.
  const riverMaterial = keep(
    new MeshStandardMaterial({ color: RIVER, roughness: 0.3, side: DoubleSide }),
  );
  const rivers = [-2.4, -0.3, 1.9].map((startX, which) => {
    const geometry = keep(new PlaneGeometry(1, 1, 1, 60));
    const positions = geometry.getAttribute('position') as BufferAttribute;
    // Where each point lies along the river and across it, before it is laid on the land.
    const flat = Float32Array.from(positions.array);
    const lay = (width: number): void => {
      for (let index = 0; index < positions.count; index++) {
        const along = (flat[index * 3 + 1] ?? 0) + 0.5;
        const side = flat[index * 3] ?? 0;
        const z = -2.0 + along * (coastZ(startX) + 0.2 + 2.0);
        const x = startX + 0.35 * Math.sin(along * 5 + which) + side * width;
        positions.setXYZ(index, x, Math.max(landHeight(x, z), SEA_LEVEL) + 0.006, z);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    };
    lay(0.05);
    diorama.add(new Mesh(geometry, riverMaterial));
    return lay;
  });

  // Heat rising off the warm land.
  const heat = new Group();
  const heatArrows = scatter(HEAT_ARROWS, 21).map(([u, v]) => {
    const x = -HALF_X + 0.4 + u * (2 * HALF_X - 0.8);
    const z = -1.4 + v * (coastZ(x) + 1.2);
    const arrow = new ArrowHelper(
      new Vector3(0, 1, 0),
      new Vector3(x, 0.1, z),
      0.6,
      HEAT,
      0.16,
      0.11,
    );
    heat.add(arrow);
    return { arrow, x, z, phase: u * 6 };
  });
  diorama.add(heat);

  // The wind, blowing between the sea and the land.
  const wind = new Group();
  const windArrows = scatter(WIND_ARROWS, 31).map(([u, v]) => {
    const arrow = new ArrowHelper(new Vector3(0, 0, -1), new Vector3(), 0.8, WET_WIND, 0.22, 0.14);
    wind.add(arrow);
    return { arrow, x: -HALF_X + 0.3 + u * (2 * HALF_X - 0.6), start: v, lift: (u - 0.5) * 0.25 };
  });
  diorama.add(wind);

  // Clouds over the land, and rain from them.
  const weather = new Group();
  const cloudMaterial = keep(
    new MeshStandardMaterial({ color: CLOUD, roughness: 1, transparent: true, opacity: 0.95 }),
  );
  const puff = keep(new SphereGeometry(1, 16, 12));
  const clouds = scatter(CLOUDS, 41).map(([u, v]) => {
    const cloud = new Mesh(puff, cloudMaterial);
    const x = -HALF_X + 0.5 + u * (2 * HALF_X - 1);
    const z = -1.8 + v * 2.1;
    cloud.position.set(x, CLOUD_Y + v * 0.15, z);
    cloud.scale.set(0.45 + u * 0.35, 0.16, 0.35 + v * 0.25);
    weather.add(cloud);
    return cloud;
  });
  const rainPositions = new Float32Array(RAIN_DROPS * 6);
  const drops = scatter(RAIN_DROPS, 43);
  const rainGeometry = keep(new BufferGeometry());
  rainGeometry.setAttribute('position', new BufferAttribute(rainPositions, 3));
  const rain = new LineSegments(
    rainGeometry,
    keep(new LineBasicMaterial({ color: RAIN, transparent: true, opacity: 0.55 })),
  );
  weather.add(rain);
  diorama.add(weather);

  // The real picture from space, in place of the drawing, with the button.
  const board = createPictureBoard(options.pictures);
  keep(board);
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0, y: 0.35, z: -0.3 };
  const direction = new Vector3(0.25, 0.75, 1).normalize();
  const distance = 8.2;
  placeBoard(board, target, direction, distance);

  let time = 0;
  // Where the story is, each settling into place over a moment when it changes.
  const warmthTo = settling();
  const summerTo = settling();
  const winterTo = settling();
  const rainTo = settling();
  const greenTo = settling();
  const settlings = [warmthTo, summerTo, winterTo, rainTo, greenTo];
  /** +1 for the wind blowing in from the sea, -1 for blowing off the land; it dies down to turn. */
  const windWay = (): number => summerTo.value - winterTo.value;
  const cloudNow = new Color();

  /** Places the moving parts for the time that has gone by. */
  const move = (): void => {
    for (const { arrow, x, z, phase } of heatArrows) {
      const rise = (time * 0.4 + phase) % 1;
      arrow.position.set(x, landHeight(x, z) + 0.05 + rise * 0.5, z);
    }
    for (const { arrow, x, start, lift } of windArrows) {
      const across = (start + time * 0.12) % 1;
      // From the sea in towards the mountains, or the other way.
      const z = windWay() >= 0 ? 2.6 - across * 4 : -1.4 + across * 4;
      arrow.position.set(x, WIND_Y + lift + Math.max(0, landHeight(x, z)) * 0.3, z);
    }
    if (rain.visible) {
      for (const [index, [u, v]] of drops.entries()) {
        const cloud = clouds[index % CLOUDS];
        if (!cloud) continue;
        const x = cloud.position.x + (u - 0.5) * cloud.scale.x * 1.6;
        const z = cloud.position.z + (v - 0.5) * cloud.scale.z * 1.6;
        const ground = Math.max(landHeight(x, z), SEA_LEVEL);
        const fallen = (u * 5.3 + v * 2.9 + time * 1.4) % 1;
        const y = CLOUD_Y - fallen * (CLOUD_Y - ground);
        rainPositions.set([x, y, z, x, y - 0.1, z], index * 6);
      }
      (rainGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
    }
  };

  /** Draws the season the settling values have reached. */
  const show = (): void => {
    const way = windWay();
    // The wind dies down and comes back the other way, wet from the sea or dry from the land.
    fadeGroup(wind, Math.abs(way));
    for (const { arrow } of windArrows) {
      arrow.setDirection(new Vector3(0, 0, way >= 0 ? -1 : 1));
      arrow.setColor(way >= 0 ? WET_WIND : DRY_WIND);
    }
    fadeGroup(heat, warmthTo.value);
    paint(greenTo.value);
    for (const lay of rivers) lay(0.05 + 0.07 * greenTo.value);
    // Clouds build once the wind brings in the sea's water, and darken while it rains.
    const raining = rainTo.value;
    fadeGroup(weather, smooth(0, 0.3, summerTo.value));
    fadeGroup(rain, weather.visible ? raining : 0);
    cloudMaterial.color.copy(cloudNow.set(CLOUD).lerp(RAIN_CLOUD_COLOR, raining));
    sun.intensity = 2.4 - 1.4 * raining;
    ambient.intensity = 0.6 - 0.15 * raining;
    move();
  };

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    bounds: { min: { x: -HALF_X, y: BASE, z: -HALF_Z }, max: { x: HALF_X, y: CLOUD_Y, z: HALF_Z } },

    set(jd, picture) {
      board.set(picture);
      const first = Number.isNaN(greenTo.value);
      const step = (at: number): number => smooth(at - 0.02, at, jd);
      const winter = step(options.winterJd);
      summerTo.aim(step(options.windTurnsJd) * (1 - winter));
      winterTo.aim(winter);
      warmthTo.aim(step(options.warmsJd) * (1 - winter));
      rainTo.aim(step(options.rainJd) * (1 - step(options.greenJd)));
      greenTo.aim(step(options.greenJd));
      if (first) show();
    },

    flow(seconds) {
      let moved = false;
      for (const one of settlings) moved = one.step(seconds) || moved;
      if (moved) show();
      time += seconds;
      ripples.offset.y = time * 0.03;
      if (seconds > 0) move();
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      diorama.visible = !board.group.visible;
    },

    dispose() {
      for (const arrow of [...heatArrows, ...windArrows]) arrow.arrow.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
