import type { CelestialObject } from '../data/types';
import {
  DAYS_PER_JULIAN_CENTURY,
  DAYS_PER_JULIAN_YEAR,
  J2000_JD,
  SECONDS_PER_DAY,
} from './constants';

const MS_PER_DAY = SECONDS_PER_DAY * 1000;

/** J2000.0 on the civil calendar: 12:00 on 1 January 2000. */
const J2000_UNIX_MS = Date.UTC(2000, 0, 1, 12);

/**
 * Julian date for a civil (UTC) instant given as Unix milliseconds.
 *
 * The orbit sources count in a uniform time scale (TDB) that runs about a minute ahead of
 * UTC. That difference is ignored: in a minute no body moves far enough to see at any scale
 * the app shows, and it is well inside the accuracy of the elements themselves.
 */
export function julianDateFromUnixMs(unixMs: number): number {
  return J2000_JD + (unixMs - J2000_UNIX_MS) / MS_PER_DAY;
}

export function unixMsFromJulianDate(jd: number): number {
  return J2000_UNIX_MS + (jd - J2000_JD) * MS_PER_DAY;
}

/** Julian date at the very start of 1 January of a year. */
export function julianDateAtStartOfYear(year: number): number {
  // setUTCFullYear, unlike Date.UTC, does not treat years 0–99 as 1900–1999.
  const date = new Date(Date.UTC(2000, 0, 1));
  date.setUTCFullYear(year);
  return julianDateFromUnixMs(date.getTime());
}

/** Julian centuries since J2000.0, the T in JPL's formulae. */
export function centuriesSinceJ2000(jd: number): number {
  return (jd - J2000_JD) / DAYS_PER_JULIAN_CENTURY;
}

/** The span of dates the simulation may show. */
export interface DateLimits {
  readonly minJd: number;
  readonly maxJd: number;
}

/**
 * The dates for which every orbit in the catalogue is valid: the overlap of the spans their
 * sources state. `null` when no orbit states a limit.
 */
export function dateLimits(catalogue: readonly CelestialObject[]): DateLimits | null {
  let limits: DateLimits | null = null;
  for (const { orbit } of catalogue) {
    if (!orbit?.validity) continue;
    const minJd = julianDateAtStartOfYear(orbit.validity.fromYear.value);
    const maxJd = julianDateAtStartOfYear(orbit.validity.toYear.value);
    limits = limits
      ? { minJd: Math.max(limits.minJd, minJd), maxJd: Math.min(limits.maxJd, maxJd) }
      : { minJd, maxJd };
  }
  if (limits && limits.minJd > limits.maxJd) {
    throw new RangeError('The orbits in the catalogue have no dates in common');
  }
  return limits;
}

export function clampJd(jd: number, limits: DateLimits | null): number {
  if (!limits) return jd;
  return Math.min(limits.maxJd, Math.max(limits.minJd, jd));
}

/** How fast simulated time runs. `normal` is the prototype's "1 Earth year = 20 seconds". */
export const SPEEDS = ['pause', 'slow', 'normal', 'fast'] as const;
export type Speed = (typeof SPEEDS)[number];

const NORMAL_SECONDS_PER_YEAR = 20;
const NORMAL_DAYS_PER_SECOND = DAYS_PER_JULIAN_YEAR / NORMAL_SECONDS_PER_YEAR;

/** Simulated days that pass per real second. One scale drives every body, so ratios stay true. */
export const DAYS_PER_SECOND: Readonly<Record<Speed, number>> = {
  pause: 0,
  slow: NORMAL_DAYS_PER_SECOND / 3,
  normal: NORMAL_DAYS_PER_SECOND,
  fast: NORMAL_DAYS_PER_SECOND * 4,
};

/** Real seconds one Earth year takes at a speed; `null` when paused. */
export function secondsPerYear(speed: Speed): number | null {
  const rate = DAYS_PER_SECOND[speed];
  return rate === 0 ? null : DAYS_PER_JULIAN_YEAR / rate;
}

/** The simulation's date and how fast it is moving. */
export interface Clock {
  readonly jd: number;
  readonly speed: Speed;
  /** True when the date has reached the edge of `DateLimits` and cannot go further. */
  readonly atLimit: boolean;
}

export function createClock(jd: number, limits: DateLimits | null, speed: Speed = 'normal'): Clock {
  const clamped = clampJd(jd, limits);
  return { jd: clamped, speed, atLimit: clamped !== jd };
}

/** The clock after `realSeconds` of wall time. The caller supplies the elapsed time. */
export function advanceClock(clock: Clock, realSeconds: number, limits: DateLimits | null): Clock {
  const wanted = clock.jd + realSeconds * DAYS_PER_SECOND[clock.speed];
  const jd = clampJd(wanted, limits);
  return { jd, speed: clock.speed, atLimit: jd !== wanted };
}

export function withSpeed(clock: Clock, speed: Speed): Clock {
  return { ...clock, speed };
}

/** Jumps to a date, e.g. "today". */
export function withDate(clock: Clock, jd: number, limits: DateLimits | null): Clock {
  return createClock(jd, limits, clock.speed);
}
