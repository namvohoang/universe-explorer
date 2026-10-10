import {
  Box3,
  BufferAttribute,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
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
   * Stands the model's tail at `tail`, its nose towards `nose` (a unit vector), with its
   * longest side `size` long. Only the stretch between the shares `from` and `to` of its
   * height, tail (0) to nose (1), is drawn: the rest is a stage let go, or the craft that
   * let this stage go.
   */
  place(tail: Vec3, nose: Vec3, size: number, from: number, to: number): void;
  /**
   * How tall the model is, tail to nose, as a share of its longest side: 1 for a rocket,
   * less for a craft wider than it is tall. 1 until the model has arrived.
   */
  tall(): number;
  /**
   * Draws a flame behind what is left of the model, or none. `flicker` is any number that
   * changes as time runs: the flame's length wavers with it.
   */
  setFlame(flame: Flame | null, flicker: number): void;
  /**
   * Draws only the parts of the model, named as in its file, that `shown` says yes to: a
   * part let go is hidden, or a part let go is all that is drawn. `null` draws every part.
   */
  showParts(shown: ((name: string) => boolean) | null): void;
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
 * `url` is an agency's model that stands nose up along its own +y, as a rocket on its pad or
 * a lander on its legs. A model that was made lying some other way (a museum's scan of a
 * craft as it stands on show) is given the direction its nose points in its own file,
 * `noseInModel`. A model that holds more than the craft (two craft joined) is given the
 * `stretch` of its length, tail to nose, that is the craft: only that is ever drawn, and the
 * shares given to `place` are shares of it. The size given to `place` is still the longest
 * side of the whole file. It is fetched at once; until it arrives nothing is drawn.
 */
export function createFlownModel(
  url: string,
  noseInModel?: Vec3,
  stretch?: readonly [from: number, to: number],
): FlownModel {
  const group = new Group();
  const towards = new Vector3();
  // Everything behind the first plane and ahead of the second is left out. The renderer must
  // have local clipping on.
  const cut = new Plane();
  const cutAhead = new Plane();
  const cutAt = new Vector3();
  const back = new Vector3();
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
  let tall = 1;
  /** Each mesh of the model, with the name of the part of the file it belongs to. */
  const parts: { readonly mesh: Object3D; readonly name: string }[] = [];
  let partShown: ((name: string) => boolean) | null = null;
  const showParts = (): void => {
    for (const { mesh, name } of parts) mesh.visible = partShown === null || partShown(name);
  };
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
      parts.push({ mesh: part as Object3D, name: part.name });
      for (const material of [part.material].flat() as Material[]) {
        material.clippingPlanes = [cut, cutAhead];
        // Cut open, a stage is seen into: its inside wall is drawn, not left as a hole.
        material.side = DoubleSide;
      }
    });
    // Turned nose up first, so that it is measured the way it will fly.
    const upright = new Group();
    if (noseInModel) {
      const lies = new Vector3(noseInModel.x, noseInModel.y, noseInModel.z).normalize();
      upright.quaternion.setFromUnitVectors(lies, MODEL_NOSE);
    }
    upright.add(model);
    upright.updateMatrixWorld(true);
    const box = new Box3().setFromObject(upright);
    const size = box.getSize(new Vector3());
    if (disposed || !(size.y > 0)) {
      dispose();
      return;
    }
    // Its longest side one unit long, tail at the middle of the group and nose along +y.
    const middle = box.getCenter(new Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    const [from, to] = stretch ?? [0, 1];
    tall = ((to - from) * size.y) / longest;
    const holder = new Group();
    holder.scale.setScalar(1 / longest);
    upright.position.sub(new Vector3(middle.x, box.min.y + from * size.y, middle.z));
    holder.add(upright);
    group.add(holder);
    showParts();
    disposeModel = dispose;
  });
  return {
    group,
    tall: () => tall,
    place(tail, nose, size, from, to) {
      const length = size * tall;
      group.position.set(tail.x, tail.y, tail.z);
      group.quaternion.setFromUnitVectors(MODEL_NOSE, towards.set(nose.x, nose.y, nose.z));
      group.scale.setScalar(size);
      // A plane for an end that is not cut lies well clear of the model; the ends of a
      // stretch of a larger file are always cut.
      const cutsEnds = stretch !== undefined;
      cutAt
        .copy(group.position)
        .addScaledVector(towards, length * (from > 0 || cutsEnds ? from : -1));
      cut.setFromNormalAndCoplanarPoint(towards, cutAt);
      cutAt.copy(group.position).addScaledVector(towards, length * (to < 1 || cutsEnds ? to : 2));
      cutAhead.setFromNormalAndCoplanarPoint(back.copy(towards).negate(), cutAt);
      // The engines of what is left are where the last part came off.
      flames.position.y = from * tall;
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
    showParts(shown) {
      if (shown === partShown) return;
      partShown = shown;
      showParts();
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
