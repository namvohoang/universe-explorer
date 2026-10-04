import { AdditiveBlending, CanvasTexture, Color, Group, Sprite, SpriteMaterial } from 'three';
import type { ClusterStar } from '../../data/types';
import { clusterLayout, colorFromTemperature, temperatureFromBpRp } from '../../sim/stars';
import type { DeepModel } from './model';

const RADIUS = 10;
/** Drawn size of a star by its brightness: each magnitude fainter is a step smaller. */
const BRIGHTEST_SIZE = 1.5;
const SIZE_PER_MAGNITUDE = 0.16;
const SMALLEST_SIZE = 0.22;

function starDot(): CanvasTexture {
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
    gradient.addColorStop(0.18, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/**
 * A star cluster built from measurements: every dot is a real star, placed in 3D from where
 * it is on the sky and how far away its parallax says it is, sized by how bright it is and
 * tinted by its colour.
 */
export function createStarCluster(stars: readonly ClusterStar[]): DeepModel {
  const group = new Group();
  const dot = starDot();
  const { offsets, radiusPc } = clusterLayout(stars);
  const unitsPerPc = radiusPc > 0 ? RADIUS / radiusPc : 1;
  const brightest = Math.min(...stars.map((star) => star[3]));
  const materials: SpriteMaterial[] = [];

  stars.forEach(([, , , magnitude, bpRp], n) => {
    const offset = offsets[n];
    if (!offset) return;
    const tint = colorFromTemperature(temperatureFromBpRp(bpRp));
    const material = new SpriteMaterial({
      map: dot,
      color: new Color(tint.r, tint.g, tint.b),
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    materials.push(material);
    const sprite = new Sprite(material);
    // Sky axes (z to the north) become scene axes (y up).
    sprite.position.set(offset.x * unitsPerPc, offset.z * unitsPerPc, -offset.y * unitsPerPc);
    sprite.scale.setScalar(
      Math.max(SMALLEST_SIZE, BRIGHTEST_SIZE - SIZE_PER_MAGNITUDE * (magnitude - brightest)),
    );
    group.add(sprite);
  });

  return {
    group,
    radius: RADIUS,
    note: 'cluster',
    viewFrom: { x: 0.4, y: 0.3, z: 1 },
    update() {
      // Nothing moves: at this scale the stars' own motion takes thousands of years to show.
    },
    dispose() {
      for (const material of materials) material.dispose();
      dot.dispose();
    },
  };
}
