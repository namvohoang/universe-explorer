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

/** Nothing farther from the camera than this is drawn, in scene units. */
export const FARTHEST = 1e6;

/**
 * The stage orders what is in front of what by the logarithm of its distance, since distances
 * span a factor of millions. three.js takes the logarithm of 1 + distance, which cannot tell
 * apart things much nearer than one scene unit: at true scale a rocket's near side and its
 * far side, a few millionths of a unit away, got the same depth and showed through each
 * other. Distance is multiplied by this first, so that the logarithm has something to work on.
 */
export const DEPTH_GAIN = 1e8;

/** The depth, from 0 at the camera to 1 at `FARTHEST`, given to something this far away. */
export function depthOf(distance: number): number {
  return Math.log2(1 + distance * DEPTH_GAIN) / Math.log2(1 + FARTHEST * DEPTH_GAIN);
}

const glsl = (value: number): string => value.toExponential(12);

/** three.js's two shader chunks for logarithmic depth, rewritten to work out `depthOf`. */
export const DEPTH_CHUNKS = {
  logdepthbuf_vertex: `
#ifdef USE_LOGARITHMIC_DEPTH_BUFFER

	vFragDepth = 1.0 + gl_Position.w * ${glsl(DEPTH_GAIN)};
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );

#endif
`,
  logdepthbuf_fragment: `
#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )

	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * ${glsl(1 / Math.log2(1 + FARTHEST * DEPTH_GAIN))};

#endif
`,
} as const;
