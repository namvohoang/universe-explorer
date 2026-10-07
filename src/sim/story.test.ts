import { describe, expect, it } from 'vitest';
import {
  CHAPTER_SECONDS,
  advanceStory,
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
});
