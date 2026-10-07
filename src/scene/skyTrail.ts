import { BufferAttribute, BufferGeometry, Group, Line, LineBasicMaterial } from 'three';
import type { Vec3 } from '../sim/vec3';

/** The way ahead is faint, in the colour of the orbit lines; the way gone is bright. */
const AHEAD_COLOR = 0x6fd3ff;
const AHEAD_OPACITY = 0.25;
const GONE_COLOR = 0xffc53d;

/** The track a body makes across the sky of another, as a line very far off in each direction it was seen in. */
export interface SkyTrail {
  /** Position this at the body the sky is seen from. */
  readonly group: Group;
  /** Lights the track up to a date. */
  setDate(jd: number): void;
  dispose(): void;
}

/**
 * `sights` are the dates the body was seen at, earliest first, each with the unit direction it
 * was seen in; `far` is how far off the line is drawn, in scene units: beyond everything else.
 */
export function createSkyTrail(
  sights: readonly { readonly jd: number; readonly towards: Vec3 }[],
  far: number,
): SkyTrail {
  const positions = new BufferAttribute(new Float32Array(sights.length * 3), 3);
  for (const [index, { towards }] of sights.entries()) {
    positions.setXYZ(index, towards.x * far, towards.y * far, towards.z * far);
  }
  const aheadGeometry = new BufferGeometry();
  aheadGeometry.setAttribute('position', positions);
  const goneGeometry = new BufferGeometry();
  goneGeometry.setAttribute('position', positions);
  const aheadMaterial = new LineBasicMaterial({
    color: AHEAD_COLOR,
    transparent: true,
    opacity: AHEAD_OPACITY,
    depthWrite: false,
  });
  const goneMaterial = new LineBasicMaterial({ color: GONE_COLOR, depthWrite: false });
  const group = new Group();
  for (const line of [
    new Line(aheadGeometry, aheadMaterial),
    new Line(goneGeometry, goneMaterial),
  ]) {
    line.frustumCulled = false;
    group.add(line);
  }
  return {
    group,
    setDate(jd) {
      let count = 0;
      while (count < sights.length && (sights[count]?.jd ?? Infinity) <= jd) count++;
      goneGeometry.setDrawRange(0, count);
    },
    dispose() {
      aheadGeometry.dispose();
      goneGeometry.dispose();
      aheadMaterial.dispose();
      goneMaterial.dispose();
    },
  };
}
