import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from 'three';
import { colorFromTemperature } from '../../sim/stars';
import { createLabel, disposeLabel } from './label';
import type { DeepModel } from './model';

export interface SizedStar {
  readonly name: string;
  /** Radius next to the Sun's. */
  readonly radiusInSuns: number;
  readonly temperatureK: number;
}

/** The biggest star is drawn this many scene units across its radius. */
const BIGGEST = 5;
const GAP = 1.2;
const FRAMING = 1.7;
/** Below this drawn radius a star is only a speck, so a ring marks where it is. */
const SMALLEST_VISIBLE = 0.08;
const MARKER_SIZE = 0.6;

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
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.34, 'rgba(255,255,255,0.5)');
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
    const color = new Color(tint.r, tint.g, tint.b);
    x += radius;

    const geometry = new SphereGeometry(radius, 48, 32);
    const material = new MeshBasicMaterial({ color });
    const ball = new Mesh(geometry, material);
    ball.position.set(x, 0, 0);
    group.add(ball);

    const haloMaterial = new SpriteMaterial({
      map: glow,
      color,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    const halo = new Sprite(haloMaterial);
    halo.position.copy(ball.position);
    halo.scale.setScalar(radius * 5.5);
    group.add(halo);

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
      material.dispose();
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
    update() {
      // The stars only stand for comparison.
    },
    dispose() {
      for (const dispose of disposers) dispose();
    },
  };
}
