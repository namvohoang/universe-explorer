import {
  Box3,
  BufferAttribute,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Vector3,
  type Material,
} from 'three';
import type { Vec3 } from '../sim/vec3';
import { loadGltf } from './gltf';

/** A craft's 3D model flown along its path at its true size, nose first. */
export interface FlownModel {
  /** Add to the scene. */
  readonly group: Group;
  /**
   * Stands the model's tail at `tail`, its nose towards `nose` (a unit vector), `length` long.
   * `shedBelow` is the share of its length, from the tail, that is left out: a stage let go.
   */
  place(tail: Vec3, nose: Vec3, length: number, shedBelow: number): void;
  /**
   * Draws a flame behind what is left of the model, or none. `flicker` is any number that
   * changes as time runs: the flame's length wavers with it.
   */
  setFlame(flame: Flame | null, flicker: number): void;
  dispose(): void;
}

/** `bright`: the long yellow flame of a kerosene engine. `faint`: the pale one of a hydrogen engine. */
export type Flame = 'bright' | 'faint';

/**
 * How each flame is drawn, in lengths of the whole craft: a glowing cone, hot and pale at
 * the engines and fading to nothing at its tip, with a shorter, whiter one inside it. Every
 * number here is a drawing choice, made to look like photos of a launch, not a measurement.
 */
const FLAMES: Readonly<
  Record<
    Flame,
    {
      readonly long: number;
      readonly wide: number;
      /** How solid it is at the engines, from 0 (not there) to 1. */
      readonly strength: number;
      readonly hot: readonly [number, number, number];
      readonly cool: readonly [number, number, number];
    }
  >
> = {
  bright: { long: 1, wide: 0.07, strength: 0.95, hot: [1, 0.8, 0.3], cool: [1, 0.35, 0.05] },
  faint: { long: 0.35, wide: 0.03, strength: 0.4, hot: [0.75, 0.85, 1], cool: [0.4, 0.55, 1] },
};
/** The inner cone is this share of the outer one's length and width. */
const CORE_SHARE = 0.55;
/** The flame's length wavers by this share of itself. */
const WAVER = 0.07;

/** A cone one unit long and one in radius, its wide end at the origin and its tip at -y. */
function flameCone(): ConeGeometry {
  const geometry = new ConeGeometry(1, 1, 24, 8, true);
  geometry.rotateX(Math.PI);
  geometry.translate(0, -0.5, 0);
  const count = geometry.getAttribute('position').count;
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 4), 4));
  return geometry;
}

/** Colours a cone from `hot` at its wide end to `cool`, thinning to nothing at its tip. */
function colourFlame(
  geometry: ConeGeometry,
  hot: readonly [number, number, number],
  cool: readonly [number, number, number],
  strength: number,
): void {
  const position = geometry.getAttribute('position');
  const colour = geometry.getAttribute('color');
  for (let index = 0; index < position.count; index++) {
    const along = -position.getY(index);
    colour.setXYZW(
      index,
      hot[0] + (cool[0] - hot[0]) * along,
      hot[1] + (cool[1] - hot[1]) * along,
      hot[2] + (cool[2] - hot[2]) * along,
      strength * (1 - along) ** 1.5,
    );
  }
  colour.needsUpdate = true;
}

const MODEL_NOSE = new Vector3(0, 1, 0);

/**
 * `url` is an agency's model that stands nose up along its own +y, as a rocket on its pad.
 * It is fetched at once; until it arrives nothing is drawn.
 */
export function createFlownModel(url: string): FlownModel {
  const group = new Group();
  const towards = new Vector3();
  // Everything behind this plane is left out. The renderer must have local clipping on.
  const cut = new Plane();
  const cutAt = new Vector3();
  const flameMaterial = new MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const outer = new Mesh(flameCone(), flameMaterial);
  const core = new Mesh(flameCone(), flameMaterial);
  const flames = new Group();
  flames.add(outer, core);
  flames.visible = false;
  group.add(flames);
  let drawnFlame: Flame | null = null;
  let disposeModel: (() => void) | null = null;
  let disposed = false;
  loadGltf(url, (model) => {
    const dispose = (): void => {
      model.traverse((part) => {
        if (part instanceof Mesh) {
          (part.geometry as { dispose(): void }).dispose();
          for (const material of [part.material].flat() as Material[]) material.dispose();
        }
      });
    };
    model.traverse((part) => {
      if (!(part instanceof Mesh)) return;
      for (const material of [part.material].flat() as Material[]) {
        material.clippingPlanes = [cut];
        // Cut open, a stage is seen into: its inside wall is drawn, not left as a hole.
        material.side = DoubleSide;
      }
    });
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    if (disposed || !(size.y > 0)) {
      dispose();
      return;
    }
    // One unit long, tail at the middle of the group and the long axis along +y.
    const middle = box.getCenter(new Vector3());
    const holder = new Group();
    holder.scale.setScalar(1 / size.y);
    model.position.sub(new Vector3(middle.x, box.min.y, middle.z));
    holder.add(model);
    group.add(holder);
    disposeModel = dispose;
  });
  return {
    group,
    place(tail, nose, length, shedBelow) {
      group.position.set(tail.x, tail.y, tail.z);
      group.quaternion.setFromUnitVectors(MODEL_NOSE, towards.set(nose.x, nose.y, nose.z));
      group.scale.setScalar(length);
      // Whole, the plane lies a little behind the tail and cuts nothing.
      const from = shedBelow > 0 ? shedBelow : -1;
      cutAt.copy(group.position).addScaledVector(towards, length * from);
      cut.setFromNormalAndCoplanarPoint(towards, cutAt);
      // The engines of what is left are where the last part came off.
      flames.position.y = shedBelow;
    },
    setFlame(flame, flicker) {
      flames.visible = flame !== null;
      if (flame === null) return;
      const { long, wide, strength, hot, cool } = FLAMES[flame];
      if (flame !== drawnFlame) {
        drawnFlame = flame;
        colourFlame(outer.geometry, hot, cool, strength);
        colourFlame(core.geometry, [1, 1, 1], hot, strength);
      }
      const now = long * (1 + WAVER * Math.sin(flicker));
      outer.scale.set(wide, now, wide);
      core.scale.set(wide * CORE_SHARE, now * CORE_SHARE, wide * CORE_SHARE);
    },
    dispose() {
      disposed = true;
      group.removeFromParent();
      outer.geometry.dispose();
      core.geometry.dispose();
      flameMaterial.dispose();
      disposeModel?.();
    },
  };
}
