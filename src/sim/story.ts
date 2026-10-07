import type { Story } from '../data/types';

/**
 * Real seconds each chapter takes to play, however long it lasted: a launch of minutes and a
 * coast of days are each given the same time to watch and to read the sentence that goes with it.
 */
export const CHAPTER_SECONDS = 14;

/** A story's instants as plain Julian dates. */
export interface StoryTimes {
  /** When each chapter starts, earliest first. */
  readonly chapterJds: readonly number[];
  /**
   * Where a chapter stops short of the next one's start, the date it stops; the story then
   * skips the time between. Left out, or `null` for a chapter, when it runs on into the next.
   */
  readonly chapterStopJds?: readonly (number | null)[];
  readonly endJd: number;
}

export function storyTimes(story: Story): StoryTimes {
  return {
    chapterJds: story.chapters.map((chapter) => chapter.atJd.value),
    chapterStopJds: story.chapters.map((chapter) => chapter.untilJd?.value ?? null),
    endJd: story.endJd.value,
  };
}

function startJd(times: StoryTimes): number {
  const first = times.chapterJds[0];
  if (first === undefined) throw new RangeError('A story needs at least one chapter');
  return first;
}

/** A date held inside the story. */
export function clampToStory(times: StoryTimes, jd: number): number {
  return Math.min(Math.max(jd, startJd(times)), times.endJd);
}

/** The chapter playing at a date: the last one that has started. */
export function chapterIndexAt(times: StoryTimes, jd: number): number {
  startJd(times);
  let index = 0;
  for (const [i, at] of times.chapterJds.entries()) if (jd >= at) index = i;
  return index;
}

/** When a chapter ends: where it is told to stop, else at the start of the next one, or at the end of the story. */
export function chapterEndJd(times: StoryTimes, index: number): number {
  return times.chapterStopJds?.[index] ?? times.chapterJds[index + 1] ?? times.endJd;
}

/** Simulated days per real second while a chapter plays. */
export function chapterDaysPerSecond(times: StoryTimes, index: number): number {
  const from = times.chapterJds[index];
  if (from === undefined) throw new RangeError(`No chapter ${String(index)}`);
  return (chapterEndJd(times, index) - from) / CHAPTER_SECONDS;
}

/**
 * How far through the story a date is, from 0 to 1, counting every chapter as the same length
 * as it is when played. A scrubber laid out this way gives a short launch as much room as a
 * long coast.
 */
export function storyProgress(times: StoryTimes, jd: number): number {
  const at = clampToStory(times, jd);
  const index = chapterIndexAt(times, at);
  const from = times.chapterJds[index] ?? at;
  const span = chapterEndJd(times, index) - from;
  // A date in the time skipped after a chapter counts as that chapter's end.
  const within = span > 0 ? Math.min(1, (at - from) / span) : 0;
  return (index + within) / times.chapterJds.length;
}

/** The date at a place along the scrubber; the reverse of `storyProgress`. */
export function jdAtProgress(times: StoryTimes, progress: number): number {
  const count = times.chapterJds.length;
  const along = Math.min(Math.max(progress, 0), 1) * count;
  const index = Math.min(Math.floor(along), count - 1);
  const from = times.chapterJds[index] ?? startJd(times);
  return from + (along - index) * (chapterEndJd(times, index) - from);
}

export interface StoryStep {
  readonly jd: number;
  /** True once the end of the story is reached; the date then stays there. */
  readonly ended: boolean;
}

/** The date after `realSeconds` of play. A step that runs past a chapter carries on at the next one's rate. */
export function advanceStory(times: StoryTimes, jd: number, realSeconds: number): StoryStep {
  let at = clampToStory(times, jd);
  let left = realSeconds;
  while (left > 0 && at < times.endJd) {
    const index = chapterIndexAt(times, at);
    const end = chapterEndJd(times, index);
    const rate = chapterDaysPerSecond(times, index);
    const toEnd = rate > 0 ? (end - at) / rate : 0;
    if (left < toEnd) return { jd: at + left * rate, ended: false };
    // On to the next chapter, skipping any time between where this one stops and that one starts.
    at = times.chapterJds[index + 1] ?? times.endJd;
    left -= Math.max(0, toEnd);
  }
  return { jd: at, ended: at >= times.endJd };
}
