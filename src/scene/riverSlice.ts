import {
  CircleGeometry,
  AmbientLight,
  BoxGeometry,
  ConeGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
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
  Scene,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Bounds } from './flight';
import type { Vec3 } from '../sim/vec3';
import { addBlockSides, fadeGroup, placeBoard, scatter, smooth } from './diorama';
import { createPictureBoard, type PictureBoardOptions } from './pictureBoard';
import { settling } from './settle';

/**
 * A 3D close-up of a winding river on a flat plain, cut open like a model:
 * 0. Where its water comes from: rain falling from a cloud over the plain. Some of it rises
 *    back up as it dries, some soaks into the ground (the ground darkens), and some runs off
 *    across the plain into the river.
 * 1. Water running faster along the outside of each bend, its bank there worn away.
 * 2. Sand building on the inside of each bend.
 * 3. As the years go by, the bends growing and sliding down the valley; one loop growing until
 *    the river cuts through its narrow neck, leaving the loop behind as a crescent-shaped lake.
 * 4. The river reaching the sea, its mud building new land at its mouth: a delta.
 * 5. Then the same plain as Mars, its river channel long dry, and as Titan, its river of methane
 *    under an orange sky.
 * 6. With its button, the real picture from space of that moment in place of the drawing.
 *
 * Everything here is a drawing.
 */
const EARTH_SKY = new Color('#0a1020');
const TITAN_SKY = new Color('#6a4a20');
const EARTH_SUN = new Color(0xfff2dc);
const MARS_SUN = new Color(0xffe0c0);
const TITAN_SUN = new Color(0xffb060);
const FOREST = new Color('#3f7a3a');
const MARS_GROUND = new Color('#b4643c');
const TITAN_GROUND = new Color('#7a5a2a');
const WATER = new Color('#9c7a52');
const TITAN_LIQUID = new Color('#2a2a30');
const DRY_BED = new Color('#7a3c22');
const SAND = 0xe2cf9c;
const FAST = 0xffd8a8;
/** The outside bank being worn away, and the glow on the sand while the inside is told. */
const WORN_BANK = 0xc0753a;
const INSIDE_GLOW = new Color(0x5a4a20);
const BARS = 10;
const TREES = 140;
const TREE = 0x2f5e2c;

const HALF_X = 6;
const HALF_Z = 3.6;
const BASE = -0.35;
const STEPS = 320;
/** The river's half-width, and how deep its channel is cut. */
const HALF_WIDE = 0.18;
const BED = 0.05;
const DOTS = 90;
/** Where the sea begins at the river's mouth, during the delta's part. */
const SEA_X = 3.9;
const SEA = 0x2f6fa8;
/** How high the sea stands: over the drawn water and sand it covers at the mouth. */
const SEA_Y = 0.05;
/** The rain: its cloud, how many drops fall, dry up and run off, and the soaked ground. */
const CLOUD = 0x9aa4af;
const RAIN = 0xb8d4f0;
const CLOUD_Y = 3.2;
const CLOUD_PUFFS = 24;
const RAIN_DROPS = 420;
const VAPOUR_BITS = 40;
const RUNOFF_BITS = 60;
const SOAKED = new Color('#2c5a2a');

export interface RiverSliceOptions {
  /** When rain falls on the plain, as Julian dates. */
  readonly rainJd: number;
  readonly rainUntilJd: number;
  /** When the close-up stresses the bend's outside and inside, as Julian dates. */
  readonly outsideJd: number;
  readonly insideJd: number;
  /** The years the river is drawn changing over: from the first picture to the last. */
  readonly fromJd: number;
  readonly untilJd: number;
  /** From when the river is drawn reaching the sea and building its delta. */
  readonly deltaJd: number;
  /** From when the plain is drawn as Mars, then as Titan. */
  readonly marsJd: number;
  readonly titanJd: number;
  /** The real pictures, for the button. */
  readonly pictures: PictureBoardOptions;
}

export interface RiverSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** The box the look stands back far enough to show whole. */
  readonly bounds: Bounds;
  set(jd: number, picture: number | null): void;
  flow(seconds: number): void;
  toggleView(): void;
  viewToggled(): boolean;
  dispose(): void;
}

/**
 * Where the river's middle runs across the plain at `x`, `grown` of the way through the years:
 * its bends swing wider and slide down the valley (+x); the big loop is cut off once grown past
 * the cut, the river then running straight across its neck. A drawing.
 */
function riverZ(x: number, grown: number, cut: boolean): number {
  const slide = grown * 0.9;
  const bends =
    (0.9 + 0.5 * grown) * Math.sin(0.75 * (x - slide)) * smooth(HALF_X, HALF_X - 1, Math.abs(x));
  // The big loop: a bulge that grows, until the river cuts across its neck.
  const loop = (1.1 + 1.3 * grown) * Math.exp(-(((x - 1.6 - slide * 0.5) / 0.75) ** 2));
  return bends + (cut ? 0 : loop);
}

/** The loop left behind when the neck is cut: where the river ran just before. */
function oxbowZ(x: number): number {
  return riverZ(x, CUT_AT, false);
}
/** How far through the years the loop is cut off: a drawing. */
const CUT_AT = 0.86;

export function createRiverSlice(options: RiverSliceOptions): RiverSlice {
  const scene = new Scene();
  const background = EARTH_SKY.clone();
  scene.background = background;
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new DirectionalLight(0xfff2dc, 2.1);
  sun.position.set(3, 8, 5);
  scene.add(sun);

  const diorama = new Group();
  scene.add(diorama);

  // The plain, with the river's channel cut into it wherever the river or its old loop runs.
  const groundGeometry = keep(new PlaneGeometry(2 * HALF_X, 2 * HALF_Z, 240, 144));
  groundGeometry.rotateX(-Math.PI / 2);
  const groundPositions = groundGeometry.getAttribute('position') as BufferAttribute;
  const groundMaterial = keep(new MeshStandardMaterial({ color: FOREST.clone(), roughness: 1 }));
  diorama.add(new Mesh(groundGeometry, groundMaterial));
  const sideMaterial = keep(new MeshStandardMaterial({ color: 0x4a3d33, roughness: 1 }));
  let sideGeometries: PlaneGeometry[] = [];
  let groundHeight: (x: number, z: number) => number = () => 0;

  // The water, a ribbon along the river; the oxbow lake, a ribbon along the old loop.
  const ribbon = (color: Color): { readonly mesh: Mesh; readonly geometry: BufferGeometry } => {
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute('position', new BufferAttribute(new Float32Array((STEPS + 1) * 6), 3));
    const index: number[] = [];
    for (let step = 0; step < STEPS; step++) {
      const a = step * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geometry.setIndex(index);
    const mesh = new Mesh(
      geometry,
      keep(new MeshStandardMaterial({ color, roughness: 0.3, side: DoubleSide })),
    );
    diorama.add(mesh);
    return { mesh, geometry };
  };
  const water = ribbon(WATER.clone());
  const oxbow = ribbon(WATER.clone());
  /** Lays a ribbon along a line across the plain, between `from` and `to` in x. */
  const lay = (
    target: { readonly geometry: BufferGeometry },
    line: (x: number) => number,
    from: number,
    to: number,
    y: number,
  ): void => {
    const positions = target.geometry.getAttribute('position') as BufferAttribute;
    for (let step = 0; step <= STEPS; step++) {
      const x = from + ((to - from) * step) / STEPS;
      const z = line(x);
      const slope = (line(x + 0.01) - z) / 0.01;
      const across = HALF_WIDE / Math.hypot(1, slope);
      positions.setXYZ(step * 2, x + slope * across, y, z - across);
      positions.setXYZ(step * 2 + 1, x - slope * across, y, z + across);
    }
    positions.needsUpdate = true;
    target.geometry.computeVertexNormals();
  };

  // Sand on the inside of each bend.
  const sandMaterial = keep(new MeshStandardMaterial({ color: SAND, roughness: 1 }));
  const bars = new InstancedMesh(keep(new SphereGeometry(1, 16, 8)), sandMaterial, BARS);
  diorama.add(bars);
  // The outside bank, steep where the fast water wears it away.
  const banks = new InstancedMesh(
    keep(new BoxGeometry(1, 1, 1)),
    keep(new MeshStandardMaterial({ color: WORN_BANK, roughness: 1 })),
    BARS,
  );
  diorama.add(banks);
  // Forest on the plain.
  const treeSpots = scatter(TREES, 59);
  const trees = new InstancedMesh(
    keep(new ConeGeometry(0.07, 0.2, 6)),
    keep(new MeshStandardMaterial({ color: TREE, roughness: 1 })),
    TREES,
  );
  diorama.add(trees);

  // Water flowing down the river, faster along the outside of the bends.
  const dots = new InstancedMesh(
    keep(new SphereGeometry(0.045, 6, 4)),
    keep(new MeshBasicMaterial({ color: FAST })),
    DOTS,
  );
  diorama.add(dots);

  // The sea at the river's mouth, and the fan of new land its mud builds there.
  const delta = new Group();
  delta.visible = false;
  diorama.add(delta);
  const sea = new Mesh(
    keep(new PlaneGeometry(HALF_X - SEA_X, 2 * HALF_Z)),
    keep(new MeshStandardMaterial({ color: SEA, roughness: 0.25 })),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set((HALF_X + SEA_X) / 2, SEA_Y, 0);
  delta.add(sea);
  const fan = new Mesh(
    keep(new CircleGeometry(1, 32, -Math.PI / 2, Math.PI)),
    keep(new MeshStandardMaterial({ color: SAND, roughness: 1 })),
  );
  fan.rotation.x = -Math.PI / 2;
  delta.add(fan);

  // The rain: a cloud over the plain, its drops falling; some rising back up as they dry, some
  // running off across the plain into the river.
  const rainfall = new Group();
  rainfall.visible = false;
  diorama.add(rainfall);
  const cloudMaterial = keep(
    new MeshStandardMaterial({
      color: CLOUD,
      roughness: 1,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  const puff = keep(new SphereGeometry(1, 16, 12));
  for (const [u, v] of scatter(CLOUD_PUFFS, 41)) {
    const mesh = new Mesh(puff, cloudMaterial);
    mesh.position.set((u - 0.5) * 2 * HALF_X * 0.8, CLOUD_Y + (v - 0.5) * 0.3, (v - 0.5) * HALF_Z);
    mesh.scale.set(0.6 + u * 0.4, 0.14 + v * 0.08, 0.45 + v * 0.3);
    rainfall.add(mesh);
  }
  const rainPositions = new Float32Array(RAIN_DROPS * 6);
  const rainGeometry = keep(new BufferGeometry());
  rainGeometry.setAttribute('position', new BufferAttribute(rainPositions, 3));
  rainfall.add(
    new LineSegments(
      rainGeometry,
      keep(new LineBasicMaterial({ color: RAIN, transparent: true, opacity: 0.6 })),
    ),
  );
  const drops = scatter(RAIN_DROPS, 43);
  const bit = keep(new SphereGeometry(0.035, 6, 4));
  const runoffBit = keep(new SphereGeometry(0.05, 8, 6));
  const vapour = new InstancedMesh(
    bit,
    keep(new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })),
    VAPOUR_BITS,
  );
  const vapourSpots = scatter(VAPOUR_BITS, 47);
  const runoff = new InstancedMesh(
    runoffBit,
    keep(new MeshBasicMaterial({ color: 0x6fb6ff })),
    RUNOFF_BITS,
  );
  const runoffSpots = scatter(RUNOFF_BITS, 53);
  rainfall.add(vapour, runoff);

  // The real picture from space, in place of the drawing, with the button.
  const board = keep(createPictureBoard(options.pictures));
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0.3, y: 0, z: 0.2 };
  const direction = new Vector3(0.1, 1.6, 1).normalize();
  const distance = 9.5;
  placeBoard(board, target, direction, distance);

  // Where the story is, each settling into place over a moment when it changes.
  const grownTo = settling();
  const marsTo = settling();
  const titanTo = settling();
  const rainTo = settling();
  const soakedTo = settling();
  const deltaTo = settling();
  const builtTo = settling();
  const outsideTo = settling();
  const insideTo = settling();
  const settlings = [
    grownTo,
    marsTo,
    titanTo,
    rainTo,
    soakedTo,
    deltaTo,
    builtTo,
    outsideTo,
    insideTo,
  ];
  let grown = -1;
  let cut = false;
  let time = 0;
  const place = new Matrix4();
  const groundNow = new Color();
  const liquidNow = new Color();

  /** Where each bend turns furthest, as x along the plain, and which way its inside lies. */
  const bendTips = (line: (x: number) => number): (readonly [number, number])[] => {
    const tips: (readonly [number, number])[] = [];
    const step = 0.05;
    let slope = line(-HALF_X + step) - line(-HALF_X);
    for (let x = -HALF_X + step; x < HALF_X - step; x += step) {
      const next = line(x + step) - line(x);
      if (Math.sign(next) !== Math.sign(slope) && Math.abs(x) < HALF_X - 0.4) {
        // At its furthest the bend curves back: its inside is the way it curves.
        tips.push([x, next < slope ? -1 : 1]);
      }
      slope = next;
    }
    return tips;
  };

  /** Reshapes the plain, the river, the old loop, the sand and the trees for `grown`. */
  const shape = (): void => {
    const line = (x: number): number => riverZ(x, grown, cut);
    const nearRiver = (x: number, z: number): number =>
      Math.min(Math.abs(z - line(x)), cut && x > 0 && x < 3.4 ? Math.abs(z - oxbowZ(x)) : Infinity);
    groundHeight = (x, z) => -BED * smooth(HALF_WIDE * 1.6, HALF_WIDE * 0.6, nearRiver(x, z));
    for (let index = 0; index < groundPositions.count; index++) {
      groundPositions.setY(
        index,
        groundHeight(groundPositions.getX(index), groundPositions.getZ(index)),
      );
    }
    groundPositions.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    for (const side of sideGeometries) side.dispose();
    for (const child of [...diorama.children]) {
      if (child.userData.side === true) diorama.remove(child);
    }
    const before = diorama.children.length;
    sideGeometries = addBlockSides(
      diorama,
      groundHeight,
      { west: -HALF_X, east: HALF_X, north: -HALF_Z, south: HALF_Z },
      BASE,
      sideMaterial,
    );
    for (const child of diorama.children.slice(before)) child.userData.side = true;
    lay(water, line, -HALF_X, HALF_X, -BED * 0.4);
    // The old loop, from one end of the neck to the other.
    oxbow.mesh.visible = cut;
    if (cut) lay(oxbow, oxbowZ, 0.35, 2.95, -BED * 0.4);
    // At the tip of each bend: sand on its inside, and its outside bank being worn away.
    const tips = bendTips(line);
    for (let bar = 0; bar < BARS; bar++) {
      const tip = tips[bar];
      if (tip) {
        const [x, inside] = tip;
        const z = line(x);
        place.makeScale(0.55, 0.035, 0.14).setPosition(x, 0.005, z + inside * (HALF_WIDE + 0.2));
        bars.setMatrixAt(bar, place);
        place.makeScale(0.8, 0.09, 0.09).setPosition(x, 0.01, z - inside * (HALF_WIDE + 0.05));
        banks.setMatrixAt(bar, place);
      } else {
        place.makeScale(0, 0, 0);
        bars.setMatrixAt(bar, place);
        banks.setMatrixAt(bar, place);
      }
    }
    bars.instanceMatrix.needsUpdate = true;
    banks.instanceMatrix.needsUpdate = true;
    // Trees on the plain, wherever the river and its old loop are not.
    for (const [index, [u, v]] of treeSpots.entries()) {
      const x = (u - 0.5) * 2 * (HALF_X - 0.2);
      const z = (v - 0.5) * 2 * (HALF_Z - 0.2);
      // Clear of the river, and of where the sea comes in for the delta.
      const clear = nearRiver(x, z) > HALF_WIDE + 0.35 && x < SEA_X - 0.2;
      const tall = clear ? 0.7 + 0.6 * ((u * 7.3) % 1) : 0;
      place.makeScale(tall, tall, tall).setPosition(x, 0.1 * tall, z);
      trees.setMatrixAt(index, place);
    }
    trees.instanceMatrix.needsUpdate = true;
  };

  /** Places the flowing water, faster along the outside of the bends. */
  const move = (): void => {
    const line = (x: number): number => riverZ(x, grown, cut);
    for (let dot = 0; dot < DOTS; dot++) {
      const lane = (dot % 3) - 1;
      const share = (((dot * 0.137 + time * (0.05 + 0.02 * Math.abs(lane))) % 1) + 1) % 1;
      const x = -HALF_X + share * 2 * HALF_X;
      const z = line(x);
      const curve = line(x + 0.05) + line(x - 0.05) - 2 * z;
      // The outside of the bend is where the line turns away from: there the dots run fastest.
      const outside = curve > 0 ? -1 : 1;
      place.makeTranslation(x, -BED * 0.3, z + lane * outside * HALF_WIDE * 0.6);
      dots.setMatrixAt(dot, place);
    }
    dots.instanceMatrix.needsUpdate = true;
    if (rainfall.visible) rain();
  };

  /** Places the falling rain, the water drying back up, and the water running off. */
  const rain = (): void => {
    const line = (x: number): number => riverZ(x, grown, cut);
    for (const [index, [u, v]] of drops.entries()) {
      const x = (u - 0.5) * 2 * HALF_X * 0.9;
      const z = (v - 0.5) * 2 * HALF_Z * 0.9;
      const fallen = (u * 5.1 + v * 3.7 + time * 1.3) % 1;
      const y = CLOUD_Y - 0.2 - fallen * (CLOUD_Y - 0.2);
      rainPositions.set([x, y, z, x, y - 0.12, z], index * 6);
    }
    (rainGeometry.getAttribute('position') as BufferAttribute).needsUpdate = true;
    for (const [index, [u, v]] of vapourSpots.entries()) {
      const risen = (u * 3.3 + time * 0.25) % 1;
      place.makeTranslation(
        (u - 0.5) * 2 * HALF_X * 0.9,
        0.05 + risen * (CLOUD_Y - 0.5),
        (v - 0.5) * 2 * HALF_Z * 0.9,
      );
      vapour.setMatrixAt(index, place);
    }
    vapour.instanceMatrix.needsUpdate = true;
    // Each bit of runoff starts where it fell and slides across the plain to the river.
    for (const [index, [u, v]] of runoffSpots.entries()) {
      const x = (u - 0.5) * 2 * HALF_X * 0.9;
      const from = (v - 0.5) * 2 * HALF_Z * 0.9;
      const ran = (v * 4.7 + time * 0.3) % 1;
      const z = from + (line(x) - from) * ran;
      place.makeTranslation(x, Math.max(0.02, groundHeight(x, z) + 0.03), z);
      runoff.setMatrixAt(index, place);
    }
    runoff.instanceMatrix.needsUpdate = true;
  };

  /** Draws the moment the settling values have reached. */
  const draw = (): void => {
    const nowCut = grownTo.value >= CUT_AT;
    if (Math.abs(grownTo.value - grown) > 0.002 || nowCut !== cut) {
      grown = grownTo.value;
      cut = nowCut;
      shape();
    }
    const mars = marsTo.value;
    const titan = titanTo.value;
    // The plain soaks up the rain, then turns to Mars, then to Titan.
    groundNow.lerpColors(FOREST, SOAKED, soakedTo.value).lerp(MARS_GROUND, mars);
    groundMaterial.color.copy(groundNow.lerp(TITAN_GROUND, titan));
    liquidNow.lerpColors(WATER, DRY_BED, mars).lerp(TITAN_LIQUID, titan);
    for (const mesh of [water.mesh, oxbow.mesh]) {
      (mesh.material as MeshStandardMaterial).color.copy(liquidNow);
    }
    background.lerpColors(EARTH_SKY, TITAN_SKY, titan);
    sun.color.lerpColors(EARTH_SUN, MARS_SUN, mars).lerp(TITAN_SUN, titan);
    // Life and moving water belong to Earth.
    fadeGroup(dots, 1 - mars);
    fadeGroup(bars, 1 - mars);
    fadeGroup(trees, 1 - mars);
    sandMaterial.emissive.setScalar(0).lerp(INSIDE_GLOW, insideTo.value);
    fadeGroup(banks, outsideTo.value * (1 - mars));
    fadeGroup(rainfall, rainTo.value);
    // The delta, growing over its part: drawn new land, as big as a drawing allows.
    fadeGroup(delta, deltaTo.value);
    if (delta.visible) {
      const built = 0.25 + 0.75 * builtTo.value;
      fan.position.set(SEA_X, SEA_Y + 0.004, riverZ(SEA_X, grown, cut));
      fan.scale.set(1.6 * built, 2.2 * built, 1);
    }
    move();
  };

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },
    bounds: { min: { x: -HALF_X, y: BASE, z: -HALF_Z }, max: { x: HALF_X, y: 0.3, z: HALF_Z } },

    set(jd, picture) {
      board.set(picture);
      const first = Number.isNaN(grownTo.value);
      grownTo.aim(smooth(options.fromJd, options.untilJd, jd));
      insideTo.aim(jd >= options.insideJd && jd < options.fromJd + 1 ? 1 : 0);
      outsideTo.aim(jd >= options.outsideJd && jd < options.insideJd ? 1 : 0);
      // The same plain on Mars, its channel dry, and on Titan, a river of methane.
      marsTo.aim(jd >= options.marsJd ? 1 : 0);
      titanTo.aim(jd >= options.titanJd ? 1 : 0);
      // The rain on the plain, and the ground soaking it up, drying once it stops.
      const raining = jd >= options.rainJd && jd < options.rainUntilJd;
      rainTo.aim(raining ? 1 : 0);
      soakedTo.aim(raining ? 0.3 + 0.7 * smooth(options.rainJd, options.rainUntilJd, jd) : 0);
      deltaTo.aim(jd >= options.deltaJd && jd < options.marsJd ? 1 : 0);
      builtTo.aim(smooth(options.deltaJd, options.marsJd, jd));
      if (first) draw();
    },

    flow(seconds) {
      // Faster still while the outside of the bend is being told.
      time += seconds * (1 + outsideTo.value);
      let moved = false;
      for (const one of settlings) moved = one.step(seconds) || moved;
      if (moved) draw();
      else if (seconds > 0) move();
    },

    viewToggled: () => board.group.visible,

    toggleView() {
      board.group.visible = !board.group.visible;
      diorama.visible = !board.group.visible;
    },

    dispose() {
      for (const side of sideGeometries) side.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
