import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Vec3 } from '../sim/vec3';
import { followTarget, startFlight, stepFlight, type Flight, type View } from './flight';

const BACKGROUND = '#05070f';
const MAX_PIXEL_RATIO = 2;
const FIELD_OF_VIEW_DEG = 50;
/** Longest step fed to the simulation, so a stalled tab does not jump on return. */
const MAX_FRAME_SECONDS = 0.05;
/** Degrees per second-ish, in OrbitControls' own unit; the prototype's gentle idle turn. */
const AUTO_ROTATE_SPEED = 0.25;
const DAMPING = 0.08;

export interface StageOptions {
  readonly pixelRatio: number;
  /** From `prefers-reduced-motion`: instant camera moves and no idle turning. */
  readonly reducedMotion: boolean;
}

export interface FlyTo {
  /** Where the thing is now, in scene units. Called every frame, so it can be moving. */
  readonly target: () => Vec3;
  readonly distance: number;
  /** Bearing from the target to the camera; `null` keeps the present one. */
  readonly direction: Vec3 | null;
  /** How close and how far the kid may zoom afterwards. */
  readonly minDistance: number;
  readonly maxDistance: number;
  /** Turn slowly around the target when idle (ignored with reduced motion). */
  readonly idleTurn: boolean;
}

export interface Stage {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  /** Width over height of the view, for choosing camera distances. */
  aspect(): number;
  flyTo(request: FlyTo): void;
  /** Jumps there without a flight, e.g. for the first frame. */
  lookAt(request: FlyTo): void;
  /** Registers work to do before each frame is drawn; `dt` is real seconds since the last. */
  onFrame(callback: (dt: number) => void): void;
  resize(width: number, height: number): void;
  start(): void;
  dispose(): void;
}

const toVec3 = (v: { x: number; y: number; z: number }): Vec3 => ({ x: v.x, y: v.y, z: v.z });

/** The stage every scene is drawn on: renderer, camera, drag-to-look controls and fly-to. */
export function createStage(canvas: HTMLCanvasElement, options: StageOptions): Stage {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(options.pixelRatio, MAX_PIXEL_RATIO));

  const scene = new Scene();
  scene.background = new Color(BACKGROUND);

  const camera = new PerspectiveCamera(FIELD_OF_VIEW_DEG, 1, 0.01, 100_000);
  camera.position.set(0, 30, 60);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = !options.reducedMotion;
  controls.dampingFactor = DAMPING;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;

  const frameCallbacks: ((dt: number) => void)[] = [];
  let following: FlyTo | null = null;
  let flight: Flight | null = null;
  let previousTarget: Vec3 | null = null;
  let lastTime: number | null = null;

  const currentView = (): View => ({
    camera: toVec3(camera.position),
    target: toVec3(controls.target),
  });

  const applyView = (view: View): void => {
    camera.position.set(view.camera.x, view.camera.y, view.camera.z);
    controls.target.set(view.target.x, view.target.y, view.target.z);
  };

  const arrive = (request: FlyTo): void => {
    controls.enabled = true;
    controls.minDistance = request.minDistance;
    controls.maxDistance = request.maxDistance;
    controls.autoRotate = request.idleTurn && !options.reducedMotion;
  };

  const begin = (request: FlyTo, instant: boolean): void => {
    following = request;
    const target = request.target();
    flight = startFlight(
      currentView(),
      target,
      request.distance,
      request.direction,
      instant || options.reducedMotion,
    );
    previousTarget = target;
    // Hands off while flying, and no zoom limit to fight the move.
    controls.enabled = false;
    controls.autoRotate = false;
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
  };

  const moveCamera = (dt: number): void => {
    if (!following) return;
    const target = following.target();
    if (flight) {
      const step = stepFlight(flight, dt, target);
      applyView(step.view);
      flight = step.flight;
      if (!flight) arrive(following);
    } else if (previousTarget) {
      applyView(followTarget(currentView(), previousTarget, target));
    }
    previousTarget = target;
  };

  const frame = (time: number): void => {
    const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, MAX_FRAME_SECONDS);
    lastTime = time;
    for (const callback of frameCallbacks) callback(dt);
    moveCamera(dt);
    controls.update(dt);
    renderer.render(scene, camera);
  };

  return {
    scene,
    camera,
    aspect: () => camera.aspect,
    flyTo: (request) => {
      begin(request, false);
    },
    lookAt: (request) => {
      begin(request, true);
      moveCamera(0);
    },
    onFrame: (callback) => {
      frameCallbacks.push(callback);
    },
    resize(width, height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    start() {
      renderer.setAnimationLoop(frame);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
    },
  };
}
