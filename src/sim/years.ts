/**
 * The clock of a story told over years or millions of years: each part plays a stretch of the
 * past, from `fromYearsAgo` to `untilYearsAgo`, over the instants it plays on the story's own
 * clock. Time goes forward, so a part ends nearer today than it starts.
 */

/** How many years ago it is at `jd`, as a part playing from `atJd` to `untilJd` goes by. */
export function yearsAgoAt(
  span: readonly [fromYearsAgo: number, untilYearsAgo: number],
  atJd: number,
  untilJd: number,
  jd: number,
): number {
  const [from, until] = span;
  if (!(untilJd > atJd)) return until;
  const share = Math.min(1, Math.max(0, (jd - atJd) / (untilJd - atJd)));
  return from + (until - from) * share;
}

/** How many years one second of the story stands for, when a part takes `seconds` to play. */
export function yearsPerSecond(
  span: readonly [fromYearsAgo: number, untilYearsAgo: number],
  seconds: number,
): number {
  if (!(seconds > 0)) throw new RangeError('A part must take some time to play');
  return Math.abs(span[0] - span[1]) / seconds;
}

/** Thousands, millions or billions, and how many of them, rounded to two figures. */
export interface YearsInWords {
  readonly unit: 'years' | 'thousand' | 'million' | 'billion';
  readonly amount: number;
}

/** A number of years said the way people say it: "45 million", "12 thousand", "350". */
export function yearsInWords(years: number): YearsInWords {
  const rounded = (value: number): number => (value === 0 ? 0 : Number(value.toPrecision(2)));
  const size = Math.abs(years);
  if (size >= 1e9) return { unit: 'billion', amount: rounded(years / 1e9) };
  if (size >= 1e6) return { unit: 'million', amount: rounded(years / 1e6) };
  if (size >= 1e4) return { unit: 'thousand', amount: rounded(years / 1e3) };
  return { unit: 'years', amount: rounded(years) };
}
