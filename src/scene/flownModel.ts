import { Box3, DoubleSide, Group, Mesh, Plane, Vector3, type Material } from 'three';
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
  dispose(): void;
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
    },
    dispose() {
      disposed = true;
      group.removeFromParent();
      disposeModel?.();
    },
  };
}
