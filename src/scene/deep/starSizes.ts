import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { colorFromTemperature } from '../../sim/stars';
import { createLabel, disposeLabel } from './label';
import { createStarSurface } from './starSurface';
import { loadGltf } from '../gltf';
import { createSunGlow, createSunSurface } from '../sunSurface';
import type { DeepModel } from './model';

export interface SizedStar {
  readonly name: string;
  /** Radius next to the Sun's. */
  readonly radiusInSuns: number;
  readonly temperatureK: number;
  /**
   * For the Sun: where its own 3D model is served from. It is then drawn as in the Solar System
   * view, so that a kid meets the same Sun in both places.
   */
  readonly modelUrl?: string | null;
}

/** The biggest star is drawn this many scene units across its radius. */
const BIGGEST = 5;
const GAP = 1.2;
const FRAMING = 1.7;
/** How far out from the middle of the glow picture the star's own edge sits. */
const EDGE = 0.36;
/** Below this drawn radius a star is only a speck, so a ring marks where it is. */
const SMALLEST_VISIBLE = 0.08;
const MARKER_SIZE = 0.6;

/** A number from a star's name, so each star keeps its own made-up patches wherever it is shown. */
function seedOf(name: string): number {
  let sum = 0;
  for (const letter of name) sum = (sum * 31 + (letter.codePointAt(0) ?? 0)) % 997;
  return sum / 10;
}

function glowTexture(): CanvasTexture {
  const size = 128;
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
    // The glow starts at the star's edge (EDGE of the way out) so it never hides the face.
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(EDGE * 0.96, 'rgba(255,255,255,0)');
    gradient.addColorStop(EDGE, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

function ringTexture(): CanvasTexture {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    context.strokeStyle = '#6fd3ff';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    context.stroke();
  }
  return new CanvasTexture(canvas);
}

/**
 * Stars side by side at their true sizes next to each other, each the colour its temperature
 * gives it. The gaps between them are not real: they are lined up to be compared.
 */
export function createStarSizes(stars: readonly SizedStar[]): DeepModel {
  const group = new Group();
  const glow = glowTexture();
  const ring = ringTexture();
  const surfaces: { flow(seconds: number): void }[] = [];
  const disposers: (() => void)[] = [
    () => {
      glow.dispose();
      ring.dispose();
    },
  ];
  const largest = Math.max(...stars.map((star) => star.radiusInSuns));
  const unitsPerSun = BIGGEST / largest;
  const radii = stars.map((star) => star.radiusInSuns * unitsPerSun);
  const width = radii.reduce((sum, r) => sum + 2 * r, 0) + GAP * (stars.length - 1);

  let x = -width / 2;
  stars.forEach((star, n) => {
    const radius = radii[n] ?? 0;
    const tint = colorFromTemperature(star.temperatureK);
    const color = new Color().setRGB(tint.r, tint.g, tint.b, SRGBColorSpace);
    x += radius;

    const geometry = new SphereGeometry(radius, 48, 32);
    // Each star's face is grained to suit its own size and temperature.
    const surface = createStarSurface(
      color,
      star.radiusInSuns,
      star.temperatureK,
      seedOf(star.name),
    );
    surfaces.push(surface);
    const ball = new Mesh(geometry, surface.material);
    ball.position.set(x, 0, 0);
    group.add(ball);

    if (star.modelUrl) {
      // The Sun as the Solar System view shows it: NASA's model with its details drawn over.
      const frame = new Group();
      frame.position.copy(ball.position);
      frame.scale.setScalar(radius);
      group.add(frame);
      const sunSurface = createSunSurface();
      sunSurface.setRadius(radius);
      frame.add(sunSurface.group);
      surfaces.push(sunSurface);
      const sunGlow = createSunGlow();
      frame.add(sunGlow);
      let gone = false;
      loadGltf(star.modelUrl, (model) => {
        if (gone) return;
        const box = new Box3().setFromObject(model);
        const size = box.getSize(new Vector3());
        const reach = Math.max(size.x, size.y, size.z) / 2;
        if (!(reach > 0)) return;
        const holder = new Group();
        holder.scale.setScalar(1 / reach);
        model.position.sub(box.getCenter(new Vector3()));
        holder.add(model);
        frame.add(holder);
        sunSurface.dress(model, frame);
        // The plain ball has done its job of standing in.
        ball.visible = false;
        disposers.push(() => {
          model.traverse((part) => {
            if (part instanceof Mesh) (part.geometry as { dispose(): void }).dispose();
          });
        });
      });
      disposers.push(() => {
        gone = true;
        sunGlow.material.map?.dispose();
        sunGlow.material.dispose();
        sunSurface.dispose();
      });
    }

    const haloMaterial = new SpriteMaterial({
      map: glow,
      color,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    const halo = new Sprite(haloMaterial);
    halo.position.copy(ball.position);
    halo.scale.setScalar((radius * 2) / EDGE);
    // The Sun's model brings its own glow.
    if (!star.modelUrl) group.add(halo);

    // A star too small to see at this size gets a ring round it, like the markers elsewhere.
    if (radius < SMALLEST_VISIBLE) {
      const ringMaterial = new SpriteMaterial({ map: ring, depthWrite: false, transparent: true });
      const marker = new Sprite(ringMaterial);
      marker.position.copy(ball.position);
      marker.scale.setScalar(MARKER_SIZE);
      group.add(marker);
      disposers.push(() => {
        ringMaterial.dispose();
      });
    }

    const label = createLabel(star.name, 0.7);
    label.position.set(x, -Math.max(radius, 0.4) - 0.9, 0);
    group.add(label);

    disposers.push(() => {
      geometry.dispose();
      surface.dispose();
      haloMaterial.dispose();
      disposeLabel(label);
    });
    x += radius + GAP;
  });

  return {
    group,
    // Room round the row for the names under the stars.
    radius: Math.max(width / 2, BIGGEST) * FRAMING,
    note: 'star-sizes',
    viewFrom: { x: 0, y: 0.15, z: 1 },
    update(dt) {
      // The stars stand still to be compared; only the gas on their faces churns.
      for (const surface of surfaces) surface.flow(dt);
    },
    dispose() {
      for (const dispose of disposers) dispose();
    },
  };
}
