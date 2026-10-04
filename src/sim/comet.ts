import { add, normalize, scale, subtract, type Vec3 } from './vec3';

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
