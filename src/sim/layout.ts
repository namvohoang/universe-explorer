import type { CelestialObject, OrbitalElements, SpheroidShape } from '../data/types';
import { orbitStateAt } from './elements';
import { eclipticToScene, orbitFrameToEcliptic, poleOf, type Pole } from './frames';
import { orbitPath, positionFromState } from './kepler';
import type { Scale } from './scale';
import { add, scale as scaleVec, type Vec3 } from './vec3';

/** The drawn radii of a round body: across the equator and from centre to pole. */
export interface SceneRadii {
  readonly equatorial: number;
  readonly polar: number;
}

/**
 * Size on screen for a spheroid. The flattening is always the real one, even in a mode that
 * compresses sizes: the scale sets the equatorial radius and the polar one follows the ratio.
 */
export function sceneRadii(shape: SpheroidShape, scale: Scale): SceneRadii {
  const equatorial = scale.sizeToScene(shape.equatorialRadiusKm.value);
  return {
    equatorial,
    polar: equatorial * (shape.polarRadiusKm.value / shape.equatorialRadiusKm.value),
  };
}

/** The radius an orbit is compressed against: its parent's equatorial radius, in km. */
function parentRadiusKm(parent: CelestialObject): number {
  if (parent.shape?.type !== 'spheroid') {
    throw new Error(`${parent.id} has bodies in orbit but no spheroid shape to scale them by`);
  }
  return parent.shape.equatorialRadiusKm.value;
}

function parentPole(parent: CelestialObject): Pole | null {
  return parent.shape && 'orientation' in parent.shape ? poleOf(parent.shape.orientation) : null;
}

function requireParent(
  object: CelestialObject,
  byId: ReadonlyMap<string, CelestialObject>,
): CelestialObject {
  const parent = object.parentId === null ? undefined : byId.get(object.parentId);
  if (!parent) throw new Error(`${object.id} has an orbit but no parent in the catalogue`);
  return parent;
}

/** A point of an orbit (km, in the elements' frame) as an offset from the parent, in scene units. */
function toSceneOffset(
  pointKm: Vec3,
  orbit: OrbitalElements,
  parent: CelestialObject,
  factor: number,
): Vec3 {
  const ecliptic = orbitFrameToEcliptic(pointKm, orbit.frame, parentPole(parent));
  return scaleVec(eclipticToScene(ecliptic), factor);
}

/**
 * Where every object is at a date, in scene units. An object with no orbit sits at its
 * parent's position, or at the origin when it has no parent.
 */
export function scenePositions(
  catalogue: readonly CelestialObject[],
  jd: number,
  scale: Scale,
): Map<string, Vec3> {
  const byId = new Map(catalogue.map((object) => [object.id, object]));
  const positions = new Map<string, Vec3>();

  const place = (object: CelestialObject): Vec3 => {
    const known = positions.get(object.id);
    if (known) return known;
    let position: Vec3 = { x: 0, y: 0, z: 0 };
    if (object.orbit) {
      const parent = requireParent(object, byId);
      const state = orbitStateAt(object.orbit, jd);
      const factor = scale.orbitFactor(state.semiMajorAxis, parentRadiusKm(parent));
      const offset = toSceneOffset(positionFromState(state), object.orbit, parent, factor);
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
 * position, in scene units. Built from the same elements and the same factor that place the
 * body, so the body always sits on its path.
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
  const factor = scale.orbitFactor(state.semiMajorAxis, parentRadiusKm(parent));
  return orbitPath(state, segments).map((point) => toSceneOffset(point, orbit, parent, factor));
}
