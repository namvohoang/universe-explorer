import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineLoop } from 'three';
import type { CelestialObject } from '../data/types';
import { sceneOrbitPath } from '../sim/layout';
import type { Scale } from '../sim/scale';

const SEGMENTS = 256;
/** The prototype's orbit colour: a faint sky blue that stays behind the bodies. */
const COLOR = 0x6fd3ff;
const OPACITY = 0.28;
/**
 * An orbit's shape changes slowly, so its line is redrawn only when the date has moved this far.
 * In a day the fastest-changing orbit here (the Moon's) turns by a twentieth of a degree.
 */
const REDRAW_AFTER_DAYS = 1;

/** The path one object's orbit traces, drawn from the same elements that move the object. */
export interface OrbitLine {
  readonly objectId: string;
  readonly parentId: string;
  /** Position this at the parent: the path is drawn around it. */
  readonly line: LineLoop;
  /** Redraws the path for a date if it has moved on enough, or always when `force` is set. */
  update(jd: number, scale: Scale, force: boolean): void;
  dispose(): void;
}

export function createOrbitLine(
  object: CelestialObject,
  catalogue: readonly CelestialObject[],
): OrbitLine {
  if (!object.orbit || object.parentId === null) {
    throw new Error(`${object.id} has no orbit to draw`);
  }
  const positions = new BufferAttribute(new Float32Array(SEGMENTS * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  const material = new LineBasicMaterial({
    color: COLOR,
    transparent: true,
    opacity: OPACITY,
    depthWrite: false,
  });
  const line = new LineLoop(geometry, material);
  line.name = `${object.id}-orbit`;
  // The path's bounds change as it is redrawn; it is cheap enough never to cull.
  line.frustumCulled = false;

  let drawnAt: number | null = null;
  return {
    objectId: object.id,
    parentId: object.parentId,
    line,
    update(jd, scale, force) {
      if (!force && drawnAt !== null && Math.abs(jd - drawnAt) < REDRAW_AFTER_DAYS) return;
      // The path closes on itself, so its last point repeats the first; LineLoop closes it.
      const path = sceneOrbitPath(object, catalogue, jd, scale, SEGMENTS);
      for (let i = 0; i < SEGMENTS; i++) {
        const point = path[i];
        if (point) positions.setXYZ(i, point.x, point.y, point.z);
      }
      positions.needsUpdate = true;
      drawnAt = jd;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
