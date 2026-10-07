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

/** Real seconds taken to run through the time skipped between two chapters, when it is not jumped. */
export const SWEEP_SECONDS = 3;

/**
 * The date after `realSeconds` of play. A step that runs past a chapter carries on at the next
 * one's rate. Time skipped between two chapters is jumped over, or with `sweepSeconds` run
 * through in that many seconds, so that what changed in between is seen changing.
 */
export function advanceStory(
  times: StoryTimes,
  jd: number,
  realSeconds: number,
  sweepSeconds?: number,
): StoryStep {
  let at = clampToStory(times, jd);
  let left = realSeconds;
  while (left > 0 && at < times.endJd) {
    const index = chapterIndexAt(times, at);
    const end = chapterEndJd(times, index);
    const next = times.chapterJds[index + 1];
    const gap = next !== undefined && next > end;
    if (gap && at >= end) {
      // In the time skipped: over it at once, or through it quickly.
      if (sweepSeconds === undefined) {
        at = next;
        continue;
      }
      const rate = (next - end) / sweepSeconds;
      const toNext = (next - at) / rate;
      if (left < toNext) return { jd: at + left * rate, ended: false };
      at = next;
      left -= toNext;
      continue;
    }
    const rate = chapterDaysPerSecond(times, index);
    const toEnd = rate > 0 ? (end - at) / rate : 0;
    if (left < toEnd) return { jd: at + left * rate, ended: false };
    at = gap ? end : (next ?? times.endJd);
    left -= Math.max(0, toEnd);
    // A chapter that stops short ends there for this step; the skipped time starts on the next.
    if (gap && sweepSeconds === undefined) at = next;
  }
  return { jd: at, ended: at >= times.endJd };
}

/**
 * The date to draw for a date in the time skipped between two chapters: the last whole step
 * of `stepDays` since the chapter stopped. With a step of one turn of a world, the world is
 * seen swinging round its star without spinning into a blur. Any other date is drawn as it is.
 */
export function steppedInGap(times: StoryTimes, jd: number, stepDays: number): number {
  const index = chapterIndexAt(times, jd);
  const end = chapterEndJd(times, index);
  const next = times.chapterJds[index + 1];
  if (next === undefined || !(jd > end) || !(jd < next) || !(stepDays > 0)) return jd;
  return end + Math.floor((jd - end) / stepDays) * stepDays;
}
