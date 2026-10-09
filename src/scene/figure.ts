import { Box3, Group, Mesh, Vector3, type Material } from 'three';
import { loadGltf } from './gltf';

/**
 * Somebody standing on the ground beside a craft: an agency's 3D model of a person, stood
 * upright with its feet on the ground. Built in km with +y straight up, to go where a
 * launch site goes; the figure is `tallKm` tall and is moved to where it stands by its
 * `position`. It is fetched at once and is not drawn until told to be.
 */
export function createFigure(
  url: string,
  tallKm: number,
): { readonly figure: Group; dispose(): void } {
  const figure = new Group();
  figure.visible = false;
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
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    if (disposed || !(size.y > 0)) {
      dispose();
      return;
    }
    const middle = box.getCenter(new Vector3());
    const holder = new Group();
    holder.scale.setScalar(tallKm / size.y);
    model.position.sub(new Vector3(middle.x, box.min.y, middle.z));
    holder.add(model);
    figure.add(holder);
    disposeModel = dispose;
  });
  return {
    figure,
    dispose() {
      disposed = true;
      figure.removeFromParent();
      disposeModel?.();
    },
  };
}
