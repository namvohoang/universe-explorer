/**
 * How a close-up moves from one part of a story to the next: what changes (rain starting, a
 * world turning to Mars, the real land taking over from the drawing) settles into place over
 * a moment of real time instead of popping.
 */

/** Half of any change is done in this many real seconds; nearly all of it in about a second. */
export const SETTLE_HALF_SECONDS = 0.22;

/** Closer than this to where it is aimed, a settling value is taken as there. */
const SETTLED = 1e-3;

/**
 * Where a value is after `seconds` of moving towards `target`, halving the way left every
 * `halfSeconds`. With no time (reduced motion) it is there at once.
 */
export function settleToward(
  value: number,
  target: number,
  seconds: number,
  halfSeconds = SETTLE_HALF_SECONDS,
): number {
  if (!(seconds > 0) || !(halfSeconds > 0)) return target;
  const next = target + (value - target) * 0.5 ** (seconds / halfSeconds);
  return Math.abs(next - target) < SETTLED ? target : next;
}

/** A value that follows where it is aimed. */
export interface Settling {
  readonly value: number;
  readonly target: number;
  /** Aims it; the first aim puts it there at once, so a close-up opens already in place. */
  aim(target: number): void;
  /** Moves it on by so many real seconds; true if it moved. */
  step(seconds: number): boolean;
}

export function settling(halfSeconds = SETTLE_HALF_SECONDS): Settling {
  let value = Number.NaN;
  let target = Number.NaN;
  return {
    get value() {
      return value;
    },
    get target() {
      return target;
    },
    aim(to) {
      if (Number.isNaN(value)) value = to;
      target = to;
    },
    step(seconds) {
      if (Number.isNaN(target) || value === target) return false;
      value = settleToward(value, target, seconds, halfSeconds);
      return true;
    },
  };
}
