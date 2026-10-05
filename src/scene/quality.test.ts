import { describe, expect, it } from 'vitest';
import { FRAMES_WATCHED, SLOW_FRAME_MS, createFrameWatch, lowerPixelRatio } from './quality';

describe('frame watch', () => {
  it('says nothing while frames are quick', () => {
    const watch = createFrameWatch();
    for (let frame = 0; frame < FRAMES_WATCHED * 3; frame += 1) {
      expect(watch.add(SLOW_FRAME_MS - 9)).toBe(false);
    }
  });

  it('reports a whole batch of slow frames, once per batch', () => {
    const watch = createFrameWatch();
    const reports = [];
    for (let frame = 0; frame < FRAMES_WATCHED * 2; frame += 1) {
      reports.push(watch.add(SLOW_FRAME_MS + 10));
    }
    expect(reports.filter(Boolean)).toHaveLength(2);
    expect(reports[FRAMES_WATCHED - 1]).toBe(true);
  });

  it('forgives a single stutter among quick frames', () => {
    const watch = createFrameWatch();
    const reports = [];
    for (let frame = 0; frame < FRAMES_WATCHED; frame += 1) {
      reports.push(watch.add(frame === 3 ? 400 : 10));
    }
    expect(reports.some(Boolean)).toBe(false);
  });
});

describe('lowerPixelRatio', () => {
  it('steps down and stops at one', () => {
    expect(lowerPixelRatio(2)).toBe(1.5);
    expect(lowerPixelRatio(1.5)).toBe(1);
    expect(lowerPixelRatio(1)).toBe(1);
    expect(lowerPixelRatio(1.25)).toBe(1);
  });
});
