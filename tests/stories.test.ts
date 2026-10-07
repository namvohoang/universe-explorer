import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import { scenePositions } from '../src/sim/layout';
import { illuminatedFraction } from '../src/sim/phase';
import { createScale } from '../src/sim/scale';
import { moonPhases } from '../src/data/stories/moonPhases';

/**
 * How far the lit share of the Moon the app draws may be from the phase the almanac names, at
 * the almanac's instant. The Moon here follows mean elements, good to a degree or two; near a
 * quarter one degree changes the lit share by just under 0.01.
 */
const LIT_SHARE_TOLERANCE = 0.02;

describe('the Moon’s phases story', () => {
  const litShareAt = (jd: number): number => {
    const positions = scenePositions(catalogue, jd, createScale('true'));
    const at = (id: string) => {
      const position = positions.get(id);
      if (!position) throw new Error(`no ${id}`);
      return position;
    };
    return illuminatedFraction(at('moon'), at('sun'), at('earth'));
  };

  it('shows each phase at the instant the almanac gives for it', () => {
    const expected: Readonly<Record<string, number>> = {
      'new-moon': 0,
      'first-quarter': 0.5,
      'full-moon': 1,
      'last-quarter': 0.5,
    };
    for (const chapter of moonPhases.chapters) {
      const share = litShareAt(chapter.atJd.value);
      expect(Math.abs(share - (expected[chapter.id] ?? NaN)), chapter.id).toBeLessThan(
        LIT_SHARE_TOLERANCE,
      );
    }
    expect(litShareAt(moonPhases.endJd.value)).toBeLessThan(LIT_SHARE_TOLERANCE);
  });

  it('grows to full and then shrinks', () => {
    const [newMoon, first, full, last] = moonPhases.chapters.map((c) => c.atJd.value);
    if (!newMoon || !first || !full || !last) throw new Error('four chapters expected');
    expect(litShareAt((newMoon + first) / 2)).toBeLessThan(litShareAt(first));
    expect(litShareAt((first + full) / 2)).toBeGreaterThan(litShareAt(first));
    expect(litShareAt((full + last) / 2)).toBeGreaterThan(litShareAt(last));
  });
});
