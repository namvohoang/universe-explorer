import type { Orientation, OrbitFrame } from '../data/types';
import { isKnown } from '../data/types';
import { degToRad } from './angles';
import type { OrbitState } from './kepler';
import { cross, normalize, type Vec3 } from './vec3';

/**
 * Three frames are in play, all right-handed:
 * - ICRF equatorial: z towards Earth's north pole at J2000, x towards the equinox. Pole
 *   directions (right ascension, declination) are given in it.
 * - Ecliptic J2000: the same x, z towards the north pole of Earth's orbit. Planet orbits are
 *   given in it, and it is the simulation's working frame.
 * - Scene: the ecliptic with "up" on the y axis, as three.js expects.
 */

/**
 * Obliquity of the ecliptic at J2000, the angle between the two frames
 * (ssd.jpl.nasa.gov/planets/approx_pos.html, read 2026-10-04).
 */
export const OBLIQUITY_J2000_DEG = 23.43928;

const COS_OBLIQUITY = Math.cos(degToRad(OBLIQUITY_J2000_DEG));
const SIN_OBLIQUITY = Math.sin(degToRad(OBLIQUITY_J2000_DEG));

export function eclipticToEquatorial(v: Vec3): Vec3 {
  return {
    x: v.x,
    y: COS_OBLIQUITY * v.y - SIN_OBLIQUITY * v.z,
    z: SIN_OBLIQUITY * v.y + COS_OBLIQUITY * v.z,
  };
}

export function equatorialToEcliptic(v: Vec3): Vec3 {
  return {
    x: v.x,
    y: COS_OBLIQUITY * v.y + SIN_OBLIQUITY * v.z,
    z: -SIN_OBLIQUITY * v.y + COS_OBLIQUITY * v.z,
  };
}

/** Unit vector, in the ICRF equatorial frame, towards a right ascension and declination. */
export function directionFromRaDec(raDeg: number, decDeg: number): Vec3 {
  const ra = degToRad(raDeg);
  const dec = degToRad(decDeg);
  return { x: Math.cos(dec) * Math.cos(ra), y: Math.cos(dec) * Math.sin(ra), z: Math.sin(dec) };
}

/** Ecliptic to scene: north of the ecliptic becomes "up" (y), keeping the frame right-handed. */
export function eclipticToScene(v: Vec3): Vec3 {
  return { x: v.x, y: v.z, z: -v.y };
}

export function sceneToEcliptic(v: Vec3): Vec3 {
  return { x: v.x, y: -v.z, z: v.y };
}

/**
 * Takes a point from a frame defined by a pole (a planet's equator, or a moon's Laplace
 * plane) into the ecliptic. The frame's z is the pole; its x is where the frame's plane crosses
 * the ICRF equator going north, which is where JPL measures a moon's node from.
 */
export function poleFrameToEcliptic(v: Vec3, poleRaDeg: number, poleDecDeg: number): Vec3 {
  const z = directionFromRaDec(poleRaDeg, poleDecDeg);
  const x = normalize(cross({ x: 0, y: 0, z: 1 }, z));
  const y = cross(z, x);
  return equatorialToEcliptic({
    x: x.x * v.x + y.x * v.y + z.x * v.z,
    y: x.y * v.x + y.y * v.y + z.y * v.z,
    z: x.z * v.x + y.z * v.y + z.z * v.z,
  });
}

/** A pole direction on the sky, in degrees (ICRF). */
export interface Pole {
  readonly raDeg: number;
  readonly decDeg: number;
}

/**
 * Takes a position from the frame its orbital elements are given in into the ecliptic.
 * `parentPole` is needed only for elements measured from the parent's equator.
 */
export function orbitFrameToEcliptic(v: Vec3, frame: OrbitFrame, parentPole: Pole | null): Vec3 {
  switch (frame.type) {
    case 'ecliptic-j2000':
      return v;
    case 'parent-equator':
      if (!parentPole) throw new Error('Elements in the parent-equator frame need the parent pole');
      return poleFrameToEcliptic(v, parentPole.raDeg, parentPole.decDeg);
    case 'laplace-plane':
      return poleFrameToEcliptic(v, frame.poleRaDeg.value, frame.poleDecDeg.value);
    default:
      return frame satisfies never;
  }
}

/** The pole of an orientation, or `null` when the catalogue does not know it. */
export function poleOf(orientation: Orientation): Pole | null {
  const { poleRaDeg, poleDecDeg } = orientation;
  return isKnown(poleRaDeg) && isKnown(poleDecDeg)
    ? { raDeg: poleRaDeg.value, decDeg: poleDecDeg.value }
    : null;
}

/**
 * Unit vector along a body's IAU north pole, in the ecliptic frame. The body turns
 * anticlockwise about it when `rotation` is prograde, clockwise when retrograde.
 */
export function northPoleEcliptic(pole: Pole): Vec3 {
  return equatorialToEcliptic(directionFromRaDec(pole.raDeg, pole.decDeg));
}

/** Unit vector normal to an orbit, in the frame of its elements, on the side it is seen anticlockwise from. */
export function orbitNormal(state: OrbitState): Vec3 {
  const sinI = Math.sin(state.inclinationRad);
  return {
    x: sinI * Math.sin(state.longitudeOfAscendingNodeRad),
    y: -sinI * Math.cos(state.longitudeOfAscendingNodeRad),
    z: Math.cos(state.inclinationRad),
  };
}
