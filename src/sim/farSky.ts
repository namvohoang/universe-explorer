import { add, dot, scale, subtract, type Vec3 } from './vec3';

/**
 * Where a line of sight ends on a far sky drawn as a ball round `centre`: the place it leaves
 * the ball, going from `from` along the unit direction `towards`. The viewer has to be inside
 * the ball. The real stars are far beyond any such ball; it is a way of drawing which way a
 * thing is seen, not a place.
 */
export function onFarSky(from: Vec3, towards: Vec3, centre: Vec3, radius: number): Vec3 {
  const out = subtract(from, centre);
  const along = dot(out, towards);
  const inside = radius * radius - dot(out, out);
  if (!(inside > 0)) throw new RangeError('the viewer must be inside the far sky');
  return add(from, scale(towards, -along + Math.sqrt(along * along + inside)));
}

/**
 * How big the far sky is drawn at a date: it starts at `radius` and has grown by the share
 * `spread` at the end. A track drawn on it then winds outwards, so that where the thing seen
 * goes back over its own way the two passes lie side by side, not on top of each other.
 */
export function farSkyRadius(
  radius: number,
  spread: number,
  fromJd: number,
  toJd: number,
  jd: number,
): number {
  const through = toJd > fromJd ? Math.min(1, Math.max(0, (jd - fromJd) / (toJd - fromJd))) : 0;
  return radius * (1 + spread * through);
}
