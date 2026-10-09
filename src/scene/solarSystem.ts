import { AmbientLight, Group, PointLight, Vector3 } from 'three';
import type { CelestialObject, RingSystem } from '../data/types';
import { isShowpiece } from '../data/types';
import { J2000_JD, KM_PER_AU, SECONDS_PER_DAY } from '../sim/constants';
import { DUST_TRAIL_RADIUS_KM, DUST_TRAIL_WITHIN_AU, strewnAlong } from '../sim/dust';
import { lightTravelSeconds } from '../sim/elements';
import { directionFromRaDec, eclipticToScene, equatorialToEcliptic, poleOf } from '../sim/frames';
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
import { add, cross, dot, length, scale as scaleBy, subtract, type Vec3 } from '../sim/vec3';
import { createAuroraRings, type AuroraRings, type AuroraShape } from './auroraRings';
import { createBeltPoints, type BeltPoints } from './beltPoints';
import { createBody, type Body } from './body';
import { createCometTail, type CometTail } from './cometTail';
import { createDustTrail, type DustTrail } from './dustTrail';
import { createFlownModel, type Flame, type FlownModel } from './flownModel';
import { createLaunchSite, type LaunchSite } from './launchSite';
import { createOrbitLine, type OrbitLine } from './orbitLine';
import { createSkyFigures } from './skyFigures';
import { createSkyTrail, type SkyTrail } from './skyTrail';
import { createTrail, type Trail } from './trail';

const TRUE_SCALE = createScale('true');
/** How fast a drawn flame wavers, in radians for each second of the story's own time. */
const FLAME_WAVERS_PER_SECOND = 1.7;
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
  /**
   * An instant at which the craft stands on the ground of `centreId` (a rocket about to
   * leave it, a lander just down): the ground round that place is drawn finely enough to
   * stand beside the craft.
   */
  readonly leavesGroundAtJd?: number;
  /**
   * The craft's 3D model, drawn at its true size with its tail on the path. `lengthKm` is
   * how long the real craft's longest side is, and `noseAt` the unit vector its nose points
   * along at a date: in the ecliptic frame for a craft in `space`, in the body's own frame
   * for one in `body`.
   */
  readonly model?: {
    readonly url: string;
    readonly lengthKm: number;
    noseAt(jd: number): Vec3;
    /**
     * How much of the model, from its tail, the craft has let go of by a date and is no
     * longer drawn: a share of its length, 0 while it is whole.
     */
    shedBelowAt(jd: number): number;
    /**
     * The same share, but changing smoothly for a few seconds after a part is let go: the
     * middle of the craft that a close look is aimed at is worked out from it.
     */
    lookShedAt(jd: number): number;
    /** The flame its engines make at a date, if they are burning. */
    flameAt(jd: number): Flame | null;
    /**
     * A part it has just let go of, drawn dropping behind it: the stretch of the model it
     * was (shares of its length) and how far behind, in km. `null` when there is none near.
     */
    droppedAt(jd: number): {
      readonly fromShare: number;
      readonly toShare: number;
      readonly behindKm: number;
    } | null;
    /**
     * A part it has left standing where it was let go (the legs of a lander that has lifted
     * off): the stretch of the model it was, and the instant it was left. It stays there.
     */
    leftStandingAt?(jd: number): {
      readonly fromShare: number;
      readonly toShare: number;
      readonly atJd: number;
    } | null;
    /**
     * For a craft in `body`: the way it is heading at a date, level with the ground, as a
     * unit vector in the body's own frame. A close look is taken from beside that way.
     */
    headingAt?(jd: number): Vec3;
  };
  /**
   * With `leavesGroundAtJd`: what is drawn at the place the craft leaves. Smoke billows
   * there from `smokeFromJd`; a tower `towerKm` tall stands beside the craft when given;
   * with `clouds`, clouds hang in the sky round about. All of it is a drawing.
   */
  readonly launchSite?: {
    readonly smokeFromJd: number;
    readonly towerKm: number | null;
    readonly clouds: boolean;
  };
}

export interface Tracks {
  readonly bodies: TrackedOffsets;
  /** Bodies turned to face the way they really did: a direction in the ecliptic frame at a date. */
  readonly turns: ReadonlyMap<string, { readonly atJd: number; readonly towards: Vec3 }>;
  readonly craft: readonly TrackedCraft[];
  /**
   * Keeps the orbit line of a tracked body on show. In a drawing not to scale the body is
   * off its line by less than can be seen, and the line says what goes round what.
   */
  readonly keepOrbitLines?: boolean;
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
  /** The middle of a craft's 3D model, in scene units; where the craft is when it has none. */
  craftMiddleOf(id: string): Vec3;
  /**
   * Makes the next picture this many times brighter, as a camera opened up for dim ground
   * would; 1 puts the light back as it is.
   */
  setExposure(times: number): void;
  /** For a craft that rides round with a body: the side a close look at its model is taken from. */
  craftSideOf(id: string): Vec3 | null;
  /** How long a craft's 3D model is drawn when whole, in scene units; 0 when it has none. */
  craftLengthOf(id: string): number;
  /**
   * Draws each craft that has a 3D model as that model (`true`), for a look from close by, or
   * as the point of light on its path that every craft is from far off (`false`).
   */
  drawCraftModels(drawn: boolean): void;
  /**
   * Draws the track one body makes across the sky of another between two dates, as a line far
   * off in each direction it is seen in; `null` takes it away.
   */
  setSkyTrack(track: { ofId: string; fromId: string; fromJd: number; toJd: number } | null): void;
  /**
   * Shows the star patterns as a backdrop round a body, as its sky is seen from there, or
   * (`null`) takes them away. `shown` hides them for a look that is not from that body.
   */
  setSky(fromId: string | null, shown?: boolean): void;
  /** A point far off in the middle of the sky track, to look at from the body it is seen from; `null` with no track. */
  skyGaze(): Vec3 | null;
  /** Draws the two auroral bands of a body, riding round with its ground; `null` takes them away. */
  setAurora(onId: string | null, shape: AuroraShape | null): void;
  /**
   * Where a point of a body's own turning frame is now, in scene units: a place on its ground,
   * say, given in units of the body's radius (see `bodyFramePoint`).
   */
  groundPointOf(id: string, place: Vec3): Vec3;
  /**
   * Draws a body turned as it was at one date, whatever date is set, or (`null`) lets it turn
   * again. For a story that runs through months in seconds: a star that turns once in weeks
   * would stand still and then whirl, which says nothing about what the story shows.
   */
  holdSpin(id: string, jd: number | null): void;
  /**
   * Draws a body somewhere else than its path puts it, until the next date is set: for a
   * drawing that is not to scale and has to put a body where it shows what is happening.
   */
  moveBody(id: string, position: Vec3): void;
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
  /**
   * For the next picture drawn: only these bodies, and no orbit lines, or (`null`) everything
   * the story shows. Light still falls from the star when the star itself is left out.
   */
  drawOnly(ids: ReadonlySet<string> | null): void;
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

  const starLights: PointLight[] = [];
  // Light comes from the star, at full strength however far away: brightness is not what
  // the scale modes are about, and real falloff would leave the outer planets black.
  for (const object of catalogue) {
    const body = bodies.get(object.id);
    if (object.kind !== 'star' || !body) continue;
    const light = new PointLight(0xffffff, SUNLIGHT, 0, 0);
    starLights.push(light);
    body.group.add(light);
  }
  const fillLight = new AmbientLight(0xffffff, NIGHT_SIDE_LIGHT);
  group.add(fillLight);

  /** How many points of a path dust is strewn round, and how many specks round each. */
  const DUST_PATH_POINTS = 24_000;
  const DUST_SPECKS_PER_POINT = 5;
  let dust: DustTrail | null = null;
  let aurora: AuroraRings | null = null;
  /** How many sights a sky track is drawn through, and how far off it is drawn, in scene units. */
  const SKY_TRACK_STEPS = 400;
  const SKY_TRACK_FAR = 200_000;
  let sky: { trail: SkyTrail; fromId: string; middle: Vec3 } | null = null;
  let stars: { readonly group: Group; dispose(): void } | null = null;
  let starsFromId: string | null = null;
  let currentScale = scale;
  let tracks: Tracks | null = null;
  let shownIds: ReadonlySet<string> | null = null;
  const heldSpins = new Map<string, number>();
  let linesDrawn = true;
  const trails = new Map<string, { readonly craft: TrackedCraft; readonly trail: Trail }>();
  const models = new Map<
    string,
    {
      readonly model: FlownModel;
      readonly dropped: FlownModel;
      /** Whether a part just let go is near enough to draw. */
      shedding: boolean;
      length: number;
      middle: Vec3;
      /** For a craft in `body`: the side a close look at it is taken from, in the scene. */
      side: Vec3 | null;
    }
  >();
  let site: { readonly made: LaunchSite; readonly fromJd: number } | null = null;
  let grounded: Body | null = null;
  const showLines = (): void => {
    for (const orbit of orbitLines) {
      const shown = shownIds === null || shownIds.has(orbit.objectId);
      orbit.line.visible =
        linesDrawn &&
        shown &&
        (tracks?.keepOrbitLines === true || !tracks?.bodies.has(orbit.objectId));
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
      const place = add(origin, offset);
      positions.set(craft.id, place);
      const flown = models.get(craft.id);
      if (flown && craft.model) {
        const nose = eclipticToScene(craft.model.noseAt(jd));
        const shed = craft.model.shedBelowAt(jd);
        flown.length = currentScale.sizeToScene(craft.model.lengthKm);
        // The middle of what is left of it.
        const seen = craft.model.lookShedAt(jd);
        const tall = flown.length * flown.model.tall();
        flown.middle = add(place, scaleBy(nose, (tall * (1 + seen)) / 2));
        flown.model.place(place, nose, flown.length, shed, 1);
        const part = craft.model.droppedAt(jd);
        flown.shedding = part !== null;
        if (part) {
          flown.dropped.place(
            add(place, scaleBy(nose, -currentScale.sizeToScene(part.behindKm))),
            nose,
            flown.length,
            part.fromShare,
            part.toShare,
          );
        }
        site?.made.setSmoke((jd - site.fromJd) * SECONDS_PER_DAY);
        flown.model.setFlame(
          craft.model.flameAt(jd),
          jd * SECONDS_PER_DAY * FLAME_WAVERS_PER_SECOND,
        );
      }
    }
    for (const [id, body] of bodies) {
      const position = positions.get(id);
      if (position) body.group.position.set(position.x, position.y, position.z);
      body.setDate(heldSpins.get(id) ?? jd);
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
      const here = { x: world.x, y: world.y, z: world.z };
      positions.set(craft.id, here);
      const flown = models.get(craft.id);
      if (!flown || !craft.model) continue;
      // Directions in the body's own frame are turned into the scene's as the body is turned.
      const turned = (v: Vec3): Vec3 => {
        inWorld.set(v.x, v.y, v.z).transformDirection(body.frame.matrixWorld);
        return { x: inWorld.x, y: inWorld.y, z: inWorld.z };
      };
      const placed = (v: Vec3): Vec3 => {
        body.frame.localToWorld(inWorld.set(v.x, v.y, v.z));
        return { x: inWorld.x, y: inWorld.y, z: inWorld.z };
      };
      const nose = turned(craft.model.noseAt(jd));
      const shed = craft.model.shedBelowAt(jd);
      flown.length = currentScale.sizeToScene(craft.model.lengthKm);
      const tall = flown.length * flown.model.tall();
      flown.middle = add(here, scaleBy(nose, (tall * (1 + craft.model.lookShedAt(jd))) / 2));
      flown.model.place(here, nose, flown.length, shed, 1);
      flown.model.setFlame(craft.model.flameAt(jd), jd * SECONDS_PER_DAY * FLAME_WAVERS_PER_SECOND);
      const left = craft.model.leftStandingAt?.(jd) ?? null;
      flown.shedding = left !== null;
      if (left) {
        const stood = craft.placeAt(left.atJd);
        const far = length(stood) || 1;
        flown.dropped.place(
          placed(stood),
          turned(scaleBy(stood, 1 / far)),
          flown.length,
          left.fromShare,
          left.toShare,
        );
      }
      if (craft.model.headingAt) {
        // From beside its path, on the side the star lights.
        const out = subtract(here, body.group.position);
        const across = cross(turned(craft.model.headingAt(jd)), out);
        const wide = length(across);
        const star = catalogue.find((object) => object.kind === 'star');
        const light = star ? positions.get(star.id) : undefined;
        if (wide > 0) {
          const lit = light ? Math.sign(dot(across, subtract(light, here))) || 1 : 1;
          flown.side = scaleBy(across, lit / wide);
        }
      }
    }
    if (sky) {
      const from = positions.get(sky.fromId);
      if (from) sky.trail.group.position.set(from.x, from.y, from.z);
      sky.trail.setDate(jd);
    }
    const starsFrom = starsFromId === null ? undefined : positions.get(starsFromId);
    if (stars && starsFrom) stars.group.position.set(starsFrom.x, starsFrom.y, starsFrom.z);
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
      for (const { model, dropped } of models.values()) {
        model.dispose();
        dropped.dispose();
      }
      models.clear();
      site?.made.dispose();
      site = null;
      grounded?.setGroundPatch(null);
      grounded = null;
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
        if (craft.model) {
          const model = createFlownModel(craft.model.url);
          // The same model again, for the part just let go.
          const dropped = createFlownModel(craft.model.url);
          dropped.group.visible = false;
          models.set(craft.id, {
            model,
            dropped,
            shedding: false,
            length: 0,
            middle: { x: 0, y: 0, z: 0 },
            side: null,
          });
          group.add(model.group, dropped.group);
        }
        const stoodOn = bodies.get(craft.centreId);
        const centre = catalogue.find((object) => object.id === craft.centreId);
        if (craft.leavesGroundAtJd !== undefined && stoodOn && centre && !grounded) {
          // The body is turned to where it was at that instant, and the place found on it.
          stoodOn.setDate(craft.leavesGroundAtJd);
          const from = stoodOn.group.position;
          const stood = craft.placeAt(craft.leavesGroundAtJd);
          let place: Vec3;
          if (craft.frame === 'body') {
            // Already a place on the body: it only has to be found in the scene.
            stoodOn.group.updateWorldMatrix(true, true);
            stoodOn.frame.localToWorld(inWorld.set(stood.x, stood.y, stood.z));
            place = { x: inWorld.x, y: inWorld.y, z: inWorld.z };
          } else {
            const offset = sceneOffsetFromKm(stood, centre, currentScale);
            place = { x: from.x + offset.x, y: from.y + offset.y, z: from.z + offset.z };
          }
          if (craft.launchSite) {
            const made = createLaunchSite(craft.launchSite.towerKm, craft.launchSite.clouds);
            site = { made, fromJd: craft.launchSite.smokeFromJd };
            // Which way the craft goes: to where it is a good way along its path.
            const later = craft.instants[craft.instants.length >> 1] ?? craft.leavesGroundAtJd;
            const ahead = eclipticToScene(
              subtract(craft.placeAt(later), craft.placeAt(craft.leavesGroundAtJd)),
            );
            stoodOn.setGroundPatch(place, {
              object: made.group,
              ahead,
              unitKm: bodyRadiusKm(centre) ?? 1,
            });
          } else stoodOn.setGroundPatch(place);
          grounded = stoodOn;
        }
      }
      drawTrails();
      showLines();
    },
    craftMiddleOf: (id) => models.get(id)?.middle ?? positions.get(id) ?? { x: 0, y: 0, z: 0 },
    setExposure(times) {
      for (const light of starLights) light.intensity = SUNLIGHT * times;
      fillLight.intensity = NIGHT_SIDE_LIGHT * times;
    },
    craftSideOf: (id) => models.get(id)?.side ?? null,
    craftLengthOf: (id) => models.get(id)?.length ?? 0,
    drawCraftModels(drawn) {
      for (const [id, flown] of models) {
        flown.model.group.visible = drawn;
        flown.dropped.group.visible = drawn && flown.shedding;
        // Beside the craft itself its path is no guide: the line is drawn in straight steps
        // many kilometres long, and would pass the model by.
        const trail = trails.get(id)?.trail;
        if (trail) trail.group.visible = !drawn;
      }
    },
    holdSpin(id, jd) {
      if (jd === null) heldSpins.delete(id);
      else heldSpins.set(id, jd);
    },
    moveBody(id, position) {
      positions.set(id, position);
      bodyOf(id).group.position.set(position.x, position.y, position.z);
    },
    groundPointOf(id, place) {
      const body = bodyOf(id);
      body.group.updateWorldMatrix(true, true);
      const world = body.frame.localToWorld(inWorld.set(place.x, place.y, place.z));
      return { x: world.x, y: world.y, z: world.z };
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
    setSky(fromId, shown = true) {
      if (fromId !== null && !stars) {
        // The stars are so far off that they lie the same way from every world round the Sun.
        stars = createSkyFigures(
          catalogue.flatMap((object) =>
            object.kind === 'constellation'
              ? [
                  {
                    stars: object.stars.value.map(([, raDeg, decDeg, , magnitude]) => ({
                      towards: eclipticToScene(
                        equatorialToEcliptic(directionFromRaDec(raDeg, decDeg)),
                      ),
                      magnitude,
                    })),
                    lines: object.lines,
                  },
                ]
              : [],
          ),
          SKY_TRACK_FAR,
        );
        group.add(stars.group);
      }
      starsFromId = fromId;
      if (stars) stars.group.visible = fromId !== null && shown;
      const from = fromId === null ? undefined : positions.get(fromId);
      if (stars && from) stars.group.position.set(from.x, from.y, from.z);
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
    drawOnly(ids) {
      for (const [id, body] of bodies) body.setDrawn(ids === null || ids.has(id));
      // Dust strewn along a path is part of the whole picture, not of a look from inside it.
      if (dust) dust.points.visible = ids === null;
      if (linesDrawn !== (ids === null)) {
        linesDrawn = ids === null;
        showLines();
      }
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
      for (const { model, dropped } of models.values()) {
        model.dispose();
        dropped.dispose();
      }
      site?.made.dispose();
      dust?.dispose();
      aurora?.dispose();
      sky?.trail.dispose();
      stars?.dispose();
    },
  };
}
