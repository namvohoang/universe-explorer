import { describe, expect, it } from 'vitest';
import { catalogue } from '../../src/data/catalogue';
import { stories } from '../../src/data/stories';
import type { Chapter, Source, Story } from '../../src/data/types';
import { checkStories } from './stories';

// Placeholder values for testing the checks, not astronomy.
const SOURCE: Source = {
  id: 'test',
  title: 'Test page',
  url: 'https://example.nasa.gov/page',
  retrieved: '2026-10-07',
};
const chapter = (id: string, atJd: number, lookAtId = 'earth'): Chapter => ({
  id,
  atJd: { value: atJd, sourceId: 'test' },
  text: { key: `story-${id}`, sourceId: 'test', quote: 'Words from the page.' },
  lookAtId,
});
const story = (changes: Partial<Story> = {}): Story => ({
  id: 'test-story',
  group: 'sky-events',
  path: 'orbits',
  titleKey: 'storyTest',
  chapters: [chapter('one', 10), chapter('two', 20)],
  endJd: { value: 30, sourceId: 'test' },
  actorIds: ['earth', 'moon'],
  sources: [SOURCE],
  ...changes,
});
const IDS = ['earth', 'moon'];

describe('checkStories', () => {
  it('accepts a well-formed story', () => {
    expect(checkStories([story()], IDS)).toEqual([]);
  });

  it('accepts the stories in the app', () => {
    expect(
      checkStories(
        stories,
        catalogue.map((object) => object.id),
      ),
    ).toEqual([]);
  });

  it('rejects chapters out of order', () => {
    const errors = checkStories(
      [story({ chapters: [chapter('one', 20), chapter('two', 10)] })],
      IDS,
    );
    expect(errors.join('\n')).toMatch(/"two" does not start after/);
  });

  it('rejects an end before the last chapter', () => {
    const errors = checkStories([story({ endJd: { value: 15, sourceId: 'test' } })], IDS);
    expect(errors.join('\n')).toMatch(/ends before its last chapter/);
  });

  it('rejects an actor that is not in the catalogue', () => {
    const errors = checkStories([story({ actorIds: ['earth', 'moon', 'teapot'] })], IDS);
    expect(errors.join('\n')).toMatch(/"teapot" is not in the catalogue/);
  });

  it('rejects a chapter that looks at something the story does not draw', () => {
    const errors = checkStories([story({ chapters: [chapter('one', 10, 'mars')] })], IDS);
    expect(errors.join('\n')).toMatch(/looks at "mars"/);
  });

  it('rejects a time with no source', () => {
    const errors = checkStories([story({ endJd: { value: 30, sourceId: 'nowhere' } })], IDS);
    expect(errors.join('\n')).toMatch(/cites "nowhere"/);
  });

  it('rejects a sentence with nothing behind it', () => {
    const bare: Chapter = {
      ...chapter('one', 10),
      text: { key: 'k', sourceId: 'test', quote: ' ' },
    };
    expect(checkStories([story({ chapters: [bare] })], IDS).join('\n')).toMatch(/has no quote/);
  });

  it('rejects two stories with one id and a story with no chapters', () => {
    const errors = checkStories([story(), story({ chapters: [] })], IDS).join('\n');
    expect(errors).toMatch(/id is used twice/);
    expect(errors).toMatch(/has no chapters/);
  });
});
