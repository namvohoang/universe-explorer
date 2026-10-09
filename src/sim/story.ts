import type { Story } from '../data/types';
import { SECONDS_PER_DAY } from './constants';

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
  /** Real seconds each chapter takes, for a story told slower or faster than the usual. */
  readonly chapterSeconds?: number;
  /**
   * Where a chapter opens slowly: its first `days` are played over `seconds` real seconds,
   * before the rest of it takes the usual time. `null` for a chapter that does not.
   */
  readonly slowStarts?: readonly (SlowStart | null)[];
}

/** The opening of a chapter played slowly: so much of the story's time over so many real seconds. */
export interface SlowStart {
  readonly days: number;
  readonly seconds: number;
}

export function storyTimes(story: Story): StoryTimes {
  return {
    chapterJds: story.chapters.map((chapter) => chapter.atJd.value),
    chapterStopJds: story.chapters.map((chapter) => chapter.untilJd?.value ?? null),
    endJd: story.endJd.value,
    slowStarts: story.chapters.map((chapter) =>
      chapter.slowStart
        ? {
            days: chapter.slowStart.storySeconds / SECONDS_PER_DAY,
            seconds: chapter.slowStart.overSeconds,
          }
        : null,
    ),
    ...(story.chapterSeconds === undefined ? {} : { chapterSeconds: story.chapterSeconds }),
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

/** The slow opening of a chapter, cut short if the chapter itself is shorter; `null` if it has none. */
function slowStartOf(times: StoryTimes, index: number): SlowStart | null {
  const slow = times.slowStarts?.[index];
  const from = times.chapterJds[index];
  if (!slow || from === undefined || !(slow.days > 0) || !(slow.seconds > 0)) return null;
  const days = Math.min(slow.days, chapterEndJd(times, index) - from);
  return days > 0 ? { days, seconds: (slow.seconds * days) / slow.days } : null;
}

/** Simulated days per real second while a chapter plays, once any slow opening is over. */
export function chapterDaysPerSecond(times: StoryTimes, index: number): number {
  const from = times.chapterJds[index];
  if (from === undefined) throw new RangeError(`No chapter ${String(index)}`);
  const slowDays = slowStartOf(times, index)?.days ?? 0;
  return (chapterEndJd(times, index) - from - slowDays) / (times.chapterSeconds ?? CHAPTER_SECONDS);
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

/** A change of pace is worked out in steps of this many real seconds. */
const EASE_STEP_SECONDS = 1 / 240;

/** The rate of a chapter's slow opening, in days a second, when it is slower than the chapter's own. */
function slowRateOf(times: StoryTimes, index: number, fullRate: number): number | null {
  const slow = slowStartOf(times, index);
  if (!slow) return null;
  const rate = slow.days / slow.seconds;
  return rate < fullRate ? rate : null;
}

/** How much of a chapter is spent changing pace at one end: as long as the slow opening, but no more than a quarter of it. */
function easeDays(times: StoryTimes, index: number, slowIndex: number): number {
  const from = times.chapterJds[index] ?? 0;
  const whole = chapterEndJd(times, index) - from - (slowStartOf(times, index)?.days ?? 0);
  return Math.min(slowStartOf(times, slowIndex)?.days ?? 0, whole / 4);
}

/** Where a chapter starts to slow down into the slow opening of the next one; its end when it does not. */
function slowingFromJd(times: StoryTimes, index: number, fullRate: number): number {
  const end = chapterEndJd(times, index);
  const runsOn = times.chapterJds[index + 1] === end;
  if (!runsOn || slowRateOf(times, index + 1, fullRate) === null) return end;
  return end - easeDays(times, index, index + 1);
}

const smooth = (through: number): number => through * through * (3 - 2 * through);

/**
 * The rate at a date where a chapter is changing pace, and the date that change lasts until:
 * just after its own slow opening it speeds up to its full rate, and just before a next
 * chapter that opens slowly it slows down to that. `null` where it plays at its full rate.
 * The pace then never jumps: a slow opening is come into and left smoothly.
 */
function easedRate(
  times: StoryTimes,
  index: number,
  at: number,
  fullRate: number,
): { readonly rate: number; readonly untilJd: number } | null {
  const end = chapterEndJd(times, index);
  const slowingFrom = slowingFromJd(times, index, fullRate);
  if (at >= slowingFrom && slowingFrom < end) {
    const into = slowRateOf(times, index + 1, fullRate) ?? fullRate;
    const through = (end - at) / (end - slowingFrom);
    return { rate: into + (fullRate - into) * smooth(through), untilJd: end };
  }
  const own = slowRateOf(times, index, fullRate);
  const opened = (times.chapterJds[index] ?? at) + (slowStartOf(times, index)?.days ?? 0);
  const days = easeDays(times, index, index);
  if (own !== null && days > 0 && at < opened + days) {
    const through = Math.max(0, (at - opened) / days);
    return { rate: own + (fullRate - own) * smooth(through), untilJd: opened + days };
  }
  return null;
}

export interface StoryStep {
  readonly jd: number;
  /** True once the end of the story is reached; the date then stays there. */
  readonly ended: boolean;
}

/** Real seconds taken to run through the time skipped between two chapters, when it is not jumped. */
export const SWEEP_SECONDS = 4;

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
    const slow = slowStartOf(times, index);
    const slowUntil = (times.chapterJds[index] ?? at) + (slow?.days ?? 0);
    if (slow && at < slowUntil) {
      // The chapter's opening, played slowly.
      const slowRate = slow.days / slow.seconds;
      const toFull = (slowUntil - at) / slowRate;
      if (left < toFull) return { jd: at + left * slowRate, ended: false };
      at = slowUntil;
      left -= toFull;
      if (at < end) continue;
    }
    const rate = chapterDaysPerSecond(times, index);
    const eased = easedRate(times, index, at, rate);
    if (eased) {
      // Speeding up out of a slow opening, or slowing into the next one: a little at a time.
      const step = Math.min(left, EASE_STEP_SECONDS);
      const to = at + eased.rate * step;
      // The whole step is spent unless the change of pace ends within it. (Worked back from
      // the dates, a step would come out a hair short for ever.)
      left -= to < eased.untilJd ? step : Math.min(step, (eased.untilJd - at) / eased.rate);
      at = Math.min(to, eased.untilJd);
      if (at < end) continue;
      left = Math.max(0, left);
    }
    const fullUntil = eased ? end : slowingFromJd(times, index, rate);
    const toEnd = rate > 0 ? (fullUntil - at) / rate : 0;
    if (left < toEnd) return { jd: at + left * rate, ended: false };
    if (fullUntil < end) {
      at = fullUntil;
      left -= toEnd;
      continue;
    }
    at = gap ? end : (next ?? times.endJd);
    left -= Math.max(0, toEnd);
    // A chapter that stops short ends there for this step; the skipped time starts on the next.
    if (gap && sweepSeconds === undefined) at = next;
  }
  return { jd: at, ended: at >= times.endJd };
}

/**
 * The date to draw for a date in the time skipped between two chapters, for a world that
 * turns once in `stepDays`. Drawn date for date, the world would spin into a blur. So the
 * dates drawn are picked a whole number of turns apart, plus a little more each time: the
 * world is seen swinging round its star while it turns on smoothly, a part of one turn over
 * the whole gap, and it arrives at the next chapter turned exactly as that chapter starts.
 * Every date drawn is a real one. Any date outside a gap is drawn as it is.
 */
export function steppedInGap(times: StoryTimes, jd: number, stepDays: number): number {
  const index = chapterIndexAt(times, jd);
  const end = chapterEndJd(times, index);
  const next = times.chapterJds[index + 1];
  if (next === undefined || !(jd > end) || !(jd < next) || !(stepDays > 0)) return jd;
  const gap = next - end;
  const through = (jd - end) / gap;
  // The gap is so many whole turns and a part of one: the whole turns are stepped over, and
  // the part of one is turned through evenly.
  const turns = Math.floor(gap / stepDays);
  const over = gap - turns * stepDays;
  return end + Math.floor(through * turns) * stepDays + through * over;
}
