import {
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** A star pattern as it is seen: which way each star lies, how bright it is, and the lines joined. */
export interface SkyFigure {
  readonly stars: readonly { readonly towards: Vec3; readonly magnitude: number }[];
  readonly lines: readonly (readonly [number, number])[];
}

const STAR_COLOR = 0xffffff;
const LINE_COLOR = 0x6fd3ff;
const LINE_OPACITY = 0.22;
/** A star of magnitude 0 is drawn this many pixels across, and each magnitude fainter this much smaller. */
const BRIGHT_PIXELS = 5;
const PIXELS_PER_MAGNITUDE = 0.8;
const FAINTEST_PIXELS = 1.5;

/** The pixels a star is drawn across: brighter stars (lower magnitude) are bigger. */
export function starPixels(magnitude: number): number {
  return Math.max(FAINTEST_PIXELS, BRIGHT_PIXELS - PIXELS_PER_MAGNITUDE * magnitude);
}

/**
 * Star patterns drawn as a backdrop very far off in the directions they are seen in, for a
 * look at the sky from a world. Put `group` at that world. A dot's size says how bright the
 * star is; it is not the star's size.
 */
export function createSkyFigures(
  figures: readonly SkyFigure[],
  far: number,
): { readonly group: Group; dispose(): void } {
  const group = new Group();
  const disposables: { dispose(): void }[] = [];
  // One set of dots for each size, since a set is drawn at one size.
  const bySize = new Map<number, number[]>();
  const joined: number[] = [];
  for (const figure of figures) {
    for (const { towards, magnitude } of figure.stars) {
      const size = Math.round(starPixels(magnitude) * 2) / 2;
      const list = bySize.get(size) ?? [];
      list.push(towards.x * far, towards.y * far, towards.z * far);
      bySize.set(size, list);
    }
    for (const [a, b] of figure.lines) {
      const from = figure.stars[a]?.towards;
      const to = figure.stars[b]?.towards;
      if (!from || !to) continue;
      joined.push(from.x * far, from.y * far, from.z * far, to.x * far, to.y * far, to.z * far);
    }
  }
  for (const [size, places] of bySize) {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(places), 3));
    const material = new PointsMaterial({
      color: STAR_COLOR,
      size,
      sizeAttenuation: false,
      depthWrite: false,
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);
    disposables.push(geometry, material);
  }
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(joined), 3));
  const lineMaterial = new LineBasicMaterial({
    color: LINE_COLOR,
    transparent: true,
    opacity: LINE_OPACITY,
    depthWrite: false,
  });
  const lines = new LineSegments(lineGeometry, lineMaterial);
  lines.frustumCulled = false;
  group.add(lines);
  disposables.push(lineGeometry, lineMaterial);
  return {
    group,
    dispose() {
      for (const part of disposables) part.dispose();
    },
  };
}
