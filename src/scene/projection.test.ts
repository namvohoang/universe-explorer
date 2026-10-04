import { describe, expect, it } from 'vitest';
import { pixelsFor } from './projection';

describe('pixelsFor', () => {
  it('fills the view when the size spans the field of view', () => {
    // With a 90° field of view, something 2 units tall at distance 1 spans the whole height.
    expect(pixelsFor(2, 1, 90, 800)).toBeCloseTo(800, 9);
  });

  it('shrinks in proportion to distance and grows with size', () => {
    expect(pixelsFor(1, 10, 50, 800)).toBeCloseTo(pixelsFor(1, 5, 50, 800) / 2, 9);
    expect(pixelsFor(3, 10, 50, 800)).toBeCloseTo(3 * pixelsFor(1, 10, 50, 800), 9);
  });

  it('is unbounded at the camera itself', () => {
    expect(pixelsFor(1, 0, 50, 800)).toBe(Infinity);
  });
});
