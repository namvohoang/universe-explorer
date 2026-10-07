import { SECONDS_PER_DAY } from './constants';
import { cross, dot, normalize, scale, subtract, type Vec3 } from './vec3';

const DEG = Math.PI / 180;
const SECONDS_PER_HOUR = 3600;

/** How a body is turned: its north pole, and where its latitude 0, longitude 0 pointed at one date. */
export interface Turned {
  /** Unit vector along the north pole, in the same frame as `primeMeridian`. */
  readonly pole: Vec3;
  readonly atJd: number;
  readonly primeMeridian: Vec3;
  /** Time for one turn against the stars, in hours. */
  readonly rotationPeriodHours: number;
}

/**
 * The direction from a turning body's centre out through a place on its ground at a date: the
 * other way round from `groundUnder`. A unit vector in the frame of `turned`.
 */
export function groundDirection(
  place: { readonly lonDegEast: number; readonly latDeg: number },
  turned: Turned,
  jd: number,
): Vec3 {
  const { pole } = turned;
  const meridian = normalize(
    subtract(turned.primeMeridian, scale(pole, dot(turned.primeMeridian, pole))),
  );
  const east = cross(pole, meridian);
  const turns =
    ((jd - turned.atJd) * SECONDS_PER_DAY) / (turned.rotationPeriodHours * SECONDS_PER_HOUR);
  // The ground has turned east since the date the meridian is known at.
  const lon = (place.lonDegEast + 360 * turns) * DEG;
  const lat = place.latDeg * DEG;
  const level = Math.cos(lat);
  return {
    x: level * (Math.cos(lon) * meridian.x + Math.sin(lon) * east.x) + Math.sin(lat) * pole.x,
    y: level * (Math.cos(lon) * meridian.y + Math.sin(lon) * east.y) + Math.sin(lat) * pole.y,
    z: level * (Math.cos(lon) * meridian.z + Math.sin(lon) * east.z) + Math.sin(lat) * pole.z,
  };
}

/**
 * The point of a turning body's ground that lies under a direction from its centre at a date:
 * longitude in degrees east (from -180 to 180) and latitude in degrees north, both measured
 * from the centre.
 */
export function groundUnder(
  direction: Vec3,
  turned: Turned,
  jd: number,
): { readonly lonDegEast: number; readonly latDeg: number } {
  const { pole } = turned;
  const towards = normalize(direction);
  // The meridian's direction squared up to the pole, and the direction a quarter turn east of it.
  const meridian = normalize(
    subtract(turned.primeMeridian, scale(pole, dot(turned.primeMeridian, pole))),
  );
  const east = cross(pole, meridian);
  const lonThen = Math.atan2(dot(towards, east), dot(towards, meridian)) / DEG;
  // The ground has since turned east under the direction, so the point under it lies further west.
  const turns =
    ((jd - turned.atJd) * SECONDS_PER_DAY) / (turned.rotationPeriodHours * SECONDS_PER_HOUR);
  const lon = lonThen - 360 * turns;
  return {
    lonDegEast: ((((lon + 180) % 360) + 360) % 360) - 180,
    latDeg: Math.asin(Math.min(1, Math.max(-1, dot(towards, pole)))) / DEG,
  };
}
