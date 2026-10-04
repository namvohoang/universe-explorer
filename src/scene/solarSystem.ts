import { AmbientLight, Group, PointLight } from 'three';
import type { CelestialObject } from '../data/types';
import { scenePositions } from '../sim/layout';
import type { Scale } from '../sim/scale';
import { length, type Vec3 } from '../sim/vec3';
import { createBody, type Body } from './body';

/** Enough fill light to make out a night side; the Sun does the rest. */
const NIGHT_SIDE_LIGHT = 0.06;
const SUNLIGHT = 2.8;

export interface SolarSystem {
  readonly group: Group;
  /** Moves and turns everything to where it is at this date. */
  setDate(jd: number): void;
  setScale(scale: Scale): void;
  /** Where a body is now, in scene units. */
  positionOf(id: string): Vec3;
  /** Drawn radius of a body under the current scale. */
  radiusOf(id: string): number;
  /** Distance from the centre to the farthest body right now. */
  extent(): number;
  dispose(): void;
}

export function createSolarSystem(
  catalogue: readonly CelestialObject[],
  scale: Scale,
): SolarSystem {
  const group = new Group();
  const bodies = new Map<string, Body>();
  for (const object of catalogue) {
    if (object.shape?.type !== 'spheroid') continue;
    const body = createBody(object, object.shape, scale);
    bodies.set(object.id, body);
    group.add(body.group);
  }

  // Light comes from the star, at full strength however far away: brightness is not what
  // the scale modes are about, and real falloff would leave the outer planets black.
  for (const object of catalogue) {
    const body = bodies.get(object.id);
    if (object.kind === 'star' && body) body.group.add(new PointLight(0xffffff, SUNLIGHT, 0, 0));
  }
  group.add(new AmbientLight(0xffffff, NIGHT_SIDE_LIGHT));

  let currentScale = scale;
  let positions = new Map<string, Vec3>();

  const bodyOf = (id: string): Body => {
    const body = bodies.get(id);
    if (!body) throw new Error(`No drawn body with id "${id}"`);
    return body;
  };

  const setDate = (jd: number): void => {
    positions = scenePositions(catalogue, jd, currentScale);
    for (const [id, body] of bodies) {
      const position = positions.get(id);
      if (position) body.group.position.set(position.x, position.y, position.z);
      body.setDate(jd);
    }
  };

  return {
    group,
    setDate,
    setScale(next) {
      currentScale = next;
      for (const body of bodies.values()) body.setScale(next);
    },
    positionOf(id) {
      const position = positions.get(id);
      if (!position) throw new Error(`No position for "${id}"; call setDate first`);
      return position;
    },
    radiusOf: (id) => bodyOf(id).radius(),
    extent: () => Math.max(0, ...[...positions.values()].map(length)),
    dispose() {
      for (const body of bodies.values()) body.dispose();
    },
  };
}
