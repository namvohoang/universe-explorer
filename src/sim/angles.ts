/** The catalogue stores angles in degrees; src/sim converts to radians internally. */
export const TAU = 2 * Math.PI;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Wraps an angle in radians into [0, 2π). */
export function wrapTau(rad: number): number {
  const wrapped = rad % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
}
