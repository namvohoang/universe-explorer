/**
 * The two shadows behind a ball lit by a bigger ball, as cones round the line through both.
 * Lengths are in any one unit; `along` is measured from the middle of the ball that casts the
 * shadow, away from the light.
 */
export interface ShadowCones {
  /** Where the dark middle (the umbra) leaves the ball, and where it comes to a point. */
  readonly umbraFrom: number;
  readonly umbraTo: number;
  /** Where the pale edge (the penumbra) leaves the ball; it widens for ever. */
  readonly penumbraFrom: number;
  /** How wide each shadow is, as a radius, at a place along the line. */
  umbraRadius(along: number): number;
  penumbraRadius(along: number): number;
}

/**
 * The cones that just touch both balls: the umbra's sides run along the outside of both, the
 * penumbra's cross over between them. The light must be the bigger ball, and the two apart.
 */
export function shadowCones(lightRadius: number, casterRadius: number, apart: number): ShadowCones {
  if (!(lightRadius > casterRadius) || !(casterRadius > 0)) {
    throw new RangeError('the light must be bigger than what casts the shadow');
  }
  if (!(apart > lightRadius + casterRadius)) throw new RangeError('the two balls must be apart');
  // The sine of each cone's half angle.
  const narrowing = (lightRadius - casterRadius) / apart;
  const widening = (lightRadius + casterRadius) / apart;
  const umbraTo = casterRadius / narrowing;
  const crossing = casterRadius / widening;
  const slope = (sine: number): number => sine / Math.sqrt(1 - sine * sine);
  return {
    umbraFrom: casterRadius * narrowing,
    umbraTo,
    penumbraFrom: -casterRadius * widening,
    umbraRadius: (along) => Math.max(0, umbraTo - along) * slope(narrowing),
    penumbraRadius: (along) => Math.max(0, crossing + along) * slope(widening),
  };
}
