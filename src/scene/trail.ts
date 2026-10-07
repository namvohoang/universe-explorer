import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Points,
  PointsMaterial,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** The way ahead is faint, in the colour of the orbit lines; the way flown is bright. */
const AHEAD_COLOR = 0x6fd3ff;
const AHEAD_OPACITY = 0.3;
const FLOWN_COLOR = 0xffc53d;
/** The craft is a point of light of one size on screen: at true scale it is far too small to see. */
const CRAFT_PIXELS = 9;

/** A spacecraft's tracked path, with the part flown so far lit up and the craft a point on it. */
export interface Trail {
  /** Position this at the body the path is measured from. */
  readonly group: Group;
  /** Draws the path with a way of turning a place into scene units from the centre. */
  draw(toScene: (place: Vec3) => Vec3): void;
  /** The farthest the drawn path gets from its centre, in scene units. */
  reach(): number;
  /** Lights the path up to a date and puts the craft at `offset` from the centre. */
  setDate(jd: number, offset: Vec3): void;
  dispose(): void;
}

/**
 * `instants` are the dates the path is drawn at, earliest first, close together where it bends;
 * `placeAt` says where the craft is at a date, in whatever units `draw` is given a way to turn
 * into scene units.
 */
export function createTrail(instants: readonly number[], placeAt: (jd: number) => Vec3): Trail {
  const positions = new BufferAttribute(new Float32Array(instants.length * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  const aheadMaterial = new LineBasicMaterial({
    color: AHEAD_COLOR,
    transparent: true,
    opacity: AHEAD_OPACITY,
    depthWrite: false,
  });
  const flownMaterial = new LineBasicMaterial({ color: FLOWN_COLOR });
  const ahead = new Line(geometry, aheadMaterial);
  // The same points again, drawn only as far as the craft has got.
  const flownGeometry = new BufferGeometry();
  flownGeometry.setAttribute('position', positions);
  const flown = new Line(flownGeometry, flownMaterial);

  const craftPosition = new BufferAttribute(new Float32Array(3), 3);
  const craftGeometry = new BufferGeometry();
  craftGeometry.setAttribute('position', craftPosition);
  const craftMaterial = new PointsMaterial({
    color: FLOWN_COLOR,
    size: CRAFT_PIXELS,
    sizeAttenuation: false,
  });
  const craft = new Points(craftGeometry, craftMaterial);

  const group = new Group();
  for (const part of [ahead, flown, craft]) {
    // The path's bounds change as it is redrawn; it is cheap enough never to cull.
    part.frustumCulled = false;
    group.add(part);
  }

  let reach = 0;
  return {
    group,
    reach: () => reach,
    draw(toScene) {
      reach = 0;
      for (const [index, jd] of instants.entries()) {
        const place = toScene(placeAt(jd));
        reach = Math.max(reach, Math.hypot(place.x, place.y, place.z));
        positions.setXYZ(index, place.x, place.y, place.z);
      }
      positions.needsUpdate = true;
    },
    setDate(jd, offset) {
      let count = 0;
      while (count < instants.length && (instants[count] ?? Infinity) <= jd) count++;
      flownGeometry.setDrawRange(0, count);
      craftPosition.setXYZ(0, offset.x, offset.y, offset.z);
      craftPosition.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      flownGeometry.dispose();
      craftGeometry.dispose();
      aheadMaterial.dispose();
      flownMaterial.dispose();
      craftMaterial.dispose();
    },
  };
}
