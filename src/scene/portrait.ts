import { AmbientLight, DirectionalLight, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import type { CelestialObject, RingSystem, SpheroidShape, TriaxialShape } from '../data/types';
import { eclipticToScene, northPoleEcliptic, poleOf } from '../sim/frames';
import { largestRadiusKm } from '../sim/layout';
import { portraitFrame, portraitView, type PortraitFrame } from '../sim/portrait';
import { createScale } from '../sim/scale';
import { add, normalize, scale as scaleVec, type Vec3 } from '../sim/vec3';
import { createBody, type Body } from './body';

/** One body to draw, and the canvas its picture goes on. */
export interface Sitter {
  readonly object: CelestialObject;
  readonly shape: SpheroidShape | TriaxialShape;
  readonly rings: RingSystem | null;
  readonly canvas: HTMLCanvasElement;
  /** Drawn width of the body itself at its widest, in CSS pixels. Rings reach beyond it. */
  readonly widthPixels: number;
}

/** A picture sharper than this costs memory a phone does not have, for nothing the eye sees. */
const MAX_PIXEL_RATIO = 2;
/**
 * Drawing choices. The light stands in for the Sun: beside the eye, a little to the left and
 * above, so a body shows its round shape and keeps most of its face lit.
 */
const SUNLIGHT = 2.8;
const NIGHT_SIDE_LIGHT = 0.12;
const LIGHT_FROM = { toEye: 0.75, left: 0.55, above: 0.35 };
/** How far off the eye and the light stand, in radii of the frame: only has to clear the rings. */
const STAND_OFF = 10;

interface Sitting {
  readonly sitter: Sitter;
  readonly body: Body;
  readonly scene: Scene;
  readonly camera: OrthographicCamera;
  readonly frame: PortraitFrame;
  readonly pixelsPerUnit: number;
}

function northOf(shape: SpheroidShape | TriaxialShape): Vec3 | null {
  const pole = poleOf(shape.orientation);
  return pole ? eclipticToScene(northPoleEcliptic(pole)) : null;
}

function seat(sitter: Sitter): Sitting {
  const { object, shape, rings } = sitter;
  // Sizes go through a scale mode like everywhere else; the camera then frames what it made.
  const body = createBody(object, shape, createScale('true-sizes'), rings, null);
  const radius = body.radius();
  const north = northOf(shape);
  const ringOuter = rings
    ? radius * (rings.shape.outerRadiusKm.value / largestRadiusKm(shape))
    : null;
  const view = portraitView(north);
  const frame = portraitFrame(view, radius, north, ringOuter);
  const reach = Math.max(frame.halfWidth, frame.halfHeight);

  const camera = new OrthographicCamera(
    -frame.halfWidth,
    frame.halfWidth,
    frame.halfHeight,
    -frame.halfHeight,
    reach,
    reach * (2 * STAND_OFF - 1),
  );
  const eye = scaleVec(view.toEye, reach * STAND_OFF);
  camera.position.set(eye.x, eye.y, eye.z);
  camera.up.set(view.up.x, view.up.y, view.up.z);
  camera.lookAt(0, 0, 0);

  const towardsSun = normalize(
    add(
      add(scaleVec(view.toEye, LIGHT_FROM.toEye), scaleVec(view.right, -LIGHT_FROM.left)),
      scaleVec(view.up, LIGHT_FROM.above),
    ),
  );
  const sun = scaleVec(towardsSun, reach * STAND_OFF);
  const light = new DirectionalLight(0xffffff, SUNLIGHT);
  light.position.set(sun.x, sun.y, sun.z);

  const scene = new Scene();
  scene.add(body.group, light, new AmbientLight(0xffffff, NIGHT_SIDE_LIGHT));
  body.setSunPosition(sun);
  return { sitter, body, scene, camera, frame, pixelsPerUnit: sitter.widthPixels / (2 * radius) };
}

/**
 * Draws each body on its canvas as it really is: its own surface, its flattening, its tilt and
 * its rings, lit from one side. All of them are drawn at once and again as each surface map
 * arrives; after the last one nothing is kept running. Each canvas is given the size its
 * picture needs. Returns `false`, having drawn nothing, where the browser cannot draw in 3D.
 */
export function drawPortraits(sitters: readonly Sitter[]): boolean {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true });
  } catch {
    return false;
  }
  const pixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const sittings = sitters.map(seat);
  for (const { sitter, frame, pixelsPerUnit } of sittings) {
    const width = 2 * frame.halfWidth * pixelsPerUnit;
    const height = 2 * frame.halfHeight * pixelsPerUnit;
    sitter.canvas.style.width = `${width.toFixed(1)}px`;
    sitter.canvas.style.height = `${height.toFixed(1)}px`;
    sitter.canvas.width = Math.max(1, Math.round(width * pixelRatio));
    sitter.canvas.height = Math.max(1, Math.round(height * pixelRatio));
  }

  const draw = ({ sitter, scene, camera }: Sitting): void => {
    const { canvas } = sitter;
    renderer.setSize(canvas.width / pixelRatio, canvas.height / pixelRatio, false);
    renderer.render(scene, camera);
    const paper = canvas.getContext('2d');
    if (!paper) return;
    paper.clearRect(0, 0, canvas.width, canvas.height);
    paper.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
  };

  let waiting = sittings.length;
  const finish = (): void => {
    for (const { body } of sittings) body.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  for (const sitting of sittings) draw(sitting);
  for (const sitting of sittings) {
    sitting.body.loadMap(() => {
      draw(sitting);
      waiting -= 1;
      if (waiting === 0) finish();
    });
  }
  if (sittings.length === 0) finish();
  return true;
}
