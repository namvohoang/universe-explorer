import { AmbientLight, Group, PointLight, Vector3 } from 'three';
import type { CelestialObject, RingSystem } from '../data/types';
import { isShowpiece } from '../data/types';
import { J2000_JD, KM_PER_AU } from '../sim/constants';
import { eclipticToScene, poleOf } from '../sim/frames';
import { sceneDistance } from '../sim/belt';
import {
  bodyRadiusKm,
  eclipticOffsetKm,
  sceneOffsetFromKm,
  sceneOrbitNormal,
  scenePositions,
  type TrackedOffsets,
} from '../sim/layout';
import type { Scale } from '../sim/scale';
import { add, length, type Vec3 } from '../sim/vec3';
import { createBeltPoints, type BeltPoints } from './beltPoints';
import { createBody, type Body } from './body';
import { createCometTail, type CometTail } from './cometTail';
import { createOrbitLine, type OrbitLine } from './orbitLine';
import { createTrail, type Trail } from './trail';

/** How far ahead to look to find which way a comet is heading, in days. */
const HEADING_DAYS = 0.5;
/** Enough fill light to make out a night side; the Sun does the rest. */
const NIGHT_SIDE_LIGHT = 0.06;
const SUNLIGHT = 2.8;

/**
 * A spacecraft flown along a path measured from the body `centreId`. In `space` its places are
 * km from that body's centre in the ecliptic frame. In `body` they are in the body's own
 * turning frame, in units of its radius, so the path rides round with the ground.
 */
export interface TrackedCraft {
  readonly id: string;
  readonly centreId: string;
  readonly frame: 'space' | 'body';
  /** The dates the path is drawn at, earliest first. */
  readonly instants: readonly number[];
  placeAt(jd: number): Vec3;
}

export interface Tracks {
  readonly bodies: TrackedOffsets;
  /** Bodies turned to face the way they really did: a direction in the ecliptic frame at a date. */
  readonly turns: ReadonlyMap<string, { readonly atJd: number; readonly towards: Vec3 }>;
  readonly craft: readonly TrackedCraft[];
}

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
  /** How far a tracked spacecraft's path reaches from the body it is measured from; 0 for anything else. */
  reachOf(id: string): number;
  /** Drawn radius of a body under the current scale. */
  radiusOf(id: string): number;
  /** How big a body's glow is right now (a comet near the Sun); 0 for anything with none. */
  glowRadiusOf(id: string): number;
  /** Tells the scene where the camera is, for effects that change when seen from inside. */
  setViewer(camera: Vec3): void;
  /** Streams the comets' gas and dust for so many real seconds. */
  flowTails(seconds: number): void;
  /**
   * Puts these bodies where their tracks say (km from their parent, ecliptic frame) in place
   * of where their orbits would, and adds these spacecraft, each a point on a drawn trail.
   * A tracked body's orbit line is not drawn, since the body no longer sits on it. `null`
   * puts everything back.
   */
  setTracks(tracks: Tracks | null): void;
  /**
   * Draws only these bodies and their paths, for a story told with a few of them; `null` draws
   * everything again. The light of the star stays either way.
   */
  showOnly(ids: ReadonlySet<string> | null): void;
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
  let tracks: Tracks | null = null;
  let shownIds: ReadonlySet<string> | null = null;
  const trails = new Map<string, { readonly craft: TrackedCraft; readonly trail: Trail }>();
  const showLines = (): void => {
    for (const orbit of orbitLines) {
      const shown = shownIds === null || shownIds.has(orbit.objectId);
      orbit.line.visible = shown && !tracks?.bodies.has(orbit.objectId);
    }
  };
  const drawTrails = (): void => {
    for (const { craft, trail } of trails.values()) {
      const centre = catalogue.find((object) => object.id === craft.centreId);
      if (!centre) continue;
      // A path in a body's own frame is already in that frame's units.
      if (craft.frame === 'body') trail.draw((place) => place);
      else trail.draw((km) => sceneOffsetFromKm(km, centre, currentScale));
    }
  };
  let positions = new Map<string, Vec3>();
  let redrawOrbits = true;

  const bodyOf = (id: string): Body => {
    const body = bodies.get(id);
    if (!body) throw new Error(`No drawn body with id "${id}"`);
    return body;
  };

  const inWorld = new Vector3();
  const setDate = (jd: number): void => {
    positions = scenePositions(catalogue, jd, currentScale, tracks?.bodies);
    for (const { craft, trail } of trails.values()) {
      if (craft.frame !== 'space') continue;
      const centre = catalogue.find((object) => object.id === craft.centreId);
      const origin = positions.get(craft.centreId);
      if (!centre || !origin) continue;
      const offset = sceneOffsetFromKm(craft.placeAt(jd), centre, currentScale);
      trail.group.position.set(origin.x, origin.y, origin.z);
      trail.setDate(jd, offset);
      positions.set(craft.id, add(origin, offset));
    }
    for (const [id, body] of bodies) {
      const position = positions.get(id);
      if (position) body.group.position.set(position.x, position.y, position.z);
      body.setDate(jd);
    }
    for (const object of catalogue) {
      const parent = object.parentId === null ? undefined : positions.get(object.parentId);
      if (parent) bodies.get(object.id)?.faceTowards(parent);
    }
    // A craft that rides round with a body's ground is placed once that body has been turned.
    for (const { craft, trail } of trails.values()) {
      const body = bodies.get(craft.centreId);
      if (craft.frame !== 'body' || !body) continue;
      const place = craft.placeAt(jd);
      trail.setDate(jd, place);
      body.group.updateWorldMatrix(true, true);
      const world = body.frame.localToWorld(inWorld.set(place.x, place.y, place.z));
      positions.set(craft.id, { x: world.x, y: world.y, z: world.z });
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
      drawTrails();
    },
    setTracks(next) {
      for (const { trail } of trails.values()) {
        trail.group.removeFromParent();
        trail.dispose();
      }
      trails.clear();
      tracks = next;
      for (const [id, body] of bodies) {
        const turn = next?.turns.get(id);
        body.setTurn(turn ? { atJd: turn.atJd, towards: eclipticToScene(turn.towards) } : null);
      }
      for (const craft of next?.craft ?? []) {
        const trail = createTrail(craft.instants, (jd) => craft.placeAt(jd));
        trails.set(craft.id, { craft, trail });
        const ground = craft.frame === 'body' ? bodies.get(craft.centreId) : undefined;
        (ground ? ground.frame : group).add(trail.group);
      }
      drawTrails();
      showLines();
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
    showOnly(ids) {
      const shown = (id: string): boolean => ids === null || ids.has(id);
      shownIds = ids;
      for (const [id, body] of bodies) body.group.visible = shown(id);
      showLines();
      for (const [id, tail] of tails) tail.group.visible = shown(id);
      for (const belt of belts) belt.points.visible = ids === null;
    },
    reachOf(id) {
      const flown = trails.get(id);
      if (!flown) return 0;
      // A path in a body's own frame is measured in that body's radii.
      const unit =
        flown.craft.frame === 'body' ? (bodies.get(flown.craft.centreId)?.radius() ?? 0) : 1;
      return flown.trail.reach() * unit;
    },
    // A spacecraft is a point: at true scale it has no size to draw.
    radiusOf: (id) => (trails.has(id) ? 0 : bodyOf(id).radius()),
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
      for (const { trail } of trails.values()) trail.dispose();
    },
  };
}
