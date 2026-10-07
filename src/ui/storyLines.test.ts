import { describe, expect, it } from 'vitest';
import { stories } from '../data/stories';
import { lineSpan, storyLines, storyNarrationId } from './storyLines';

describe('storyLines', () => {
  it('reads a story’s name and then each of its parts', () => {
    for (const story of stories) {
      const lines = storyLines(story);
      expect(lines).toHaveLength(story.chapters.length + 1);
      for (const line of lines) expect(line, story.id).toMatch(/\S/);
    }
  });

  it('says units as words', () => {
    const aurora = stories.find((story) => story.id === 'aurora');
    if (!aurora) throw new Error('the aurora story is expected');
    expect(storyLines(aurora).join(' ')).toContain('100 kilometres');
  });

  it('files a story’s recording apart from any card’s', () => {
    expect(new Set(stories.map(storyNarrationId)).size).toBe(stories.length);
    for (const story of stories) expect(storyNarrationId(story)).toBe(`story-${story.id}`);
  });
});

describe('lineSpan', () => {
  it('runs from a line’s start to the next line’s', () => {
    expect(lineSpan([0, 2.5, 7], 1)).toEqual({ from: 2.5, to: 7 });
  });

  it('runs to the end for the last line', () => {
    expect(lineSpan([0, 2.5, 7], 2)).toEqual({ from: 7, to: null });
  });
});
