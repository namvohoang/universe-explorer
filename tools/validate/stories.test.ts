import { describe, expect, it } from 'vitest';
import { catalogue } from '../../src/data/catalogue';
import { stories } from '../../src/data/stories';
import type { Chapter, Source, Story, StoryCraft } from '../../src/data/types';
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
        new Set(['saturn-v', 'lunar-module', 'columbia']),
      ),
    ).toEqual([]);
  });

  describe('a craft drawn as a 3D model', () => {
    const flying = (craft: Partial<StoryCraft>): Story =>
      story({
        path: 'staged',
        craft: [
          {
            id: 'rocket',
            nameKey: 'craftRocket',
            path: {
              centreId: 'earth',
              points: {
                sourceId: 'test',
                value: [
                  [10, 1, 0, 0],
                  [30, 2, 0, 0],
                ],
              },
            },
            ...craft,
          },
        ],
      });
    const shed = (atJd: number, share: number): NonNullable<StoryCraft['sheds']>[number] => ({
      atJd: { value: atJd, sourceId: 'test' },
      belowShare: { value: share, sourceId: 'test' },
    });
    const MODELS = new Set(['toy-rocket']);

    it('is accepted when the model is there and its parts come off in order', () => {
      const good = flying({
        modelOfId: 'toy-rocket',
        fromGround: true,
        sheds: [shed(15, 0.3), shed(25, 0.6)],
      });
      expect(checkStories([good], IDS, MODELS)).toEqual([]);
    });

    it('is rejected when the catalogue has no such model', () => {
      const errors = checkStories([flying({ modelOfId: 'teapot' })], IDS, MODELS);
      expect(errors.join('\n')).toMatch(/"teapot", which has no 3D model/);
    });

    it('is rejected when its parts come off out of order, or it has no model to cut', () => {
      const backwards = flying({ modelOfId: 'toy-rocket', sheds: [shed(25, 0.6), shed(15, 0.3)] });
      expect(checkStories([backwards], IDS, MODELS).join('\n')).toMatch(/sheds a part/);
      const bare = checkStories([flying({ sheds: [shed(15, 0.3)] })], IDS, MODELS);
      expect(bare.join('\n')).toMatch(/not drawn as a 3D model/);
    });

    it('is rejected when it has a flame or a blue sky and no note to say they are drawings', () => {
      const burn = (fromJd: number, untilJd: number): NonNullable<StoryCraft['burns']>[number] => ({
        fromJd: { value: fromJd, sourceId: 'test' },
        untilJd: { value: untilJd, sourceId: 'test' },
        flame: 'bright',
      });
      const burning = flying({ modelOfId: 'toy-rocket', burns: [burn(10, 20), burn(21, 25)] });
      expect(checkStories([burning], IDS, MODELS).join('\n')).toMatch(
        /flame, but the story has no note/,
      );
      expect(checkStories([{ ...burning, noteKey: 'storyTestNote' }], IDS, MODELS)).toEqual([]);
      const tangled = flying({ modelOfId: 'toy-rocket', burns: [burn(10, 20), burn(15, 25)] });
      expect(checkStories([tangled], IDS, MODELS).join('\n')).toMatch(/overlap or run backwards/);
      const towered = flying({ modelOfId: 'toy-rocket', fromGround: true, tower: true });
      expect(checkStories([towered], IDS, MODELS).join('\n')).toMatch(
        /tower, but the story has no note/,
      );
      const sky = story({ air: { ofId: 'earth', scaleHeightKm: { value: 8, sourceId: 'test' } } });
      expect(checkStories([sky], IDS).join('\n')).toMatch(/blue sky but has no note/);
    });
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
