import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Points,
  PointsMaterial,
} from 'three';
import { bell, seededRandom, type DeepModel } from './model';

/** The picture is sampled at most this many pixels wide; each bright pixel becomes points. */
const SAMPLE_WIDTH = 300;
const MAX_POINTS = 120_000;
/** Pixels darker than this (0–1) are empty sky and get no point. */
const DARK = 0.045;
const HALF_WIDTH = 10;
/** How strongly points crowd into the bright parts (1 would follow brightness evenly). */
const CONTRAST = 2.2;
/** How much each point's colour is brightened over its pixel's. */
const LIFT = 1.25;

export interface CloudOptions {
  /** How thick the cloud is, as a share of its width. A guess: the picture holds no depth. */
  readonly depth: number;
  /** How much thicker the brightest parts are than the faintest (a galaxy's bulge, a nebula's core). */
  readonly bulge: number;
  /** How fast the whole model turns about its own axis, as a galaxy does; 0 for none. */
  readonly spin: number;
  /**
   * `flat` lays the picture down like a disc seen from above (a galaxy); `upright` stands it
   * up like a painting with the depth behind it (a nebula).
   */
  readonly lay: 'flat' | 'upright';
}

function softDot(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/**
 * A 3D cloud of points made from a real picture: every point takes its place across the
 * picture and its colour from the pixel it came from. Only the depth is invented, spread
 * around the picture's plane, thicker where the picture is brighter.
 */
export function createPictureCloud(url: string, options: CloudOptions): DeepModel {
  const group = new Group();
  const geometry = new BufferGeometry();
  const dot = softDot();
  const material = new PointsMaterial({
    size: 0.2,
    opacity: 0.5,
    map: dot,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    // Ordinary blending, not adding light to light: where points pile up they keep the
    // picture's colour instead of burning out to white.
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  const image = new Image();
  image.onload = () => {
    const width = Math.min(SAMPLE_WIDTH, image.naturalWidth);
    const height = Math.max(1, Math.round((width * image.naturalHeight) / image.naturalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;

    const random = seededRandom(width * 7919 + height);
    const positions: number[] = [];
    const colors: number[] = [];
    const scale = (2 * HALF_WIDTH) / width;

    // Bright pixels get far more points than dim ones, so the cloud keeps the picture's shapes.
    const weightOf = (light: number): number => (light < DARK ? 0 : light ** CONTRAST);
    let totalWeight = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      totalWeight += weightOf(
        Math.max(pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0) / 255,
      );
    }
    const pointsPerWeight = totalWeight === 0 ? 0 : MAX_POINTS / totalWeight;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = (pixels[i] ?? 0) / 255;
        const g = (pixels[i + 1] ?? 0) / 255;
        const b = (pixels[i + 2] ?? 0) / 255;
        const light = Math.max(r, g, b);
        const wanted = weightOf(light) * pointsPerWeight;
        const count = Math.floor(wanted) + (random() < wanted % 1 ? 1 : 0);
        for (let n = 0; n < count; n++) {
          const thickness = options.depth * (1 + options.bulge * light * light);
          const across = (x + random() - width / 2) * scale;
          const down = (y + random() - height / 2) * scale;
          const deep = bell(random) * thickness * 2 * HALF_WIDTH;
          if (options.lay === 'flat') positions.push(across, deep, down);
          else positions.push(across, -down, deep);
          // The pixel's own colour, lifted a little: each point is small and see-through.
          colors.push(Math.min(1, r * LIFT), Math.min(1, g * LIFT), Math.min(1, b * LIFT));
        }
      }
    }
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  };
  image.src = url;

  return {
    group,
    radius: HALF_WIDTH,
    note: 'picture-cloud',
    viewFrom: options.lay === 'flat' ? { x: 0, y: 0.8, z: 1 } : { x: 0.35, y: 0.12, z: 1 },
    update(dt) {
      group.rotation.y += options.spin * dt;
    },
    dispose() {
      image.onload = null;
      geometry.dispose();
      material.dispose();
      dot.dispose();
    },
  };
}
