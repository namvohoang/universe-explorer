import { AmbientLight, Box3, DirectionalLight, Group, Mesh, Sphere, type Material } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { DeepModel } from './model';

const RADIUS = 10;
/** The model is kept a little inside the framed space, so a tall rocket clears the top bar. */
const FILL = 0.8;
/** Lit from one side like sunlight, with enough fill to see the shaded side. */
const SUNLIGHT = 2.6;
const FILL_LIGHT = 0.5;

/**
 * A spacecraft shown by itself, to be turned round and looked at: the agency's own 3D model,
 * with no path, because it is no longer flying or its path is not one the app draws.
 */
export function createCraftModel(modelUrl: string, scan: boolean): DeepModel {
  const group = new Group();
  const sun = new DirectionalLight(0xffffff, SUNLIGHT);
  sun.position.set(1, 0.6, 0.8);
  group.add(sun, new AmbientLight(0xffffff, FILL_LIGHT));

  let disposeModel: (() => void) | null = null;
  let disposed = false;
  // The larger models are stored compressed (meshopt); the decoder ships with the app.
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(modelUrl, (gltf) => {
    const model = gltf.scene;
    const dispose = (): void => {
      model.traverse((part) => {
        if (part instanceof Mesh) {
          (part.geometry as { dispose(): void }).dispose();
          for (const material of [part.material].flat() as Material[]) material.dispose();
        }
      });
    };
    const bounds = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
    if (disposed || !(bounds.radius > 0)) {
      dispose();
      return;
    }
    const holder = new Group();
    holder.scale.setScalar((RADIUS * FILL) / bounds.radius);
    model.position.sub(bounds.center);
    holder.add(model);
    group.add(holder);
    disposeModel = dispose;
  });

  return {
    group,
    radius: RADIUS,
    note: scan ? 'craft-scan' : 'craft-model',
    viewFrom: { x: 0.7, y: 0.35, z: 1 },
    update() {
      // The model only stands to be looked at.
    },
    dispose() {
      disposed = true;
      disposeModel?.();
    },
  };
}
