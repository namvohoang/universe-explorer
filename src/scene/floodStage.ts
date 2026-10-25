/**
 * How high a drawn river stands on its measuring post, in metres, through a flood: low and
 * steady before the rain, rising while it rains to its highest mark at `peakJd`, then falling
 * back over the days after. Only the highest mark and when it came are real (`peakM`,
 * `peakJd`); how the water gets there and back is a drawing, and so is where it starts.
 */
export interface FloodStage {
  /** The highest the water stood on the post, and when. */
  readonly peakM: number;
  readonly peakJd: number;
  /** When the rain began. */
  readonly rainFromJd: number;
  /** Where the drawn water stands before the rain and again once the flood has gone. */
  readonly lowM: number;
  /** How many days the drawn water takes to fall back to `lowM` after its highest. */
  readonly fallDays: number;
}

const ease = (t: number): number => {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
};

/** The water on the post at `jd`, in metres. */
export function floodStageM(stage: FloodStage, jd: number): number {
  const { peakM, peakJd, rainFromJd, lowM, fallDays } = stage;
  if (jd <= peakJd) return lowM + (peakM - lowM) * ease((jd - rainFromJd) / (peakJd - rainFromJd));
  return peakM - (peakM - lowM) * ease((jd - peakJd) / fallDays);
}

/**
 * How high the water stands on the land behind the banks, in metres on the same post: none
 * until the river rises over the top of the banks (`bankM`), then as high as the river, and
 * draining away more slowly than the river falls, since the land holds it. A drawing.
 */
export function floodPlainM(stage: FloodStage, bankM: number, groundM: number, jd: number): number {
  if (jd <= stage.peakJd) {
    const river = floodStageM(stage, jd);
    return river > bankM ? river : groundM;
  }
  const highest = stage.peakM > bankM ? stage.peakM : groundM;
  // The land drains over twice as long as the river takes to fall.
  const drained = ease((jd - stage.peakJd) / (2 * stage.fallDays));
  return highest - (highest - groundM) * drained;
}
