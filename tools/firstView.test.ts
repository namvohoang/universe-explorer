import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import { FIRST_VIEW } from './firstView';

describe('what is stored on the first visit', () => {
  it('is the maps and models of the Sun and the planets, and the first reading', () => {
    const drawnAtOnce = catalogue
      .filter((object) => object.kind === 'star' || object.kind === 'planet')
      .flatMap((object) => object.media.filter((media) => media.role !== 'picture'))
      .map((media) => media.file.replace(/^public\//, ''));
    expect([...FIRST_VIEW].sort()).toEqual([...drawnAtOnce, 'voice/solar-system.mp3'].sort());
  });
});
