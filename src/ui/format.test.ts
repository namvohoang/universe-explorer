import { describe, expect, it } from 'vitest';
import { J2000_JD } from '../sim/constants';
import { julianDateAtStartOfYear } from '../sim/time';
import {
  fill,
  formatDate,
  formatDateAndHour,
  formatDateAndMinute,
  formatDateAndSecond,
  formatShortDate,
  formatShortDateAndHour,
  yearOf,
} from './format';

describe('formatDateAndHour', () => {
  it('adds the hour of the day in world time', () => {
    // J2000 is noon on 1 January 2000.
    expect(formatDateAndHour(J2000_JD)).toBe('1 January 2000, 12:00');
    expect(formatDateAndHour(J2000_JD + 2.4 / 24)).toBe('1 January 2000, 14:00');
    expect(formatDateAndHour(J2000_JD + 0.5)).toBe('2 January 2000, 00:00');
  });
});

describe('formatShortDate', () => {
  it('cuts the month short, for the narrowest phones', () => {
    expect(formatShortDate(J2000_JD)).toBe('1 Jan 2000');
    expect(formatShortDateAndHour(J2000_JD + 2.4 / 24)).toBe('1 Jan 2000, 14:00');
    // The widest month in full is September; short, it is as narrow as the rest.
    expect(formatShortDate(J2000_JD + 270)).toBe('27 Sept 2000');
    expect(formatDate(J2000_JD + 270)).toBe('27 September 2000');
  });
});

describe('formatDateAndMinute', () => {
  it('gives the time to the minute in world time, as a clock would show it', () => {
    expect(formatDateAndMinute(J2000_JD)).toBe('1 January 2000, 12:00');
    expect(formatDateAndMinute(J2000_JD + 17.9 / 1440)).toBe('1 January 2000, 12:17');
  });
});

describe('formatDateAndSecond', () => {
  it('gives the time to the second in world time', () => {
    expect(formatDateAndSecond(J2000_JD)).toBe('1 January 2000, 12:00:00');
    expect(formatDateAndSecond(J2000_JD + 90.4 / 86_400)).toBe('1 January 2000, 12:01:30');
  });
});

describe('formatDate', () => {
  it('writes a Julian date as a calendar day', () => {
    expect(formatDate(J2000_JD)).toBe('1 January 2000');
    expect(formatDate(J2000_JD + 31)).toBe('1 February 2000');
    expect(formatDate(julianDateAtStartOfYear(1800))).toBe('1 January 1800');
  });

  it('does not depend on the time of day', () => {
    expect(formatDate(J2000_JD - 0.5)).toBe('1 January 2000');
    expect(formatDate(J2000_JD + 0.49)).toBe('1 January 2000');
  });
});

describe('yearOf', () => {
  it('gives the calendar year', () => {
    expect(yearOf(J2000_JD)).toBe(2000);
    expect(yearOf(julianDateAtStartOfYear(2050))).toBe(2050);
    expect(yearOf(julianDateAtStartOfYear(2050) - 0.001)).toBe(2049);
  });
});

describe('fill', () => {
  it('replaces placeholders and leaves unknown ones alone', () => {
    expect(fill('From {from} to {to}.', { from: 1800, to: 2050 })).toBe('From 1800 to 2050.');
    expect(fill('Hello {name}', {})).toBe('Hello {name}');
  });
});
