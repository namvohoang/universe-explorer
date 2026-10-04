/**
 * How a comet's tail is drawn. Its direction is real: straight away from the Sun. Its size is a
 * drawing, not a measurement: comets differ, and the catalogue holds no tail lengths.
 */

/** Beyond this distance from the Sun the comet is drawn with no tail: too cold to shed gas. */
export const TAIL_STARTS_AU = 4;
/** Drawn tail length when the comet is as close to the Sun as Earth is, or closer. */
export const TAIL_LENGTH_AU = 0.5;

/**
 * How strong the tail is drawn, from 0 (none) to 1 (full), by distance from the Sun. It grows
 * as sunlight does, with the inverse square of the distance, reaching full at Earth's distance.
 */
export function tailStrength(distanceAu: number): number {
  if (!(distanceAu > 0)) throw new RangeError('Distance from the Sun must be positive');
  if (distanceAu >= TAIL_STARTS_AU) return 0;
  const floor = 1 / TAIL_STARTS_AU ** 2;
  return Math.min(1, (1 / distanceAu ** 2 - floor) / (1 - floor));
}
