import { describe, expect, it } from 'vitest';
import {
  CHAPTER_SECONDS,
  SWEEP_SECONDS,
  advanceStory,
  steppedInGap,
  chapterDaysPerSecond,
  chapterIndexAt,
  clampToStory,
  jdAtProgress,
  storyProgress,
  type StoryTimes,
} from './story';

// Placeholder instants for testing the clock, not astronomy: a short chapter, then a long one.
const TIMES: StoryTimes = { chapterJds: [100, 101, 111], endJd: 113 };

describe('story clock', () => {
  it('names the chapter that has started', () => {
    expect(chapterIndexAt(TIMES, 99)).toBe(0);
    expect(chapterIndexAt(TIMES, 100.5)).toBe(0);
    expect(chapterIndexAt(TIMES, 101)).toBe(1);
    expect(chapterIndexAt(TIMES, 500)).toBe(2);
  });

  it('holds a date inside the story', () => {
    expect(clampToStory(TIMES, 5)).toBe(100);
    expect(clampToStory(TIMES, 500)).toBe(113);
  });

  it('plays every chapter in the same real time', () => {
    for (const [index, from] of TIMES.chapterJds.entries()) {
      const { jd } = advanceStory(TIMES, from, CHAPTER_SECONDS / 2);
      const end = TIMES.chapterJds[index + 1] ?? TIMES.endJd;
      expect(jd).toBeCloseTo((from + end) / 2, 9);
    }
    expect(chapterDaysPerSecond(TIMES, 1)).toBeCloseTo(10 / CHAPTER_SECONDS, 12);
  });

  it('carries a step across a chapter boundary at the next rate', () => {
    const { jd, ended } = advanceStory(TIMES, 100.5, CHAPTER_SECONDS);
    expect(jd).toBeCloseTo(106, 9);
    expect(ended).toBe(false);
  });

  it('stops at the end', () => {
    expect(advanceStory(TIMES, 100, CHAPTER_SECONDS * 10)).toEqual({ jd: 113, ended: true });
    expect(advanceStory(TIMES, 113, 1)).toEqual({ jd: 113, ended: true });
  });

  it('does not move when no time has passed', () => {
    expect(advanceStory(TIMES, 105, 0)).toEqual({ jd: 105, ended: false });
  });

  it('gives each chapter the same share of the scrubber', () => {
    expect(storyProgress(TIMES, 100)).toBe(0);
    expect(storyProgress(TIMES, 101)).toBeCloseTo(1 / 3, 12);
    expect(storyProgress(TIMES, 106)).toBeCloseTo(0.5, 12);
    expect(storyProgress(TIMES, 113)).toBeCloseTo(1, 12);
  });

  it('turns a place on the scrubber back into its date', () => {
    for (const jd of [100, 100.25, 101, 104, 111, 112.5, 113]) {
      expect(jdAtProgress(TIMES, storyProgress(TIMES, jd))).toBeCloseTo(jd, 9);
    }
    expect(jdAtProgress(TIMES, -1)).toBe(100);
    expect(jdAtProgress(TIMES, 2)).toBe(113);
  });

  it('refuses a story with no chapters', () => {
    expect(() => chapterIndexAt({ chapterJds: [], endJd: 1 }, 0)).toThrow(RangeError);
  });

  describe('with time skipped between chapters', () => {
    // Two chapters of one day each, 50 days apart, then the end.
    const SKIPPING: StoryTimes = {
      chapterJds: [100, 150],
      chapterStopJds: [101, null],
      endJd: 151,
    };

    it('plays each chapter over its own day', () => {
      expect(advanceStory(SKIPPING, 100, CHAPTER_SECONDS / 2).jd).toBeCloseTo(100.5, 9);
      expect(chapterDaysPerSecond(SKIPPING, 0)).toBeCloseTo(1 / CHAPTER_SECONDS, 12);
    });

    it('skips from where one chapter stops to where the next starts', () => {
      const { jd, ended } = advanceStory(SKIPPING, 100.5, CHAPTER_SECONDS);
      expect(jd).toBeCloseTo(150.5, 9);
      expect(ended).toBe(false);
      expect(advanceStory(SKIPPING, 100, CHAPTER_SECONDS * 3)).toEqual({ jd: 151, ended: true });
    });

    it('lays the scrubber out over the days played, not the days skipped', () => {
      expect(storyProgress(SKIPPING, 100.5)).toBeCloseTo(0.25, 12);
      expect(storyProgress(SKIPPING, 150.5)).toBeCloseTo(0.75, 12);
      expect(jdAtProgress(SKIPPING, 0.25)).toBeCloseTo(100.5, 9);
      expect(jdAtProgress(SKIPPING, 0.75)).toBeCloseTo(150.5, 9);
      // A date in the skipped time counts as the end of the chapter before it.
      expect(storyProgress(SKIPPING, 120)).toBeCloseTo(0.5, 12);
    });
  });
});

describe('time skipped between two chapters, run through', () => {
  // One day shown at 100, then nothing until 150, where one more day is shown.
  const SKIPS: StoryTimes = { chapterJds: [100, 150], chapterStopJds: [101, null], endJd: 151 };

  it('is crossed in a few seconds once the chapter has stopped', () => {
    const stopped = advanceStory(SKIPS, 100, CHAPTER_SECONDS, SWEEP_SECONDS);
    expect(stopped.jd).toBeCloseTo(101, 9);
    const half = advanceStory(SKIPS, 101, SWEEP_SECONDS / 2, SWEEP_SECONDS);
    expect(half.jd).toBeCloseTo(125.5, 9);
    expect(half.ended).toBe(false);
    expect(advanceStory(SKIPS, 125.5, SWEEP_SECONDS / 2, SWEEP_SECONDS).jd).toBeCloseTo(150, 9);
  });

  it('then plays the next chapter at its own rate, to the end', () => {
    const on = advanceStory(SKIPS, 149.5, SWEEP_SECONDS + CHAPTER_SECONDS / 2, SWEEP_SECONDS);
    expect(on.jd).toBeGreaterThan(150);
    expect(on.jd).toBeLessThan(151);
    expect(advanceStory(SKIPS, 100, 1000, SWEEP_SECONDS)).toEqual({ jd: 151, ended: true });
  });

  it('is still jumped when no sweep is asked for', () => {
    expect(advanceStory(SKIPS, 100.5, CHAPTER_SECONDS).jd).toBeGreaterThanOrEqual(150);
  });

  it('is drawn a whole step at a time, and other dates as they are', () => {
    expect(steppedInGap(SKIPS, 110.7, 2)).toBeCloseTo(109, 9);
    expect(steppedInGap(SKIPS, 100.4, 2)).toBe(100.4);
    expect(steppedInGap(SKIPS, 150.3, 2)).toBe(150.3);
  });
});

describe('a story told slower', () => {
  const SLOW: StoryTimes = { chapterJds: [100, 110], endJd: 120, chapterSeconds: 28 };

  it('takes its own time over each chapter', () => {
    expect(advanceStory(SLOW, 100, 14).jd).toBeCloseTo(105, 9);
    expect(advanceStory(SLOW, 100, 28).jd).toBeCloseTo(110, 9);
    expect(advanceStory(SLOW, 100, 56)).toEqual({ jd: 120, ended: true });
  });
});
