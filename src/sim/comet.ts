import { add, dot, length, normalize, scale, subtract, type Vec3 } from './vec3';

/**
 * How a comet's glow and tails are drawn. Their directions are real: the gas tail points
 * straight away from the Sun, and the dust tail lags behind it along the comet's path. Their
 * sizes are a drawing, not a measurement: comets differ, and the catalogue holds no tail lengths.
 */

/** Beyond this distance from the Sun the comet is drawn bare: too cold to shed gas. */
export const TAIL_STARTS_AU = 4;
/** Drawn tail length when the comet is as close to the Sun as Earth is, or closer. */
export const TAIL_LENGTH_AU = 0.5;
/**
 * Drawn radius of the coma, the cloud around the nucleus, at full strength. NASA says a coma
 * "may extend hundreds of thousands of kilometers" (science.nasa.gov/solar-system/comets/facts,
 * read 2026-10-04).
 */
export const COMA_RADIUS_KM = 100_000;
/** How far the dust tail swings back from the gas tail, as a share of the comet's motion. */
const DUST_LAG = 0.45;

/**
 * How strong the glow and tails are drawn, from 0 (none) to 1 (full), by distance from the Sun.
 * It grows as sunlight does, with the inverse square of the distance, reaching full at Earth's
 * distance.
 */
export function tailStrength(distanceAu: number): number {
  if (!(distanceAu > 0)) throw new RangeError('Distance from the Sun must be positive');
  if (distanceAu >= TAIL_STARTS_AU) return 0;
  const floor = 1 / TAIL_STARTS_AU ** 2;
  return Math.min(1, (1 / distanceAu ** 2 - floor) / (1 - floor));
}

/** Unit directions of a comet's two tails. */
export interface TailDirections {
  /** The gas (ion) tail: blown straight away from the Sun. */
  readonly gas: Vec3;
  /** The dust tail: also away from the Sun, but trailing behind the way the comet is going. */
  readonly dust: Vec3;
}

/**
 * @param comet where the comet is
 * @param sun where the Sun is
 * @param heading which way the comet is moving (any length); zero if not known
 */
export function tailDirections(comet: Vec3, sun: Vec3, heading: Vec3): TailDirections {
  const gas = normalize(subtract(comet, sun));
  const speed = Math.hypot(heading.x, heading.y, heading.z);
  if (speed === 0) return { gas, dust: gas };
  const behind = scale(heading, -DUST_LAG / speed);
  return { gas, dust: normalize(add(gas, behind)) };
}

/**
 * Which way dust falls behind a comet: against the way it is moving, with any part of that
 * towards or away from the Sun left out, so it is square to the gas tail. `null` when the
 * heading is not known, or the comet is moving straight at or away from the Sun.
 */
export function behindDirection(comet: Vec3, sun: Vec3, heading: Vec3): Vec3 | null {
  const away = normalize(subtract(comet, sun));
  const across = subtract(heading, scale(away, dot(heading, away)));
  const size = length(across);
  return size === 0 ? null : scale(across, -1 / size);
}

/**
 * Where a grain of dust is in a comet's tail, as shares of the tail's length: how far it has
 * been pushed away from the Sun, and how far it has fallen behind the comet. A grain that
 * left longer ago is farther out and has fallen behind more than in step, so the tail curves;
 * grains that fall behind at different rates spread the tail into a fan. A drawing of how a
 * dust tail bends, not a calculation of any one comet's dust.
 *
 * @param along how far down the tail the grain is, from 0 (at the comet) to 1 (the far end)
 * @param lag how readily this grain falls behind, from 0 (not at all: it stays in the gas tail)
 */
export function dustGrain(along: number, lag: number): { away: number; behind: number } {
  return { away: along, behind: lag * along * along };
}

/**
 * How a comet's nucleus is drawn: long, with a narrower waist between two lumpy ends. ESA says
 * the Giotto spacecraft found Halley's nucleus to be "a dark, peanut-shaped body, about 15 km
 * long and 7 to 10 km wide" (sci.esa.int/web/giotto/-/31878-halley, read 2026-10-06). The waist
 * and the two ends follow that; the smaller lumps and hollows are a drawing, since no trusted
 * site publishes a model of its shape.
 */
const NUCLEUS = {
  /** How much narrower the waist is than the ends, as a share. */
  waist: 0.3,
  /** How far along the body the waist reaches, as a share of its half-length. */
  waistReach: 0.38,
  /** How much fatter one end is than the other. */
  lopsided: 0.14,
  /** How high the lumps stand and how deep the hollows go, as a share of the width. */
  lumps: 0.16,
} as const;

/** Made-up waves that add up to lumps: [direction x, y, z, how many across, where it starts]. */
const LUMP_WAVES: readonly (readonly [number, number, number, number, number])[] = [
  [0.8, 0.5, 0.33, 2.1, 0.4],
  [-0.3, 0.9, 0.31, 3.3, 1.7],
  [0.45, -0.4, 0.8, 4.2, 2.9],
  [-0.7, -0.6, 0.39, 5.6, 0.9],
  [0.2, 0.3, -0.93, 7.3, 4.1],
  [-0.55, 0.25, -0.8, 9.1, 2.2],
  [0.62, 0.7, -0.35, 12.7, 5.3],
  [-0.15, -0.8, -0.58, 16.4, 0.2],
  [0.9, -0.2, 0.39, 21.3, 3.6],
  [-0.4, 0.55, 0.73, 27.9, 1.1],
];

/**
 * How far the ground of a comet's nucleus is from its middle in one direction, next to a
 * smooth body of the same length and width (1 is the smooth body's own surface, and x is the
 * long way).
 *
 * @param direction a unit vector from the middle of the nucleus
 * @returns how much to stretch the two short ways and the whole, in that direction
 */
export function nucleusRelief(direction: Vec3): { width: number; height: number } {
  // Narrow in the middle of the long way, and one end a little fatter than the other.
  const waist = 1 - NUCLEUS.waist * Math.exp(-((direction.x / NUCLEUS.waistReach) ** 2));
  const width = waist * (1 + NUCLEUS.lopsided * direction.x);
  let lumps = 0;
  let total = 0;
  for (const [x, y, z, across, start] of LUMP_WAVES) {
    const weight = 1 / across;
    lumps +=
      weight * Math.sin(across * (x * direction.x + y * direction.y + z * direction.z) + start);
    total += weight;
  }
  return { width, height: 1 + NUCLEUS.lumps * (lumps / total) };
}
