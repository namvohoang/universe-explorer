import { describe, expect, it } from 'vitest';
import { noonToNoonDays, seasonsAt, starLatitudeDeg } from './seasons';

describe('starLatitudeDeg', () => {
  const pole = { x: 0, y: 0, z: 2 };

  it('is zero when the pole leans neither to the star nor away', () => {
    expect(starLatitudeDeg(pole, { x: 5, y: 0, z: 0 })).toBeCloseTo(0, 12);
  });

  it('is north when the north pole leans to the star, and south when it leans away', () => {
    expect(starLatitudeDeg(pole, { x: 1, y: 0, z: 1 })).toBeCloseTo(45, 9);
    expect(starLatitudeDeg(pole, { x: 1, y: 0, z: -1 })).toBeCloseTo(-45, 9);
    expect(starLatitudeDeg(pole, { x: 0, y: 0, z: 3 })).toBeCloseTo(90, 9);
  });
});

describe('seasonsAt', () => {
  it('goes spring, summer, autumn, winter in the north as the star goes north and comes back', () => {
    expect(seasonsAt(5, 6).north).toBe('spring');
    expect(seasonsAt(20, 19).north).toBe('summer');
    expect(seasonsAt(-5, -6).north).toBe('autumn');
    expect(seasonsAt(-20, -19).north).toBe('winter');
  });

  it('names the season that is beginning while the star crosses the equator', () => {
    expect(seasonsAt(-0.01, 0.01).north).toBe('spring');
    expect(seasonsAt(0.01, -0.01).north).toBe('autumn');
    expect(seasonsAt(-0.15, -0.1).north).toBe('spring');
    expect(seasonsAt(-0.5, -0.4).north).toBe('winter');
  });

  it('gives the south the season half a year away', () => {
    expect(seasonsAt(5, 6).south).toBe('autumn');
    expect(seasonsAt(20, 19).south).toBe('winter');
    expect(seasonsAt(-5, -6).south).toBe('spring');
    expect(seasonsAt(-20, -19).south).toBe('summer');
  });
});

describe('noonToNoonDays', () => {
  it('is one turn more than the turns in a year, shared out', () => {
    // A placeholder world for the maths: 10 turns against the stars in a year is 9 noons.
    expect(noonToNoonDays(1, 10)).toBeCloseTo(10 / 9, 12);
  });

  it('refuses a world that turns no faster than it goes round', () => {
    expect(() => noonToNoonDays(10, 10)).toThrow(RangeError);
  });
});
