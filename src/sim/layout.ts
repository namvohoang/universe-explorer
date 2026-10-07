import type { BodyShape, CelestialObject, OrbitalElements } from '../data/types';
import { orbitStateAt } from './elements';
import { eclipticToScene, orbitFrameToEcliptic, orbitNormal, poleOf, type Pole } from './frames';
import { orbitPath, positionFromState } from './kepler';
import type { Scale } from './scale';
import { add, length, normalize, scale as scaleVec, type Vec3 } from './vec3';

/** The longest radius of a solid body, in km: what its size is judged by. */
export function largestRadiusKm(shape: BodyShape): number {
  return shape.type === 'spheroid' ? shape.equatorialRadiusKm.value : shape.radiiKm.value[0];
}

/** The longest radius of an object, in km, or `null` if it is not a solid body. */
export function bodyRadiusKm(object: CelestialObject): number | null {
  const { shape } = object;
  if (shape?.type === 'spheroid' || shape?.type === 'triaxial' || shape?.type === 'model') {
    return largestRadiusKm(shape);
  }
  return null;
}

/**
 * The drawn half-widths of a body along its own axes: `x` and `z` in its equator, `y` pole to
 * pole. For a moon that keeps one face to its planet, `x` is the axis that points at the planet.
 */
export interface SceneAxes {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Size on screen for a solid body. Its proportions are always the real ones, even in a mode
 * that compresses sizes: the scale sets the longest radius and the others follow their ratio.
 */
export function sceneAxes(shape: BodyShape, scale: Scale): SceneAxes {
  const longestKm = largestRadiusKm(shape);
  const longest = scale.sizeToScene(longestKm);
  if (shape.type === 'spheroid') {
    return { x: longest, y: longest * (shape.polarRadiusKm.value / longestKm), z: longest };
  }
  const [, along, polar] = shape.radiiKm.value;
  return { x: longest, y: longest * (polar / longestKm), z: longest * (along / longestKm) };
}

/** The radius an orbit is compressed against: its parent's longest radius, in km. */
function parentRadiusKm(parent: CelestialObject): number {
  const radius = bodyRadiusKm(parent);
  if (radius === null) {
    throw new Error(`${parent.id} has bodies in orbit but no solid shape to scale them by`);
  }
  return radius;
}

/**
 * The pole a moon's equator-based elements are measured from: the one its planet spins
 * anticlockwise about. For a planet the IAU calls retrograde (Venus, Uranus) that is the opposite
 * end from its IAU north pole.
 */
function parentPole(parent: CelestialObject): Pole | null {
  if (!parent.shape || !('orientation' in parent.shape)) return null;
  const pole = poleOf(parent.shape.orientation);
  if (!pole || parent.shape.orientation.rotation !== 'retrograde') return pole;
  return { raDeg: (pole.raDeg + 180) % 360, decDeg: -pole.decDeg };
}

function requireParent(
  object: CelestialObject,
  byId: ReadonlyMap<string, CelestialObject>,
): CelestialObject {
  const parent = object.parentId === null ? undefined : byId.get(object.parentId);
  if (!parent) throw new Error(`${object.id} has an orbit but no parent in the catalogue`);
  return parent;
}

/**
 * Where an object is relative to its parent, in km, in the ecliptic frame: its orbit evaluated at
 * a date and turned out of whatever frame its elements are given in.
 */
export function eclipticOffsetKm(
  object: CelestialObject,
  catalogue: readonly CelestialObject[],
  jd: number,
): Vec3 {
  if (!object.orbit) throw new Error(`${object.id} has no orbit`);
  const parent = requireParent(object, new Map(catalogue.map((o) => [o.id, o])));
  const position = positionFromState(orbitStateAt(object.orbit, jd));
  return orbitFrameToEcliptic(position, object.orbit.frame, parentPole(parent));
}

/** A point of an orbit (km, in the elements' frame) as an offset from the parent, in scene units. */
function toSceneOffset(
  pointKm: Vec3,
  orbit: OrbitalElements,
  parent: CelestialObject,
  scale: Scale,
): Vec3 {
  const ecliptic = orbitFrameToEcliptic(pointKm, orbit.frame, parentPole(parent));
  const distanceKm = length(ecliptic);
  if (distanceKm === 0) return { x: 0, y: 0, z: 0 };
  const sceneDistance = scale.distanceToScene(distanceKm, parentRadiusKm(parent));
  return scaleVec(eclipticToScene(ecliptic), sceneDistance / distanceKm);
}

/**
 * A place given in km from a body's centre, in the ecliptic frame, as an offset from that body
 * in scene units: the same scaling that places everything that goes round it.
 */
export function sceneOffsetFromKm(offsetKm: Vec3, centre: CelestialObject, scale: Scale): Vec3 {
  const distanceKm = length(offsetKm);
  if (distanceKm === 0) return { x: 0, y: 0, z: 0 };
  const sceneDistance = scale.distanceToScene(distanceKm, parentRadiusKm(centre));
  return scaleVec(eclipticToScene(offsetKm), sceneDistance / distanceKm);
}

/** Where a body is at a date, in km from its parent in the ecliptic frame, when it is tracked. */
export type TrackedOffsets = ReadonlyMap<string, (jd: number) => Vec3>;

/**
 * Where every object is at a date, in scene units. An object with no orbit sits at its
 * parent's position, or at the origin when it has no parent. A body in `tracked` is put where
 * its track says, in place of where its orbit would put it.
 */
export function scenePositions(
  catalogue: readonly CelestialObject[],
  jd: number,
  scale: Scale,
  tracked?: TrackedOffsets,
): Map<string, Vec3> {
  const byId = new Map(catalogue.map((object) => [object.id, object]));
  const positions = new Map<string, Vec3>();

  const place = (object: CelestialObject): Vec3 => {
    const known = positions.get(object.id);
    if (known) return known;
    let position: Vec3 = { x: 0, y: 0, z: 0 };
    const track = tracked?.get(object.id);
    if (track && object.parentId !== null) {
      const parent = requireParent(object, byId);
      position = add(place(parent), sceneOffsetFromKm(track(jd), parent, scale));
    } else if (object.orbit) {
      const parent = requireParent(object, byId);
      const state = orbitStateAt(object.orbit, jd);
      const offset = toSceneOffset(positionFromState(state), object.orbit, parent, scale);
      position = add(place(parent), offset);
    } else if (object.parentId !== null) {
      position = place(requireParent(object, byId));
    }
    positions.set(object.id, position);
    return position;
  };

  for (const object of catalogue) place(object);
  return positions;
}

/**
 * The path an object's orbit traces at a date, as a closed loop of offsets from its parent's
 * position, in scene units. Each point goes through the same elements and the same scaling
 * that place the body, so the body always sits on its path.
 */
export function sceneOrbitPath(
  object: CelestialObject,
  catalogue: readonly CelestialObject[],
  jd: number,
  scale: Scale,
  segments: number,
): Vec3[] {
  const { orbit } = object;
  if (!orbit) throw new Error(`${object.id} has no orbit to draw`);
  const parent = requireParent(object, new Map(catalogue.map((o) => [o.id, o])));
  const state = orbitStateAt(orbit, jd);
  return orbitPath(state, segments).map((point) => toSceneOffset(point, orbit, parent, scale));
}

/**
 * The direction an object's orbit is seen anticlockwise from, as a unit vector in scene axes.
 * A moon that keeps one face to its planet spins about very nearly this direction, so it stands
 * in for the pole where the catalogue has none.
 */
export function sceneOrbitNormal(
  object: CelestialObject,
  catalogue: readonly CelestialObject[],
  jd: number,
): Vec3 {
  if (!object.orbit) throw new Error(`${object.id} has no orbit`);
  const parent = requireParent(object, new Map(catalogue.map((o) => [o.id, o])));
  const normal = orbitNormal(orbitStateAt(object.orbit, jd));
  return normalize(
    eclipticToScene(orbitFrameToEcliptic(normal, object.orbit.frame, parentPole(parent))),
  );
}
