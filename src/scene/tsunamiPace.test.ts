import { describe, expect, it } from 'vitest';
import { tsunamiPace } from './tsunamiPace';

describe('tsunamiPace', () => {
  it('begins over the trench, low, with the sea floor lifted', () => {
    expect(tsunamiPace(0)).toEqual({ progress: 0, shoaling: 0.08, uplift: 1, drawdown: 0 });
    expect(tsunamiPace(-5).progress).toBe(0);
  });

  it('only ever goes on and grows, never back, from start to end', () => {
    let before = tsunamiPace(0);
    for (let minutes = 1; minutes <= 1000; minutes++) {
      const now = tsunamiPace(minutes);
      expect(now.progress).toBeGreaterThanOrEqual(before.progress);
      expect(now.shoaling).toBeGreaterThanOrEqual(before.shoaling);
      before = now;
    }
  });

  it('moves on without a jump from one minute to the next', () => {
    for (let minutes = 0; minutes < 1000; minutes += 0.5) {
      const a = tsunamiPace(minutes);
      const b = tsunamiPace(minutes + 0.5);
      expect(b.progress - a.progress).toBeLessThan(0.01);
      expect(b.shoaling - a.shoaling).toBeLessThan(0.01);
    }
  });

  it('has the sea floor settled after twenty minutes', () => {
    expect(tsunamiPace(10).uplift).toBeCloseTo(0.5, 10);
    expect(tsunamiPace(20).uplift).toBe(0);
  });

  it('breaks at the shore by twelve hours and stays there', () => {
    expect(tsunamiPace(720)).toEqual({ progress: 1, shoaling: 1, uplift: 0, drawdown: 0 });
    expect(tsunamiPace(975)).toEqual({ progress: 1, shoaling: 1, uplift: 0, drawdown: 0 });
  });

  it('drains the shore slowly before the wave, then fills it again as the wave comes', () => {
    expect(tsunamiPace(30).drawdown).toBe(0);
    let before = 0;
    for (let minutes = 60; minutes <= 200; minutes++) {
      const now = tsunamiPace(minutes).drawdown;
      expect(now).toBeGreaterThanOrEqual(before);
      expect(now - before).toBeLessThan(0.02);
      before = now;
    }
    expect(tsunamiPace(250).drawdown).toBe(1);
    expect(tsunamiPace(360).drawdown).toBe(0);
  });
});
