import { add, cross, dot, length, scale, subtract, type Vec3 } from './vec3';

/**
 * The share of the Sun's disc that a round body hides, seen from a point: 0 in full sunlight,
 * 1 where the Sun is wholly hidden (the dark middle of a shadow, the umbra), and in between
 * in the pale edge (the penumbra). A body that looks smaller than the Sun and sits in front of
 * it hides only the share its disc covers. All lengths in one unit.
 */
export function sunCover(
  point: Vec3,
  sun: Vec3,
  sunRadius: number,
  caster: Vec3,
  casterRadius: number,
): number {
  const toSun = subtract(sun, point);
  const toCaster = subtract(caster, point);
  const sunDistance = length(toSun);
  const casterDistance = length(toCaster);
  // Something beyond the Sun, or the point inside either body, casts no shadow here.
  if (casterDistance >= sunDistance || casterDistance <= casterRadius) return 0;
  const sunAngle = Math.asin(Math.min(1, sunRadius / sunDistance));
  const casterAngle = Math.asin(Math.min(1, casterRadius / casterDistance));
  // From the cross product, which keeps its accuracy for the tiny angles between two discs.
  const apart = Math.atan2(length(cross(toSun, toCaster)), dot(toSun, toCaster));
  if (apart >= sunAngle + casterAngle) return 0;
  if (apart <= Math.abs(casterAngle - sunAngle)) {
    return casterAngle >= sunAngle ? 1 : (casterAngle * casterAngle) / (sunAngle * sunAngle);
  }
  // Two discs that overlap in part: the area of the lens they share, over the Sun's area.
  const a = sunAngle;
  const b = casterAngle;
  const d = apart;
  const alpha = Math.acos((d * d + a * a - b * b) / (2 * d * a));
  const beta = Math.acos((d * d + b * b - a * a) / (2 * d * b));
  const lens = a * a * (alpha - Math.sin(2 * alpha) / 2) + b * b * (beta - Math.sin(2 * beta) / 2);
  return Math.min(1, lens / (Math.PI * a * a));
}

/** A shadow where it reaches another body. */
export interface ShadowAt {
  /** How far the shadow's middle line passes from the body's centre. */
  readonly axisDistance: number;
  /** The point of the middle line nearest the body's centre. */
  readonly axisPoint: Vec3;
  /** How wide the pale edge of the shadow is there, as a radius. */
  readonly penumbraRadius: number;
  /**
   * How wide the dark middle is there, as a radius; below zero where the shadow's tip falls
   * short, and the caster shows as a dark disc with a ring of Sun round it.
   */
  readonly umbraRadius: number;
}

/**
 * The shadow a round body casts, measured where it passes another body: two cones that touch
 * both the Sun and the caster, one narrowing behind the caster (the umbra) and one widening
 * (the penumbra). All lengths in one unit.
 */
export function shadowAt(
  sun: Vec3,
  sunRadius: number,
  caster: Vec3,
  casterRadius: number,
  body: Vec3,
): ShadowAt {
  const axis = subtract(caster, sun);
  const sunToCaster = length(axis);
  const along = scale(axis, 1 / sunToCaster);
  // How far down the shadow, behind the caster, the body's centre is.
  const depth = dot(subtract(body, caster), along);
  const axisPoint = add(caster, scale(along, depth));
  return {
    axisDistance: length(subtract(body, axisPoint)),
    axisPoint,
    penumbraRadius: casterRadius + ((sunRadius + casterRadius) * depth) / sunToCaster,
    umbraRadius: casterRadius - ((sunRadius - casterRadius) * depth) / sunToCaster,
  };
}

/**
 * Where the middle line of a shadow first meets a round body's surface, coming from the
 * caster; `null` when it misses.
 */
export function shadowCentreOn(
  sun: Vec3,
  caster: Vec3,
  body: Vec3,
  bodyRadius: number,
): Vec3 | null {
  const along = subtract(caster, sun);
  const direction = scale(along, 1 / length(along));
  const toBody = subtract(body, caster);
  const depth = dot(toBody, direction);
  const missSquared = dot(toBody, toBody) - depth * depth;
  const inside = bodyRadius * bodyRadius - missSquared;
  if (inside < 0 || depth < 0) return null;
  return add(caster, scale(direction, depth - Math.sqrt(inside)));
}
