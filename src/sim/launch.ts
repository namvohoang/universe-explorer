import type { CelestialObject, PathSample, StagedPath } from '../data/types';
import { isKnown } from '../data/types';
import { northPoleEcliptic, poleOf } from './frames';
import {
  drawnThrough,
  groundVelocityKmPerS,
  noseDirection,
  pathPositionKm,
  pathVelocityKmPerS,
} from './trajectory';
import type { Vec3 } from './vec3';

/** How a body turns: the pole it turns anticlockwise about (ecliptic frame) and how long a turn takes. */
export interface Turning {
  readonly north: Vec3;
  readonly turnHours: number;
}

/** A body's turning from the catalogue, or `null` when its pole or its day is not known. */
export function turningOf(body: CelestialObject | undefined): Turning | null {
  const shape = body?.shape;
  if (shape?.type !== 'spheroid' && shape?.type !== 'triaxial') return null;
  const { orientation } = shape;
  const pole = poleOf(orientation);
  const hours = orientation.rotationPeriodHours;
  if (!pole || !isKnown(hours) || orientation.rotation === 'synchronous') return null;
  const north = northPoleEcliptic(pole);
  return orientation.rotation === 'retrograde'
    ? { north: { x: -north.x, y: -north.y, z: -north.z }, turnHours: hours.value }
    : { north, turnHours: hours.value };
}

const STILL: Vec3 = { x: 0, y: 0, z: 0 };

/** How fast the ground under a place moves, in km/s; nothing when the body's turning is not known. */
function groundAt(placeKm: Vec3, turning: Turning | null): Vec3 {
  return turning ? groundVelocityKmPerS(placeKm, turning.north, turning.turnHours) : STILL;
}

/**
 * The curve drawn through the known places of a staged path. A craft that stands on the
 * ground at the first of them leaves it from rest: that place is given the ground's own speed.
 */
export function stagedSamples(
  path: StagedPath,
  fromGround: boolean,
  turning: Turning | null,
): PathSample[] {
  const points = path.points.value;
  const first = points[0];
  if (!fromGround || !first || !turning) return drawnThrough(points);
  return drawnThrough(points, groundAt({ x: first[1], y: first[2], z: first[3] }, turning));
}

/**
 * Which way a craft's nose is drawn pointing at a date on its path round a turning body: the
 * way it moves over the ground, and straight up while it stands on it. A unit vector in the
 * ecliptic frame.
 */
export function noseAlong(
  samples: readonly PathSample[],
  turning: Turning | null,
  jd: number,
): Vec3 {
  const place = pathPositionKm(samples, jd);
  return noseDirection(place, pathVelocityKmPerS(samples, jd), groundAt(place, turning));
}

/**
 * How much of a craft, from its tail, it has let go of by a date: the largest share among
 * the parts shed at or before then, and 0 while it is whole.
 */
export function shedShareAt(
  sheds: readonly {
    readonly atJd: { readonly value: number };
    readonly belowShare: { readonly value: number };
  }[],
  jd: number,
): number {
  return Math.max(
    0,
    ...sheds.filter((shed) => shed.atJd.value <= jd).map((shed) => shed.belowShare.value),
  );
}
