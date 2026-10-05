/** A frame slower than this is a slow one: under 40 frames a second. */
export const SLOW_FRAME_MS = 25;
/** How many frames in a row are looked at before deciding the device cannot keep up. */
export const FRAMES_WATCHED = 90;
/** Each step down draws this much less sharply; it never goes below one pixel per pixel. */
const STEP = 0.5;
const LOWEST = 1;

export interface FrameWatch {
  /** Takes the time one frame took. True when the frames watched were slow on average. */
  add(milliseconds: number): boolean;
}

/** Watches frame times in batches and says when a whole batch ran slow. */
export function createFrameWatch(): FrameWatch {
  let total = 0;
  let frames = 0;
  return {
    add(milliseconds) {
      total += milliseconds;
      frames += 1;
      if (frames < FRAMES_WATCHED) return false;
      const slow = total / frames > SLOW_FRAME_MS;
      total = 0;
      frames = 0;
      return slow;
    },
  };
}

/** The next pixel ratio down, or the same one when it is already as low as it goes. */
export function lowerPixelRatio(current: number): number {
  return Math.max(LOWEST, current - STEP);
}
