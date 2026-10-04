import { describe, expect, it } from 'vitest';
import { J2000_JD } from '../sim/constants';
import { julianDateAtStartOfYear } from '../sim/time';
import { fill, formatDate, yearOf } from './format';

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
