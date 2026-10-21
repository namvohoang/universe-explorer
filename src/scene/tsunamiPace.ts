/**
 * How far the drawn tsunami has gone across the sea cut open, and how much it has grown, at
 * so many minutes after it began. The drawing is not to scale: these are choices of pace,
 * so that one wave goes on from part to part, slow at sea and growing as the sea gets shallow.
 */
export interface TsunamiPace {
  /** 0 where it begins over the trench, 1 where the sea meets the shelf. */
  readonly progress: number;
  /** 0 in deep water, 1 breaking at the shore. */
  readonly shoaling: number;
  /** How far the sea floor is still lifted, 1 at the start and 0 once it has settled. */
  readonly uplift: number;
}

/** [minutes after it began, progress, shoaling], in order of minutes. */
const STEPS: readonly (readonly [number, number, number])[] = [
  [0, 0, 0.08],
  [20, 0.15, 0.12],
  [90, 0.4, 0.2],
  [180, 0.6, 0.32],
  [360, 0.85, 0.65],
  [720, 1, 1],
];

/** Minutes the lifted sea floor takes to settle. */
const UPLIFT_MINUTES = 20;

export function tsunamiPace(minutesAfter: number): TsunamiPace {
  const uplift = Math.min(1, Math.max(0, 1 - minutesAfter / UPLIFT_MINUTES));
  const first = STEPS[0];
  if (!first || !(minutesAfter > first[0])) {
    return { progress: first?.[1] ?? 0, shoaling: first?.[2] ?? 0, uplift };
  }
  for (let i = 1; i < STEPS.length; i++) {
    const from = STEPS[i - 1];
    const to = STEPS[i];
    if (!from || !to || minutesAfter > to[0]) continue;
    const t = (minutesAfter - from[0]) / (to[0] - from[0]);
    return {
      progress: from[1] + (to[1] - from[1]) * t,
      shoaling: from[2] + (to[2] - from[2]) * t,
      uplift,
    };
  }
  const last = STEPS[STEPS.length - 1];
  return { progress: last?.[1] ?? 1, shoaling: last?.[2] ?? 1, uplift };
}
