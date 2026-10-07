import { Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Vec3 } from '../sim/vec3';
import {
  ZOOM_SECONDS,
  followTarget,
  heldAtDistance,
  heldOnBearing,
  startFlight,
  stepFlight,
  zoomedDistance,
  type Flight,
  type View,
} from './flight';
import { USUAL_NEAR, nearPlaneFor, pixelsFor } from './projection';
import { createFrameWatch, lowerPixelRatio } from './quality';

const BACKGROUND = '#05070f';
const MAX_PIXEL_RATIO = 2;
/** How wide the camera sees, top to bottom, unless a view asks to look closer. */
export const FIELD_OF_VIEW_DEG = 50;
/** Longest step fed to the simulation, so a stalled tab does not jump on return. */
const MAX_FRAME_SECONDS = 0.05;
/** Degrees per second-ish, in OrbitControls' own unit; the prototype's gentle idle turn. */
const AUTO_ROTATE_SPEED = 0.25;
const DAMPING = 0.08;
const ZOOM_SPEED = 2;

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
  /** How long the move takes; the usual flight time when left out. */
  readonly seconds?: number;
  /**
   * A bearing from the target to the camera that is asked for every frame. The camera is held
   * on it after arriving, so it cannot be dragged round; zooming still works.
   */
  readonly bearing?: () => Vec3;
  /**
   * A distance from the target that is asked for every frame. The camera is held at it after
   * arriving, so it backs away as the thing looked at grows; zooming is then of no use.
   */
  readonly distanceNow?: () => number;
  /**
   * A place for the camera itself that is asked for every frame. The camera is held there
   * after arriving and only turns to follow the target, like a telescope on a stand.
   */
  readonly standAt?: () => Vec3;
}

/** A part of the screen, in CSS pixels from its top-left. */
export interface PaneBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Two looks at the same scene drawn at once: the camera that is flown and dragged draws in
 * `main`, and a second one, which only follows what it looks at, draws in `side`.
 */
export interface Panes {
  readonly main: PaneBox;
  readonly side: PaneBox;
  /** Where the second camera looks, in scene units. Called every frame. */
  readonly target: () => Vec3;
  /** How far from it the second camera stands, and on which bearing from it, asked every frame. */
  readonly distance: number;
  readonly direction: () => Vec3;
  /** What the second camera draws, when it is not the scene the first one draws. */
  readonly scene?: Scene;
}

/** Where a point of the scene lands on screen. */
export interface ScreenPoint {
  /** CSS pixels from the top-left of the view. */
  readonly x: number;
  readonly y: number;
  /** False when the point is behind the camera or outside the view. */
  readonly visible: boolean;
  /** How many CSS pixels one scene unit covers at that point. */
  readonly pixelsPerUnit: number;
  /** Distance from the camera, in scene units. */
  readonly distance: number;
}

export interface Stage {
  /**
   * Narrows or widens what the camera sees, like a zoom lens: the viewer stays where they are.
   * Pass `FIELD_OF_VIEW_DEG` to put it back.
   */
  setFieldOfView(degrees: number): void;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  /**
   * Draws everything this many CSS pixels higher than the middle of the screen, for when a
   * panel covers the bottom of it, and this many to the right, for when one covers the left.
   * 0 and 0 put the middle back.
   */
  setLift(pixelsUp: number, pixelsRight?: number): void;
  /**
   * Draws two looks side by side, each in its own part of the screen; `null` goes back to one
   * that fills it. With two, the lift is not used: each is drawn in the middle of its part.
   */
  setPanes(panes: Panes | null): void;
  /** Has the camera draw another scene in place of the stage's own; `null` puts that back. */
  setScene(scene: Scene | null): void;
  /** Width over height of the view, for choosing camera distances. */
  aspect(): number;
  /** Projects a scene position onto the screen, e.g. to place a label over a body. */
  toScreen(position: Vec3): ScreenPoint;
  /** The same through the second camera; nothing is visible while there is only one look. */
  toSideScreen(position: Vec3): ScreenPoint;
  flyTo(request: FlyTo): void;
  /** Jumps there without a flight, e.g. for the first frame. */
  lookAt(request: FlyTo): void;
  /** Moves the camera towards (factor below 1) or away from what it is looking at. */
  zoom(factor: number): void;
  /**
   * Starts or stops the slow turn round what the camera is looking at. Asked for outright by
   * the viewer, so it turns even under reduced motion; flying somewhere else stops it.
   */
  setTurning(on: boolean): void;
  /** Registers work to do before each frame is drawn; `dt` is real seconds since the last. */
  onFrame(callback: (dt: number) => void): void;
  /** Registers work to do once the camera has moved for the frame, e.g. placing labels. */
  onCameraMoved(callback: () => void): void;
  /**
   * Registers work to do before the second look is drawn, with where its camera is. It runs
   * after the first look is drawn, so it may turn things to face the second camera.
   */
  onSideMoved(callback: (viewer: Vec3) => void): void;
  resize(width: number, height: number): void;
  start(): void;
  dispose(): void;
}

const toVec3 = (v: { x: number; y: number; z: number }): Vec3 => ({ x: v.x, y: v.y, z: v.z });

/** The stage every scene is drawn on: renderer, camera, drag-to-look controls and fly-to. */
export function createStage(canvas: HTMLCanvasElement, options: StageOptions): Stage {
  // Distances span a factor of millions between a planet's surface and the edge of the
  // system, more than an ordinary depth buffer can order correctly.
  const renderer = new WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
  let pixelRatio = Math.min(options.pixelRatio, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);
  // On a device that cannot keep up, draw less sharply instead of stuttering.
  const watch = createFrameWatch();

  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  renderer.setClearColor(BACKGROUND);

  const camera = new PerspectiveCamera(FIELD_OF_VIEW_DEG, 1, USUAL_NEAR, 1e6);
  camera.position.set(0, 30, 60);

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = !options.reducedMotion;
  controls.dampingFactor = DAMPING;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
  // A wheel notch or pinch moves further than the default: scenes span huge distances.
  controls.zoomSpeed = ZOOM_SPEED;

  const frameCallbacks: ((dt: number) => void)[] = [];
  const cameraCallbacks: (() => void)[] = [];
  const sideCallbacks: ((viewer: Vec3) => void)[] = [];
  const sideCamera = new PerspectiveCamera(FIELD_OF_VIEW_DEG, 1, USUAL_NEAR, 1e6);
  let panes: Panes | null = null;
  let otherScene: Scene | null = null;
  let following: FlyTo | null = null;
  let flight: Flight | null = null;
  let previousTarget: Vec3 | null = null;
  let lastTime: number | null = null;
  let viewWidth = 1;
  let viewHeight = 1;
  let lift = 0;
  let shift = 0;
  /** Looks through a window slid down the picture, so what is in the middle is drawn higher up. */
  const applyLift = (): void => {
    camera.aspect = panes ? panes.main.width / panes.main.height : viewWidth / viewHeight;
    if (panes || (lift === 0 && shift === 0)) camera.clearViewOffset();
    else camera.setViewOffset(viewWidth, viewHeight, -shift, lift, viewWidth, viewHeight);
    camera.updateProjectionMatrix();
  };
  const projected = new Vector3();
  const whole = (): PaneBox => ({ x: 0, y: 0, width: viewWidth, height: viewHeight });
  const project = (position: Vec3, through: PerspectiveCamera, box: PaneBox): ScreenPoint => {
    projected.set(position.x, position.y, position.z);
    const distance = projected.distanceTo(through.position);
    projected.project(through);
    const inView =
      projected.z > -1 &&
      projected.z < 1 &&
      Math.abs(projected.x) <= 1 &&
      Math.abs(projected.y) <= 1;
    return {
      x: box.x + (projected.x * 0.5 + 0.5) * box.width,
      y: box.y + (-projected.y * 0.5 + 0.5) * box.height,
      visible: inView,
      pixelsPerUnit: pixelsFor(1, distance, through.fov, box.height),
      distance,
    };
  };
  /** Puts the second camera where its look says, facing what it looks at. */
  const moveSideCamera = (look: Panes): void => {
    const target = look.target();
    const { distance } = look;
    const direction = look.direction();
    const far = Math.hypot(direction.x, direction.y, direction.z) || 1;
    sideCamera.position.set(
      target.x + (direction.x / far) * distance,
      target.y + (direction.y / far) * distance,
      target.z + (direction.z / far) * distance,
    );
    sideCamera.lookAt(target.x, target.y, target.z);
    sideCamera.aspect = look.side.width / look.side.height;
    sideCamera.near = nearPlaneFor(distance);
    sideCamera.updateProjectionMatrix();
    sideCamera.updateMatrixWorld();
  };
  /** Draws through one camera into one part of the screen; the renderer counts up from the bottom. */
  const drawIn = (box: PaneBox, through: PerspectiveCamera, what: Scene): void => {
    const fromBottom = viewHeight - box.y - box.height;
    renderer.setViewport(box.x, fromBottom, box.width, box.height);
    renderer.setScissor(box.x, fromBottom, box.width, box.height);
    renderer.render(what, through);
  };

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
      request.seconds,
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
      const followed = followTarget(currentView(), previousTarget, target);
      const stood = following.standAt ? { camera: following.standAt(), target } : followed;
      const turned = following.bearing ? heldOnBearing(stood, following.bearing()) : stood;
      applyView(following.distanceNow ? heldAtDistance(turned, following.distanceNow()) : turned);
    }
    previousTarget = target;
  };

  const frame = (time: number): void => {
    const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, MAX_FRAME_SECONDS);
    if (lastTime !== null && watch.add(time - lastTime)) {
      const lower = lowerPixelRatio(pixelRatio);
      if (lower !== pixelRatio) {
        pixelRatio = lower;
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(viewWidth, viewHeight, false);
      }
    }
    lastTime = time;
    for (const callback of frameCallbacks) callback(dt);
    moveCamera(dt);
    controls.update(dt);
    // Close in on something tiny, and it must not be cut away for being too near the camera.
    const near = nearPlaneFor(camera.position.distanceTo(controls.target));
    if (near !== camera.near) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    for (const callback of cameraCallbacks) callback();
    if (!panes) {
      renderer.render(otherScene ?? scene, camera);
      return;
    }
    // The screen outside the two parts is wiped too, or it would keep what was last drawn there.
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, viewWidth, viewHeight);
    renderer.clear();
    renderer.setScissorTest(true);
    drawIn(panes.main, camera, otherScene ?? scene);
    moveSideCamera(panes);
    for (const callback of sideCallbacks) callback(toVec3(sideCamera.position));
    drawIn(panes.side, sideCamera, panes.scene ?? scene);
  };

  // Nothing is drawn while the page is out of sight; time does not jump on the way back.
  let started = false;
  const onVisibility = (): void => {
    if (!started) return;
    lastTime = null;
    renderer.setAnimationLoop(document.hidden ? null : frame);
  };

  return {
    scene,
    camera,
    aspect: () => camera.aspect,
    setLift(pixelsUp, pixelsRight = 0) {
      if (pixelsUp === lift && pixelsRight === shift) return;
      lift = pixelsUp;
      shift = pixelsRight;
      applyLift();
    },
    setFieldOfView(degrees) {
      if (camera.fov === degrees) return;
      camera.fov = degrees;
      camera.updateProjectionMatrix();
    },
    setPanes(next) {
      const split = next !== null;
      if (split !== (panes !== null)) {
        renderer.setScissorTest(split);
        if (!split) renderer.setViewport(0, 0, viewWidth, viewHeight);
      }
      panes = next;
      applyLift();
    },
    setScene(next) {
      otherScene = next;
    },
    toScreen: (position) => project(position, camera, panes?.main ?? whole()),
    toSideScreen(position) {
      if (!panes) return { x: 0, y: 0, visible: false, pixelsPerUnit: 0, distance: 0 };
      return project(position, sideCamera, panes.side);
    },
    flyTo: (request) => {
      begin(request, false);
    },
    lookAt: (request) => {
      begin(request, true);
      moveCamera(0);
    },
    zoom(factor) {
      if (!following || flight) return;
      const view = currentView();
      const offset = {
        x: view.camera.x - view.target.x,
        y: view.camera.y - view.target.y,
        z: view.camera.z - view.target.z,
      };
      const distance = Math.hypot(offset.x, offset.y, offset.z);
      if (distance === 0) return;
      const { minDistance, maxDistance } = following;
      flight = startFlight(
        view,
        following.target(),
        zoomedDistance(distance, factor, minDistance, maxDistance),
        offset,
        options.reducedMotion,
        ZOOM_SECONDS,
      );
      controls.enabled = false;
    },
    setTurning(on) {
      controls.autoRotate = on;
    },
    onFrame: (callback) => {
      frameCallbacks.push(callback);
    },
    onCameraMoved: (callback) => {
      cameraCallbacks.push(callback);
    },
    onSideMoved: (callback) => {
      sideCallbacks.push(callback);
    },
    resize(width, height) {
      viewWidth = width;
      viewHeight = height;
      renderer.setSize(width, height, false);
      applyLift();
    },
    start() {
      started = true;
      if (!document.hidden) renderer.setAnimationLoop(frame);
      document.addEventListener('visibilitychange', onVisibility);
    },
    dispose() {
      started = false;
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
    },
  };
}
