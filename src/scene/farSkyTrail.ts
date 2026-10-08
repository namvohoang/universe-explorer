import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three';
import type { Vec3 } from '../sim/vec3';

/** The colour of the track in the look at the sky, so the two are seen to be the same thing. */
const COLOR = 0xffc53d;

/**
 * The track the end of a line of sight leaves on a far sky drawn in the whole picture: it
 * grows as the story plays, from the first place the thing was seen to where it is seen now.
 */
export interface FarSkyTrail {
  readonly line: Line;
  /** Draws the track up to a date, ending at `end`: where the line of sight ends now. */
  setDate(jd: number, end: Vec3): void;
  dispose(): void;
}

/** `ends` are where the line of sight ended at each date, earliest first, in scene units. */
export function createFarSkyTrail(
  ends: readonly { readonly jd: number; readonly at: Vec3 }[],
): FarSkyTrail {
  // One more place than the dates: the end of the moment, between two of them.
  const positions = new BufferAttribute(new Float32Array((ends.length + 1) * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setDrawRange(0, 0);
  const material = new LineBasicMaterial({ color: COLOR, depthTest: false });
  const line = new Line(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 4;
  return {
    line,
    setDate(jd, end) {
      let count = 0;
      while (count < ends.length && (ends[count]?.jd ?? Infinity) <= jd) {
        const at = ends[count]?.at;
        if (at) positions.setXYZ(count, at.x, at.y, at.z);
        count++;
      }
      positions.setXYZ(count, end.x, end.y, end.z);
      positions.needsUpdate = true;
      geometry.setDrawRange(0, count + 1);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
