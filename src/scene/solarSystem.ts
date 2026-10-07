import { AmbientLight, Group, PointLight, Vector3 } from 'three';
import type { CelestialObject, RingSystem } from '../data/types';
import { isShowpiece } from '../data/types';
import { J2000_JD, KM_PER_AU, SECONDS_PER_DAY } from '../sim/constants';
import { DUST_TRAIL_RADIUS_KM, DUST_TRAIL_WITHIN_AU, strewnAlong } from '../sim/dust';
import { lightTravelSeconds } from '../sim/elements';
import { eclipticToScene, poleOf } from '../sim/frames';
import { sceneDistance } from '../sim/belt';
import {
  bodyRadiusKm,
  eclipticOffsetKm,
  sceneOffsetFromKm,
  sceneOrbitNormal,
  sceneOrbitPath,
  scenePositions,
  type TrackedOffsets,
} from '../sim/layout';
import { createScale, type Scale } from '../sim/scale';
import { add, length, subtract, type Vec3 } from '../sim/vec3';
import { createAuroraRings, type AuroraRings, type AuroraShape } from './auroraRings';
import { createBeltPoints, type BeltPoints } from './beltPoints';
import { createBody, type Body } from './body';
import { createCometTail, type CometTail } from './cometTail';
import { createDustTrail, type DustTrail } from './dustTrail';
import { createOrbitLine, type OrbitLine } from './orbitLine';
import { createSkyTrail, type SkyTrail } from './skyTrail';
import { createTrail, type Trail } from './trail';

const TRUE_SCALE = createScale('true');
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
  /** One body's shadow drawn on another. */
  readonly shadows: readonly {
    readonly casterId: string;
    readonly onId: string;
    readonly throughAir: boolean;
  }[];
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
  /** How far a body reaches from its centre, rings and all, under the current scale. */
  spanOf(id: string): number;
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
   * Draws the track one body makes across the sky of another between two dates, as a line far
   * off in each direction it is seen in; `null` takes it away.
   */
  setSkyTrack(track: { ofId: string; fromId: string; fromJd: number; toJd: number } | null): void;
  /** A point far off in the middle of the sky track, to look at from the body it is seen from; `null` with no track. */
  skyGaze(): Vec3 | null;
  /** Draws the two auroral bands of a body, riding round with its ground; `null` takes them away. */
  setAurora(onId: string | null, shape: AuroraShape | null): void;
  /** Which way a body's north pole points, as a unit vector in scene axes. */
  northOf(id: string): Vec3;
  /**
   * Strews dust along the part of this object's path that lies near its star: a drawing of
   * the trail a comet leaves. `null` takes it away.
   */
  setDust(alongId: string | null, jd: number): void;
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

  /** How many points of a path dust is strewn round, and how many specks round each. */
  const DUST_PATH_POINTS = 24_000;
  const DUST_SPECKS_PER_POINT = 5;
  let dust: DustTrail | null = null;
  let aurora: AuroraRings | null = null;
  /** How many sights a sky track is drawn through, and how far off it is drawn, in scene units. */
  const SKY_TRACK_STEPS = 400;
  const SKY_TRACK_FAR = 200_000;
  let sky: { trail: SkyTrail; fromId: string; middle: Vec3 } | null = null;
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
    if (sky) {
      const from = positions.get(sky.fromId);
      if (from) sky.trail.group.position.set(from.x, from.y, from.z);
      sky.trail.setDate(jd);
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
    for (const shadow of tracks?.shadows ?? []) {
      const on = positions.get(shadow.onId);
      const now = positions.get(shadow.casterId);
      if (!star || !sun || !on || !now) continue;
      // The shadow is worked out from the real places and sizes, whatever scale things are
      // drawn at: a drawing that moves the bodies closer must not move the shadow.
      const real =
        currentScale.mode === 'true'
          ? positions
          : scenePositions(catalogue, jd, TRUE_SCALE, tracks?.bodies);
      const realOn = real.get(shadow.onId);
      const realNow = real.get(shadow.casterId);
      const realSun = real.get(star.id);
      const radiusKm = (id: string): number => {
        const object = catalogue.find((candidate) => candidate.id === id);
        return (object && bodyRadiusKm(object)) ?? 1;
      };
      if (!realOn || !realNow || !realSun) continue;
      // The shadow that arrives now was cast when the light passed the caster: over a second
      // ago between the Moon and Earth, in which time both have moved some 30 km round the Sun.
      const apartKm = length(subtract(realNow, realOn)) / TRUE_SCALE.sizeToScene(1);
      const then = jd - lightTravelSeconds(apartKm) / SECONDS_PER_DAY;
      const caster =
        scenePositions(catalogue, then, TRUE_SCALE, tracks?.bodies).get(shadow.casterId) ?? realNow;
      // The body is drawn this many times its true-scale size, and the shadow with it.
      const drawn = bodyOf(shadow.onId).radius() / TRUE_SCALE.sizeToScene(radiusKm(shadow.onId));
      const times = (v: Vec3): Vec3 => ({ x: v.x * drawn, y: v.y * drawn, z: v.z * drawn });
      bodies.get(shadow.onId)?.setEclipse({
        sun: times(subtract(realSun, realOn)),
        sunRadius: TRUE_SCALE.sizeToScene(radiusKm(star.id)) * drawn,
        caster: times(subtract(caster, realOn)),
        casterRadius: TRUE_SCALE.sizeToScene(radiusKm(shadow.casterId)) * drawn,
        throughAir: shadow.throughAir,
      });
    }
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
      for (const shadow of tracks?.shadows ?? []) bodies.get(shadow.onId)?.setEclipse(null);
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
    setSkyTrack(track) {
      if (sky) {
        group.remove(sky.trail.group);
        sky.trail.dispose();
        sky = null;
      }
      if (!track) return;
      const sights: { jd: number; towards: Vec3 }[] = [];
      let sum: Vec3 = { x: 0, y: 0, z: 0 };
      for (let step = 0; step <= SKY_TRACK_STEPS; step++) {
        const jd = track.fromJd + ((track.toJd - track.fromJd) * step) / SKY_TRACK_STEPS;
        const then = scenePositions(catalogue, jd, currentScale, tracks?.bodies);
        const from = then.get(track.fromId);
        const of = then.get(track.ofId);
        if (!from || !of) continue;
        const sight = subtract(of, from);
        const far = length(sight);
        if (far === 0) continue;
        const towards = { x: sight.x / far, y: sight.y / far, z: sight.z / far };
        sights.push({ jd, towards });
        sum = add(sum, towards);
      }
      const size = length(sum);
      if (size === 0) return;
      sky = {
        trail: createSkyTrail(sights, SKY_TRACK_FAR),
        fromId: track.fromId,
        middle: { x: sum.x / size, y: sum.y / size, z: sum.z / size },
      };
      group.add(sky.trail.group);
    },
    skyGaze() {
      const from = sky ? positions.get(sky.fromId) : undefined;
      if (!sky || !from) return null;
      return {
        x: from.x + sky.middle.x * SKY_TRACK_FAR,
        y: from.y + sky.middle.y * SKY_TRACK_FAR,
        z: from.z + sky.middle.z * SKY_TRACK_FAR,
      };
    },
    setAurora(onId, shape) {
      if (aurora) {
        aurora.group.removeFromParent();
        aurora.dispose();
        aurora = null;
      }
      const body = onId === null ? undefined : bodies.get(onId);
      if (!body || !shape) return;
      aurora = createAuroraRings(shape);
      body.frame.add(aurora.group);
    },
    northOf(id) {
      const { frame } = bodyOf(id);
      frame.updateWorldMatrix(true, false);
      const north = inWorld.set(0, 1, 0).transformDirection(frame.matrixWorld);
      return { x: north.x, y: north.y, z: north.z };
    },
    setDust(alongId, jd) {
      if (dust) {
        group.remove(dust.points);
        dust.dispose();
        dust = null;
      }
      const along = catalogue.find((object) => object.id === alongId);
      const parent = catalogue.find((object) => object.id === along?.parentId);
      const parentKm = parent ? bodyRadiusKm(parent) : null;
      if (!along?.orbit || parentKm === null) return;
      const within = currentScale.distanceToScene(DUST_TRAIL_WITHIN_AU * KM_PER_AU, parentKm);
      const path = sceneOrbitPath(along, catalogue, jd, currentScale, DUST_PATH_POINTS).filter(
        (point) => length(point) < within,
      );
      const radius = currentScale.distanceToScene(DUST_TRAIL_RADIUS_KM, parentKm);
      dust = createDustTrail(strewnAlong(path, radius, DUST_SPECKS_PER_POINT));
      const origin = positions.get(along.parentId ?? '');
      if (origin) dust.points.position.set(origin.x, origin.y, origin.z);
      group.add(dust.points);
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
    spanOf: (id) => (trails.has(id) ? 0 : bodyOf(id).span()),
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
      dust?.dispose();
      aurora?.dispose();
      sky?.trail.dispose();
    },
  };
}
