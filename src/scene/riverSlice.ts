import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';
import { addBlockSides, placeBoard, smooth } from './diorama';
import { createPictureBoard, type PictureBoardOptions } from './pictureBoard';

/**
 * A 3D close-up of a winding river on a flat plain, cut open like a model:
 * 1. Water running faster along the outside of each bend, its bank there worn away.
 * 2. Sand building on the inside of each bend.
 * 3. As the years go by, the bends growing and sliding down the valley; one loop growing until
 *    the river cuts through its narrow neck, leaving the loop behind as a crescent-shaped lake.
 * 4. Then the same plain as Mars, its river channel long dry, and as Titan, its river of methane
 *    under an orange sky.
 * 5. With its button, the real picture from space of that moment in place of the drawing.
 *
 * Everything here is a drawing.
 */
const BACKGROUND = '#0a1020';
const FOREST = new Color('#3f7a3a');
const MARS_GROUND = new Color('#b4643c');
const TITAN_GROUND = new Color('#7a5a2a');
const WATER = new Color('#9c7a52');
const TITAN_LIQUID = new Color('#2a2a30');
const DRY_BED = new Color('#7a3c22');
const SAND = 0xe2cf9c;
const FAST = 0xffd8a8;

const HALF_X = 6;
const HALF_Z = 3.6;
const BASE = -0.35;
const STEPS = 320;
/** The river's half-width, and how deep its channel is cut. */
const HALF_WIDE = 0.18;
const BED = 0.05;
const DOTS = 90;

export interface RiverSliceOptions {
  /** When the close-up stresses the bend's outside and inside, as Julian dates. */
  readonly outsideJd: number;
  readonly insideJd: number;
  /** The years the river is drawn changing over: from the first picture to the last. */
  readonly fromJd: number;
  readonly untilJd: number;
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
  const background = new Color(BACKGROUND);
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
  const bars = new InstancedMesh(keep(new SphereGeometry(1, 16, 8)), sandMaterial, 8);
  diorama.add(bars);

  // Water flowing down the river, faster along the outside of the bends.
  const dots = new InstancedMesh(
    keep(new SphereGeometry(0.045, 6, 4)),
    keep(new MeshBasicMaterial({ color: FAST })),
    DOTS,
  );
  diorama.add(dots);

  // The real picture from space, in place of the drawing, with the button.
  const board = keep(createPictureBoard(options.pictures));
  board.group.visible = false;
  scene.add(board.group);

  const target = { x: 0.3, y: 0, z: 0.2 };
  const direction = new Vector3(0.1, 1.6, 1).normalize();
  const distance = 9.5;
  placeBoard(board, target, direction, distance);

  let grown = -1;
  let cut = false;
  let time = 0;
  let stress: 'outside' | 'inside' | null = null;
  const place = new Matrix4();

  /** Reshapes the plain, the river, the old loop and the sand for `grown`. */
  const shape = (): void => {
    const line = (x: number): number => riverZ(x, grown, cut);
    groundHeight = (x, z) => {
      const near = Math.min(
        Math.abs(z - line(x)),
        cut && x > 0 && x < 3.4 ? Math.abs(z - oxbowZ(x)) : Infinity,
      );
      return -BED * smooth(HALF_WIDE * 1.6, HALF_WIDE * 0.6, near);
    };
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
    // Sand where each bend turns, on its inside.
    for (let bar = 0; bar < 8; bar++) {
      const x = -HALF_X + 0.7 + bar * 1.5;
      const z = line(x);
      const curve = line(x + 0.05) + line(x - 0.05) - 2 * z;
      const inside = curve > 0 ? 1 : -1;
      place.makeScale(0.45, 0.025, 0.2).setPosition(x, 0.005, z + inside * (HALF_WIDE + 0.12));
      bars.setMatrixAt(bar, place);
    }
    bars.instanceMatrix.needsUpdate = true;
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
  };

  return {
    scene,
    target,
    distance,
    direction: { x: direction.x, y: direction.y, z: direction.z },

    set(jd, picture) {
      board.set(picture);
      const nowGrown = smooth(options.fromJd, options.untilJd, jd);
      const nowCut = nowGrown >= CUT_AT;
      if (Math.abs(nowGrown - grown) > 0.002 || nowCut !== cut) {
        grown = nowGrown;
        cut = nowCut;
        shape();
      }
      stress =
        jd >= options.insideJd && jd < options.fromJd + 1
          ? 'inside'
          : jd >= options.outsideJd && jd < options.insideJd
            ? 'outside'
            : null;
      sandMaterial.emissive.set(stress === 'inside' ? 0x5a4a20 : 0);
      dots.visible = jd < options.marsJd;
      // The same plain on Mars, its channel dry, and on Titan, a river of methane.
      const world = jd >= options.titanJd ? 'titan' : jd >= options.marsJd ? 'mars' : 'earth';
      groundMaterial.color.copy(
        world === 'titan' ? TITAN_GROUND : world === 'mars' ? MARS_GROUND : FOREST,
      );
      const liquid = world === 'titan' ? TITAN_LIQUID : WATER;
      for (const mesh of [water.mesh, oxbow.mesh]) {
        const material = mesh.material as MeshStandardMaterial;
        material.color.copy(world === 'mars' ? DRY_BED : liquid);
      }
      bars.visible = world === 'earth';
      background.set(world === 'titan' ? '#6a4a20' : BACKGROUND);
      sun.color.set(world === 'titan' ? 0xffb060 : world === 'mars' ? 0xffe0c0 : 0xfff2dc);
      move();
    },

    flow(seconds) {
      // Faster still while the outside of the bend is being told.
      time += seconds * (stress === 'outside' ? 2 : 1);
      if (seconds > 0) move();
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
