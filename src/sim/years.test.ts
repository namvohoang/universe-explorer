import { describe, expect, it } from 'vitest';
import { yearsAgoAt, yearsInWords, yearsPerSecond } from './years';

describe('yearsAgoAt', () => {
  it('runs from the start of the part to its end, nearer today as it goes', () => {
    const span = [50e6, 40e6] as const;
    expect(yearsAgoAt(span, 10, 11, 10)).toBe(50e6);
    expect(yearsAgoAt(span, 10, 11, 10.5)).toBeCloseTo(45e6, 6);
    expect(yearsAgoAt(span, 10, 11, 11)).toBe(40e6);
  });

  it('stays at the ends outside the part', () => {
    const span = [50e6, 40e6] as const;
    expect(yearsAgoAt(span, 10, 11, 9)).toBe(50e6);
    expect(yearsAgoAt(span, 10, 11, 12)).toBe(40e6);
  });
});

describe('yearsPerSecond', () => {
  it('shares the years of a part over the seconds it plays', () => {
    expect(yearsPerSecond([50e6, 40e6], 14)).toBeCloseTo(10e6 / 14, 6);
  });

  it('needs a part that takes some time', () => {
    expect(() => yearsPerSecond([1, 0], 0)).toThrow(RangeError);
  });
});

describe('yearsInWords', () => {
  it('says millions, thousands and plain years, to two figures', () => {
    expect(yearsInWords(45_300_000)).toEqual({ unit: 'million', amount: 45 });
    expect(yearsInWords(714_285)).toEqual({ unit: 'thousand', amount: 710 });
    expect(yearsInWords(5_240_000)).toEqual({ unit: 'million', amount: 5.2 });
    expect(yearsInWords(4_600_000_000)).toEqual({ unit: 'billion', amount: 4.6 });
    expect(yearsInWords(350)).toEqual({ unit: 'years', amount: 350 });
    expect(yearsInWords(0)).toEqual({ unit: 'years', amount: 0 });
  });
});
