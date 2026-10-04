import { degToRad } from '../sim/angles';

/**
 * How many pixels tall something of a given size appears, at a distance from a perspective
 * camera with this vertical field of view.
 */
export function pixelsFor(
  size: number,
  distance: number,
  fieldOfViewDeg: number,
  viewportHeight: number,
): number {
  if (!(distance > 0)) return Infinity;
  return (size * viewportHeight) / (2 * Math.tan(degToRad(fieldOfViewDeg) / 2) * distance);
}
