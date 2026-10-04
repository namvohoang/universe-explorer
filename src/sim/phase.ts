import { angleBetween, subtract, type Vec3 } from './vec3';

/**
 * The angle at a body between the Sun and whoever is looking at it, in radians: 0 when the
 * viewer sees it fully lit (a full Moon), π when it is lit from behind (a new Moon).
 */
export function phaseAngleRad(body: Vec3, sun: Vec3, viewer: Vec3): number {
  return angleBetween(subtract(sun, body), subtract(viewer, body));
}

/** The share of the body's disc the viewer sees lit, from 0 (new) to 1 (full). */
export function illuminatedFraction(body: Vec3, sun: Vec3, viewer: Vec3): number {
  return (1 + Math.cos(phaseAngleRad(body, sun, viewer))) / 2;
}
