import type { BufferGeometry } from 'three';
import {
  Box3,
  BufferAttribute,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Quaternion,
  Vector3,
  type Material,
  type Object3D,
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
  place(
    tail: Vec3,
    nose: Vec3,
    size: number,
    from: number,
    to: number,
    belly?: { readonly inModel: Vec3; readonly towards: Vec3 },
  ): void;
  /**
   * How tall the model is, tail to nose, as a share of its longest side: 1 for a rocket,
   * less for a craft wider than it is tall. 1 until the model has arrived.
   */
  tall(): number;
  /**
   * Draws the flames its engines make, or none: each under the part of the model's file it
   * names (one under each piece of that part), or else behind what is left of the model.
   * `flicker` is any number that changes as time runs: the flames' length wavers with it.
   */
  setFlames(
    flames: readonly { readonly flame: Flame; readonly under?: string }[],
    flicker: number,
  ): void;
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
/** A flame under a part is centred on what lies in this share of its height at the bottom: its nozzles. A drawing choice. */
const NOZZLE_SHARE = 0.03;

/**
 * `url` is an agency's model that stands nose up along its own +y, as a rocket on its pad or
 * a lander on its legs. A model that was made lying some other way (a museum's scan of a
 * craft as it stands on show) is given the direction its nose points in its own file,
 * `noseInModel`. A model that holds more than the craft (two craft joined) is given the
 * `stretch` of its length, tail to nose, that is the craft: only that is ever drawn, and the
 * shares given to `place` are shares of it. The size given to `place` is still the longest
 * side of the whole file. `place` may be given which way the model's belly faces in its file
 * (`inModel`) and the way it is to face (`towards`): the model is turned about its length
 * until it does. It is fetched at once; until it arrives nothing is drawn.
 */
export function createFlownModel(
  url: string,
  noseInModel?: Vec3,
  stretch?: readonly [from: number, to: number],
): FlownModel {
  const group = new Group();
  const towards = new Vector3();
  const bellyNow = new Vector3();
  const bellyWanted = new Vector3();
  const across = new Vector3();
  const roll = new Quaternion();
  /** How the file is turned to stand nose up: its belly turns with it. */
  const standUp = new Quaternion();
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
  /** A flame: an outer cone and an inner one, coloured for the kind it last was. */
  interface DrawnFlame {
    readonly cones: Group;
    readonly outer: Mesh<ConeGeometry, MeshBasicMaterial>;
    readonly core: Mesh<ConeGeometry, MeshBasicMaterial>;
    kind: Flame | null;
  }
  const drawnFlames: DrawnFlame[] = [];
  const flameNumber = (index: number): DrawnFlame => {
    const made = drawnFlames[index];
    if (made) return made;
    const outer = new Mesh(flameCone(), flameMaterial);
    const core = new Mesh(flameCone(), flameMaterial);
    const cones = new Group();
    cones.add(outer, core);
    group.add(cones);
    const flame: DrawnFlame = { cones, outer, core, kind: null };
    drawnFlames.push(flame);
    return flame;
  };
  /** Where the engines of what is left are, along its length: where the last part came off. */
  let tailY = 0;
  /** Under each piece of a named part of the file: the middle of its bottom, in the group's units. */
  const partBottoms = new Map<string, Vector3[]>();
  let tall = 1;
  /** Each mesh of the model, with the name of the part of the file it belongs to. */
  const parts: { readonly mesh: Object3D; readonly name: string }[] = [];
  /** Each named piece of the file that holds a mesh: two boosters are two pieces of one part. */
  const pieces = new Map<Object3D, string>();
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
    /** The part of the file a mesh belongs to: the nearest node above it, or itself, with a name. */
    const partOf = (mesh: Object3D): string => {
      for (let node: Object3D | null = mesh; node && node !== model; node = node.parent) {
        const name: unknown = node.userData.name;
        if (typeof name === 'string' && name !== '') {
          pieces.set(node, name);
          return name;
        }
      }
      return mesh.name;
    };
    model.traverse((part) => {
      if (!(part instanceof Mesh)) return;
      parts.push({ mesh: part as Object3D, name: partOf(part) });
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
      standUp.copy(upright.quaternion);
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
    // The bottom of each named piece, in the group's own units, for a flame drawn under it:
    // measured on its corners themselves (a box turned with the craft would be too big), and
    // centred on what is at the very bottom, its nozzles.
    group.updateMatrixWorld(true);
    const toGroup = group.matrixWorld.clone().invert();
    for (const [piece, name] of pieces) {
      const corners: Vector3[] = [];
      piece.traverse((part) => {
        if (!(part instanceof Mesh)) return;
        const position = (part.geometry as BufferGeometry).getAttribute('position');
        const inGroup = toGroup.clone().multiply(part.matrixWorld);
        for (let index = 0; index < position.count; index++) {
          corners.push(new Vector3().fromBufferAttribute(position, index).applyMatrix4(inGroup));
        }
      });
      if (corners.length === 0) continue;
      const lowest = Math.min(...corners.map((corner) => corner.y));
      const highest = Math.max(...corners.map((corner) => corner.y));
      const bottom = new Box3().setFromPoints(
        corners.filter((corner) => corner.y <= lowest + NOZZLE_SHARE * (highest - lowest)),
      );
      const centre = bottom.getCenter(new Vector3());
      const bottoms = partBottoms.get(name) ?? [];
      bottoms.push(new Vector3(centre.x, lowest, centre.z));
      partBottoms.set(name, bottoms);
    }
    showParts();
    disposeModel = dispose;
  });
  return {
    group,
    tall: () => tall,
    place(tail, nose, size, from, to, belly) {
      const length = size * tall;
      group.position.set(tail.x, tail.y, tail.z);
      group.quaternion.setFromUnitVectors(MODEL_NOSE, towards.set(nose.x, nose.y, nose.z));
      if (belly) {
        // Turned about its length until its belly, as it now faces, faces the way wanted.
        bellyNow
          .set(belly.inModel.x, belly.inModel.y, belly.inModel.z)
          .applyQuaternion(standUp)
          .applyQuaternion(group.quaternion);
        bellyWanted.set(belly.towards.x, belly.towards.y, belly.towards.z);
        const angle = Math.atan2(
          towards.dot(across.copy(bellyNow).cross(bellyWanted)),
          bellyNow.dot(bellyWanted),
        );
        group.quaternion.premultiply(roll.setFromAxisAngle(towards, angle));
      }
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
      tailY = from * tall;
    },
    setFlames(burning, flicker) {
      let used = 0;
      for (const { flame, under } of burning) {
        const { long, wide, strength, hot, cool } = FLAMES[flame];
        const now = long * (1 + WAVER * Math.sin(flicker));
        const at = under === undefined ? [null] : (partBottoms.get(under) ?? []);
        for (const bottom of at) {
          const drawn = flameNumber(used++);
          if (drawn.kind !== flame) {
            drawn.kind = flame;
            colourFlame(drawn.outer.geometry, hot, cool, strength);
            colourFlame(drawn.core.geometry, [1, 1, 1], hot, strength);
          }
          drawn.cones.visible = true;
          if (bottom) drawn.cones.position.copy(bottom);
          else drawn.cones.position.set(0, tailY, 0);
          drawn.outer.scale.set(wide, now, wide);
          drawn.core.scale.set(wide * CORE_SHARE, now * CORE_SHARE, wide * CORE_SHARE);
        }
      }
      for (const unused of drawnFlames.slice(used)) unused.cones.visible = false;
    },
    showParts(shown) {
      if (shown === partShown) return;
      partShown = shown;
      showParts();
    },
    dispose() {
      disposed = true;
      group.removeFromParent();
      for (const { outer, core } of drawnFlames) {
        outer.geometry.dispose();
        core.geometry.dispose();
      }
      flameMaterial.dispose();
      disposeModel?.();
    },
  };
}
