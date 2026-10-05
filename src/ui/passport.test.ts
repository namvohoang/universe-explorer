import { describe, expect, it } from 'vitest';
import { formatVisited, parseVisited } from './passport';

const known = new Set(['earth', 'mars', 'titan']);

describe('space passport', () => {
  it('reads back what it wrote', () => {
    const visited = new Set(['mars', 'earth']);
    expect(formatVisited(visited)).toBe('["earth","mars"]');
    expect(parseVisited(formatVisited(visited), known)).toEqual(visited);
  });

  it('drops places that no longer exist', () => {
    expect(parseVisited('["earth","vulcan"]', known)).toEqual(new Set(['earth']));
  });

  it('starts empty when nothing was saved or the note is damaged', () => {
    for (const saved of [null, '', '{', '"earth"', '{"earth":true}', '[1,2,null]']) {
      expect(parseVisited(saved, known).size).toBe(0);
    }
  });
});
