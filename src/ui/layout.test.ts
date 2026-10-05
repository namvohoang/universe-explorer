import { describe, expect, it } from 'vitest';
import { insetsFor } from './layout';

describe('insetsFor', () => {
  it('measures the top bar from the top and the tray from the bottom', () => {
    expect(insetsFor(96.4, 650, 800)).toEqual({ top: 96, bottom: 150 });
  });

  it('never goes below zero when a bar is off screen', () => {
    expect(insetsFor(-10, 900, 800)).toEqual({ top: 0, bottom: 0 });
  });
});
