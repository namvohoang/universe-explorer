import { AmbientLight, Group, PointLight } from 'three';
import type { CelestialObject, RingSystem } from '../data/types';
import { isShowpiece } from '../data/types';
import { J2000_JD, KM_PER_AU } from '../sim/constants';
import { poleOf } from '../sim/frames';
import { sceneDistance } from '../sim/belt';
import { bodyRadiusKm, eclipticOffsetKm, sceneOrbitNormal, scenePositions } from '../sim/layout';
import type { Scale } from '../sim/scale';
import { length, type Vec3 } from '../sim/vec3';
import { createBeltPoints, type BeltPoints } from './beltPoints';
import { createBody, type Body } from './body';
import { createCometTail, type CometTail } from './cometTail';
import { createOrbitLine, type OrbitLine } from './orbitLine';

/** How far ahead to look to find which way a comet is heading, in days. */
const HEADING_DAYS = 0.5;
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
  /**
   * Makes sure the maps and models are loaded for a body and the small things round it, for
   * those that wait until somebody visits.
   */
  showDetail(id: string): void;
  /** Drawn radius of a body under the current scale. */
  radiusOf(id: string): number;
  /** How big a body's glow is right now (a comet near the Sun); 0 for anything with none. */
  glowRadiusOf(id: string): number;
  /** Tells the scene where the camera is, for effects that change when seen from inside. */
  setViewer(camera: Vec3): void;
  /** Streams the comets' gas and dust for so many real seconds. */
  flowTails(seconds: number): void;
  /** Scene radius of a belt's outer edge under the current scale. */
  beltRadius(id: string): number;
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
  const ringsOf = new Map<string, RingSystem>();
  for (const object of catalogue) {
    if (object.kind === 'ring-system') ringsOf.set(object.parentId, object);
  }
  for (const object of catalogue) {
    const { shape } = object;
    if (shape?.type !== 'spheroid' && shape?.type !== 'triaxial') continue;
    // A craft shown only as a model to look at has no place among the planets.
    if (isShowpiece(object)) continue;
    const needsPole = object.orbit !== null && poleOf(shape.orientation) === null;
    const fallbackPole = needsPole ? sceneOrbitNormal(object, catalogue, J2000_JD) : null;
    const body = createBody(object, shape, scale, ringsOf.get(object.id) ?? null, fallbackPole);
    bodies.set(object.id, body);
    group.add(body.group);
  }

  const orbitLines: OrbitLine[] = catalogue
    .filter((object) => object.orbit)
    .map((object) => createOrbitLine(object, catalogue));
  for (const orbit of orbitLines) group.add(orbit.line);

  const tails = new Map<string, CometTail>();
  for (const object of catalogue) {
    if (object.kind !== 'comet' || !bodies.has(object.id)) continue;
    const tail = createCometTail();
    tails.set(object.id, tail);
    group.add(tail.group);
  }

  // Rocky dots for a belt near its star, icy ones for a belt far out. A drawing choice.
  const ROCK = 0xb8ab96;
  const ICE = 0xa9c4d6;
  const FAR_AU = 10;
  const belts: BeltPoints[] = [];
  const beltParentRadiusKm = new Map<string, number>();
  for (const object of catalogue) {
    if (object.kind !== 'belt') continue;
    const parent = catalogue.find((o) => o.id === object.parentId);
    const radiusKm = parent ? bodyRadiusKm(parent) : null;
    if (radiusKm === null) continue;
    const color = object.shape.innerRadiusAu.value > FAR_AU ? ICE : ROCK;
    const belt = createBeltPoints(object, radiusKm, color);
    belts.push(belt);
    beltParentRadiusKm.set(object.id, radiusKm);
    group.add(belt.points);
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
  let redrawOrbits = true;

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
    for (const object of catalogue) {
      const parent = object.parentId === null ? undefined : positions.get(object.parentId);
      if (parent) bodies.get(object.id)?.faceTowards(parent);
    }
    for (const belt of belts) {
      const parent = positions.get(belt.parentId);
      if (parent) belt.points.position.set(parent.x, parent.y, parent.z);
      belt.update(jd, currentScale);
    }
    for (const orbit of orbitLines) {
      const parent = positions.get(orbit.parentId);
      if (parent) orbit.line.position.set(parent.x, parent.y, parent.z);
      orbit.update(jd, currentScale, redrawOrbits);
    }
    redrawOrbits = false;
    if (tails.size > 0) {
      // Where each comet will be a little later tells which way it is heading.
      const soon = scenePositions(catalogue, jd + HEADING_DAYS, currentScale);
      for (const [id, tail] of tails) {
        const comet = catalogue.find((object) => object.id === id);
        const position = positions.get(id);
        const next = soon.get(id);
        const parent = comet?.parentId ? positions.get(comet.parentId) : undefined;
        if (!comet || !position || !next || !parent) continue;
        const heading = { x: next.x - position.x, y: next.y - position.y, z: next.z - position.z };
        const offset = eclipticOffsetKm(comet, catalogue, jd);
        const nucleus = bodies.get(id)?.radius() ?? 0;
        tail.update(position, parent, heading, length(offset) / KM_PER_AU, nucleus);
      }
    }
    const star = catalogue.find((object) => object.kind === 'star');
    const sun = star ? positions.get(star.id) : undefined;
    if (sun) for (const body of bodies.values()) body.setSunPosition(sun);
  };

  return {
    group,
    setDate,
    setScale(next) {
      currentScale = next;
      redrawOrbits = true;
      for (const body of bodies.values()) body.setScale(next);
    },
    positionOf(id) {
      const position = positions.get(id);
      if (!position) throw new Error(`No position for "${id}"; call setDate first`);
      return position;
    },
    showDetail(id) {
      // Going to a world brings its whole family into view: what it goes round, and
      // everything that goes round either of them. Their maps are fetched; a heavy 3D model
      // is fetched only for the one being visited.
      const here = catalogue.find((object) => object.id === id);
      const parent = catalogue.find((object) => object.id === here?.parentId);
      // Everything goes round the Sun, so the Sun does not count as family.
      const family = new Set([id, parent && parent.kind !== 'star' ? parent.id : id]);
      for (const object of catalogue) {
        if (family.has(object.id) || (object.parentId !== null && family.has(object.parentId))) {
          bodies.get(object.id)?.loadMap();
        }
      }
      bodies.get(id)?.loadDetail();
    },
    radiusOf: (id) => bodyOf(id).radius(),
    glowRadiusOf: (id) => tails.get(id)?.glowRadius() ?? 0,
    flowTails(seconds) {
      for (const tail of tails.values()) tail.flow(seconds);
      for (const body of bodies.values()) body.flow(seconds);
    },
    setViewer(camera) {
      for (const tail of tails.values()) tail.setViewer(camera);
    },
    beltRadius(id) {
      const belt = catalogue.find((o) => o.id === id);
      const radiusKm = beltParentRadiusKm.get(id);
      if (belt?.kind !== 'belt' || radiusKm === undefined) throw new Error(`No drawn belt "${id}"`);
      return sceneDistance(belt.shape.outerRadiusAu.value, radiusKm, currentScale);
    },
    extent: () => Math.max(0, ...[...positions.values()].map(length)),
    dispose() {
      for (const body of bodies.values()) body.dispose();
      for (const orbit of orbitLines) orbit.dispose();
      for (const belt of belts) belt.dispose();
      for (const tail of tails.values()) tail.dispose();
    },
  };
}
