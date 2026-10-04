import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const BACKGROUND = '#05070f';
const MAX_PIXEL_RATIO = 2;

export interface Stage {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  resize(width: number, height: number): void;
  render(): void;
}

/** The empty stage every scene is drawn on: renderer, camera and a dark sky. */
export function createStage(canvas: HTMLCanvasElement, pixelRatio: number): Stage {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(pixelRatio, MAX_PIXEL_RATIO));

  const scene = new Scene();
  scene.background = new Color(BACKGROUND);

  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);

  return {
    scene,
    camera,
    resize(width, height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    render() {
      renderer.render(scene, camera);
    },
  };
}
