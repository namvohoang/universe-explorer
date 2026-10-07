import { SECONDS_PER_DAY } from './constants';
import { length, subtract, type Vec3 } from './vec3';

/** How far apart in time two places are taken to tell a speed, in days. */
const SPEED_STEP_DAYS = 0.01;

/** How far apart in time a comet is looked for along its path, in days. */
const SEARCH_STEP_DAYS = 4;

/** Where something moving is at a date, in km. */
export type Path = (jd: number) => Vec3;

/** How fast and which way something on a path is going at a date, in km per second. */
export function velocityKmS(path: Path, jd: number): Vec3 {
  const before = path(jd - SPEED_STEP_DAYS);
  const after = path(jd + SPEED_STEP_DAYS);
  const seconds = 2 * SPEED_STEP_DAYS * SECONDS_PER_DAY;
  return {
    x: (after.x - before.x) / seconds,
    y: (after.y - before.y) / seconds,
    z: (after.z - before.z) / seconds,
  };
}

/**
 * The date, between two dates, at which something on a path passes nearest a place, and how
 * near it comes (km). Looked for every `stepDays`, then closed in on.
 */
export function nearestPass(
  path: Path,
  place: Vec3,
  fromJd: number,
  toJd: number,
  stepDays: number,
): { readonly jd: number; readonly distanceKm: number } {
  const far = (jd: number): number => length(subtract(path(jd), place));
  let best = fromJd;
  let least = far(fromJd);
  for (let jd = fromJd + stepDays; jd <= toJd; jd += stepDays) {
    const distance = far(jd);
    if (distance < least) {
      least = distance;
      best = jd;
    }
  }
  // Closer and closer round the best date found, a third of the width at a time.
  let low = best - stepDays;
  let high = best + stepDays;
  for (let round = 0; round < 60; round += 1) {
    const a = low + (high - low) / 3;
    const b = high - (high - low) / 3;
    if (far(a) < far(b)) high = b;
    else low = a;
  }
  const jd = (low + high) / 2;
  return { jd, distanceKm: far(jd) };
}

/**
 * Where in the sky shooting stars seem to come from, and how fast they hit: dust that keeps to
 * the path of the comet that shed it meets a world going its own way, and from that world it
 * all seems to fly out of one spot, the radiant. `towards` is the unit direction of that
 * spot; speeds are in km per second, as if the world did not pull the dust in.
 */
export function radiant(
  dustVelocityKmS: Vec3,
  worldVelocityKmS: Vec3,
): { readonly towards: Vec3; readonly speedKmS: number } {
  // The dust comes at the world along (dust - world); it is seen coming from the other way.
  const from = subtract(worldVelocityKmS, dustVelocityKmS);
  const speedKmS = length(from);
  if (!(speedKmS > 0)) throw new RangeError('dust that keeps pace with a world never hits it');
  return {
    towards: { x: from.x / speedKmS, y: from.y / speedKmS, z: from.z / speedKmS },
    speedKmS,
  };
}

/**
 * The shower a world sees as it passes a comet's path at a date: the comet's own way and
 * speed where its path runs nearest the world are taken for the dust's. `missKm` is how far
 * the world is from that path. The comet is looked for on its path over `spanDays` either
 * side of the date, which must take in one whole trip round its star.
 */
export function showerAt(
  comet: Path,
  world: Path,
  jd: number,
  spanDays: number,
): {
  readonly towards: Vec3;
  readonly speedKmS: number;
  readonly missKm: number;
  /** How far a place is from the comet's path where it runs past here, taken as a straight line. */
  missFrom(place: Vec3): number;
} {
  // A step of a few days is fine enough to land beside the nearest pass; it is then closed in on.
  const pass = nearestPass(comet, world(jd), jd - spanDays, jd + spanDays, SEARCH_STEP_DAYS);
  const dust = velocityKmS(comet, pass.jd);
  const on = comet(pass.jd);
  const speed = length(dust) || 1;
  return {
    ...radiant(dust, velocityKmS(world, jd)),
    missKm: pass.distanceKm,
    missFrom(place) {
      const out = subtract(place, on);
      const along = (out.x * dust.x + out.y * dust.y + out.z * dust.z) / speed;
      return Math.sqrt(Math.max(0, out.x ** 2 + out.y ** 2 + out.z ** 2 - along * along));
    },
  };
}
