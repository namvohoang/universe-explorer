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

/** Nothing nearer the camera than this is drawn, unless the camera is closer still to its subject. */
export const USUAL_NEAR = 1e-4;
/** The nearest thing drawn is never farther than this share of the way to what is being looked at. */
const NEAR_SHARE = 0.01;

/**
 * How near the camera something may be and still be drawn. At true scale a spacecraft is so
 * small that the camera sits closer to it than the usual limit, and it would be cut away, so
 * the limit shrinks with the distance to whatever the camera is looking at.
 */
export function nearPlaneFor(distanceToSubject: number): number {
  if (!(distanceToSubject > 0)) return USUAL_NEAR;
  return Math.min(USUAL_NEAR, distanceToSubject * NEAR_SHARE);
}
