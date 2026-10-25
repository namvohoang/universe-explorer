import { describe, expect, it } from 'vitest';
import { floodPlainM, floodStageM, type FloodStage } from './floodStage';

const STAGE: FloodStage = {
  peakM: 11.94,
  peakJd: 100,
  rainFromJd: 97,
  lowM: 4,
  fallDays: 6,
};
const BANK_M = 10;
const GROUND_M = 9;

describe('floodStageM', () => {
  it('reaches the real highest mark at the real time, and never goes over it', () => {
    expect(floodStageM(STAGE, STAGE.peakJd)).toBeCloseTo(STAGE.peakM, 12);
    for (let jd = 90; jd < 120; jd += 0.25) {
      expect(floodStageM(STAGE, jd)).toBeLessThanOrEqual(STAGE.peakM + 1e-12);
    }
  });

  it('is low before the rain and low again once the flood has gone', () => {
    expect(floodStageM(STAGE, 95)).toBe(STAGE.lowM);
    expect(floodStageM(STAGE, STAGE.peakJd + STAGE.fallDays + 1)).toBe(STAGE.lowM);
  });

  it('rises while it rains and falls after', () => {
    expect(floodStageM(STAGE, 98.5)).toBeGreaterThan(floodStageM(STAGE, 97.5));
    expect(floodStageM(STAGE, 103)).toBeLessThan(floodStageM(STAGE, 101));
  });
});

describe('floodPlainM', () => {
  it('stays dry until the river is over the top of its banks', () => {
    expect(floodPlainM(STAGE, BANK_M, GROUND_M, 97.5)).toBe(GROUND_M);
    expect(floodPlainM(STAGE, BANK_M, GROUND_M, STAGE.peakJd)).toBeCloseTo(STAGE.peakM, 12);
  });

  it('drains more slowly than the river falls', () => {
    const later = STAGE.peakJd + STAGE.fallDays;
    expect(floodPlainM(STAGE, BANK_M, GROUND_M, later)).toBeGreaterThan(GROUND_M);
    expect(floodPlainM(STAGE, BANK_M, GROUND_M, STAGE.peakJd + 2 * STAGE.fallDays)).toBeCloseTo(
      GROUND_M,
      12,
    );
  });
});
