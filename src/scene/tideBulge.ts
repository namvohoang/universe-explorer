import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from 'three';
import type { Vec3 } from '../sim/vec3';

const SEA_COLOR = 0x3fa7ff;
const SEA_OPACITY = 0.38;
/**
 * The sea is drawn as a shell of water standing off the ground, and its tide as a swelling of
 * that shell: this far off, in radii of the world, where the tide is level, and this much
 * further for a tide of 1 (the strongest raiser's own high tide). Both are drawing choices,
 * and enormous ones: a real tide is far too small to be seen against a whole world.
 */
const SHELL_LIFT = 0.15;
const DRAWN_TIDE = 0.16;
/** How far beyond the world's middle each line towards a raiser is drawn, in radii. */
const LINE_FROM_RADII = 1.5;
const LINE_TO_RADII = 2.1;
const AROUND = 64;
const UP = 32;

/** A world's sea with its tides drawn far bigger than life, and a line towards each raiser. */
export interface TideBulge {
  /** Position this at the world's middle. It does not turn with the world. */
  readonly group: Group;
  /**
   * Shapes the sea round a world of this radius (scene units): `height` gives the tide in
   * each direction (scene axes) and `towards` the direction of each raiser, in the order the
   * lines' colours were given.
   */
  set(radius: number, height: (towards: Vec3) => number, towards: readonly Vec3[]): void;
  dispose(): void;
}

/** `lineColors` are the colours of the lines towards the raisers, one each. */
export function createTideBulge(lineColors: readonly number[]): TideBulge {
  const geometry = new SphereGeometry(1, AROUND, UP);
  const positions = geometry.getAttribute('position') as BufferAttribute;
  // Where each point of the shell lies on a ball of radius 1, kept to shape it from.
  const round = Float32Array.from(positions.array);
  // Not lit by the star: the swelling on the night side must show as well as the one by day.
  const material = new MeshBasicMaterial({
    color: SEA_COLOR,
    transparent: true,
    opacity: SEA_OPACITY,
    depthWrite: false,
  });
  const group = new Group();
  group.add(new Mesh(geometry, material));
  const lines = lineColors.map((color) => {
    const lineGeometry = new BufferGeometry();
    const ends = new BufferAttribute(new Float32Array(6), 3);
    lineGeometry.setAttribute('position', ends);
    const lineMaterial = new LineBasicMaterial({ color });
    const line = new Line(lineGeometry, lineMaterial);
    line.frustumCulled = false;
    group.add(line);
    return { ends, lineGeometry, lineMaterial };
  });

  return {
    group,
    set(radius, height, towards) {
      for (let index = 0; index < positions.count; index++) {
        const x = round[index * 3] ?? 0;
        const y = round[index * 3 + 1] ?? 0;
        const z = round[index * 3 + 2] ?? 0;
        const out = radius * (1 + SHELL_LIFT + DRAWN_TIDE * height({ x, y, z }));
        positions.setXYZ(index, x * out, y * out, z * out);
      }
      positions.needsUpdate = true;
      for (const [index, line] of lines.entries()) {
        const way = towards[index];
        if (!way) continue;
        const far = Math.hypot(way.x, way.y, way.z) || 1;
        const [from, to] = [LINE_FROM_RADII, LINE_TO_RADII].map((radii) => (radius * radii) / far);
        line.ends.setXYZ(0, way.x * (from ?? 0), way.y * (from ?? 0), way.z * (from ?? 0));
        line.ends.setXYZ(1, way.x * (to ?? 0), way.y * (to ?? 0), way.z * (to ?? 0));
        line.ends.needsUpdate = true;
      }
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      for (const line of lines) {
        line.lineGeometry.dispose();
        line.lineMaterial.dispose();
      }
    },
  };
}
