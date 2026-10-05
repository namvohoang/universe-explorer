import type { Group } from 'three';

/**
 * Loads a 3D model file and hands over its scene. The loader and its decoder are fetched only
 * when the first model is asked for, so they are not part of what the app downloads to start.
 * The larger models are stored compressed (meshopt); the decoder ships with the app.
 */
export function loadGltf(url: string, onLoad: (scene: Group) => void): void {
  void Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]).then(([{ GLTFLoader }, { MeshoptDecoder }]) => {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, (gltf) => {
      onLoad(gltf.scene);
    });
  });
}
