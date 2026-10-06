import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { DAYS_PER_JULIAN_YEAR, J2000_JD } from './constants';
import {
  advanceClock,
  centuriesSinceJ2000,
  clampJd,
  createClock,
  dateLimits,
  DAYS_PER_SECOND,
  DEFAULT_SPEED,
  julianDateAtStartOfYear,
  julianDateFromUnixMs,
  secondsPerYear,
  showsHours,
  SPEEDS,
  unixMsFromJulianDate,
  withDate,
  withSpeed,
} from './time';

const J2000_MS = Date.UTC(2000, 0, 1, 12);
const LIMITS = { minJd: 100, maxJd: 200 };

describe('Julian dates', () => {
  it('puts J2000.0 at noon on 1 January 2000', () => {
    expect(julianDateFromUnixMs(J2000_MS)).toBe(J2000_JD);
    expect(unixMsFromJulianDate(J2000_JD)).toBe(J2000_MS);
  });

  it('counts whole days', () => {
    expect(julianDateFromUnixMs(Date.UTC(2000, 0, 2, 12))).toBe(J2000_JD + 1);
    expect(julianDateFromUnixMs(Date.UTC(2000, 0, 1, 0))).toBe(J2000_JD - 0.5);
    // 2000 was a leap year, so noon on 1 January 2001 is 366 days on.
    expect(julianDateFromUnixMs(Date.UTC(2001, 0, 1, 12))).toBe(J2000_JD + 366);
  });

  it('round-trips any instant', () => {
    for (const ms of [0, -1e12, 1.7e12, Date.UTC(1850, 5, 15, 3, 4, 5)]) {
      // A Julian date held as a double resolves to tens of microseconds, not better.
      expect(Math.abs(unixMsFromJulianDate(julianDateFromUnixMs(ms)) - ms)).toBeLessThan(0.1);
    }
  });

  it('finds the start of a year, including years before 100', () => {
    expect(julianDateAtStartOfYear(2000)).toBe(J2000_JD - 0.5);
    expect(julianDateAtStartOfYear(2001) - julianDateAtStartOfYear(2000)).toBe(366);
    expect(julianDateAtStartOfYear(51) - julianDateAtStartOfYear(50)).toBe(365);
  });

  it('counts centuries from J2000.0', () => {
    expect(centuriesSinceJ2000(J2000_JD)).toBe(0);
    expect(centuriesSinceJ2000(J2000_JD + 36_525)).toBe(1);
    expect(centuriesSinceJ2000(J2000_JD - 73_050)).toBe(-2);
  });
});

describe('dateLimits', () => {
  it('is the span the planet elements are valid for', () => {
    const limits = dateLimits(catalogue);
    const years = catalogue.flatMap((o) =>
      o.orbit?.validity ? [[o.orbit.validity.fromYear.value, o.orbit.validity.toYear.value]] : [],
    );
    const from = Math.max(...years.map(([a]) => a ?? NaN));
    const to = Math.min(...years.map(([, b]) => b ?? NaN));
    expect(limits).toEqual({
      minJd: julianDateAtStartOfYear(from),
      maxJd: julianDateAtStartOfYear(to),
    });
  });

  it('is null when nothing states a limit', () => {
    expect(dateLimits(catalogue.filter((o) => !o.orbit?.validity))).toBeNull();
  });

  it('clamps a date into the limits', () => {
    expect(clampJd(50, LIMITS)).toBe(100);
    expect(clampJd(150, LIMITS)).toBe(150);
    expect(clampJd(250, LIMITS)).toBe(200);
    expect(clampJd(250, null)).toBe(250);
  });
});

describe('speeds', () => {
  it('runs one Earth year in 20 seconds at normal speed, as the prototype did', () => {
    expect(secondsPerYear('normal')).toBeCloseTo(20, 10);
    expect(secondsPerYear('slow')).toBeCloseTo(60, 10);
    expect(secondsPerYear('fast')).toBeCloseTo(5, 10);
    expect(secondsPerYear('pause')).toBeNull();
    expect(DAYS_PER_SECOND.normal * 20).toBeCloseTo(DAYS_PER_JULIAN_YEAR, 10);
  });
});

describe('the hourly speed', () => {
  it('lets one Earth hour pass each second', () => {
    expect(DAYS_PER_SECOND.hourly * 24).toBeCloseTo(1, 12);
    // 240 seconds is 240 hours, which is ten days.
    const clock = advanceClock(createClock(150, LIMITS, 'hourly'), 240, LIMITS);
    expect(clock.jd).toBeCloseTo(160, 9);
  });

  it('is the only speed slow enough to show the hour', () => {
    expect(SPEEDS.filter(showsHours)).toEqual(['hourly']);
  });
});

describe('clock', () => {
  it('advances by the elapsed real time at the chosen speed', () => {
    const clock = advanceClock(createClock(150, LIMITS, 'normal'), 2, LIMITS);
    expect(clock.jd).toBeCloseTo(150 + 2 * DAYS_PER_SECOND.normal, 10);
    expect(clock.atLimit).toBe(false);
  });

  it('starts at the very slow speed unless told otherwise', () => {
    expect(DEFAULT_SPEED).toBe('hourly');
    expect(createClock(150, LIMITS).speed).toBe('hourly');
  });

  it('does not move when paused', () => {
    const paused = withSpeed(createClock(150, LIMITS), 'pause');
    expect(advanceClock(paused, 1000, LIMITS).jd).toBe(150);
  });

  it('stops at the limit and says so', () => {
    const clock = advanceClock(createClock(199, LIMITS, 'fast'), 60, LIMITS);
    expect(clock.jd).toBe(200);
    expect(clock.atLimit).toBe(true);
    expect(advanceClock(clock, 1, LIMITS).jd).toBe(200);
  });

  it('runs freely with no limits', () => {
    expect(advanceClock(createClock(199, null, 'fast'), 60, null).atLimit).toBe(false);
  });

  it('jumps to a date and keeps its speed', () => {
    const clock = withDate(createClock(150, LIMITS, 'slow'), 120, LIMITS);
    expect(clock).toEqual({ jd: 120, speed: 'slow', atLimit: false });
    expect(withDate(clock, 999, LIMITS)).toEqual({ jd: 200, speed: 'slow', atLimit: true });
  });
});
