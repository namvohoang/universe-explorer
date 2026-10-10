import { describe, expect, it } from 'vitest';
import { placeAlong, rangeAtKm } from './drawnPlace';

/** Agreement to a millionth of a degree or of a km: only rounding differs. */
const CLOSE = 6;
const RADIUS_KM = 6378.137;
/** Nautical miles to km, by definition. */
const NMI = 1.852;

describe('rangeAtKm', () => {
  const table = [
    [0, 0],
    [100, 10],
    [300, 110],
  ] as const;

  it('reads the table at its rows and straight-line between them', () => {
    expect(rangeAtKm(table, 100)).toBeCloseTo(10 * NMI, CLOSE);
    expect(rangeAtKm(table, 50)).toBeCloseTo(5 * NMI, CLOSE);
    expect(rangeAtKm(table, 200)).toBeCloseTo(60 * NMI, CLOSE);
  });

  it('holds still before the first row and after the last', () => {
    expect(rangeAtKm(table, -5)).toBe(0);
    expect(rangeAtKm(table, 400)).toBeCloseTo(110 * NMI, CLOSE);
  });
});

describe('placeAlong', () => {
  it('stays put for no distance', () => {
    const [lat, lon] = placeAlong([28.4658, -80.6209], 90, 0, RADIUS_KM);
    expect(lat).toBeCloseTo(28.4658, CLOSE);
    expect(lon).toBeCloseTo(-80.6209, CLOSE);
  });

  it('goes a quarter of the way round the equator heading east', () => {
    const [lat, lon] = placeAlong([0, 0], 90, (Math.PI / 2) * RADIUS_KM, RADIUS_KM);
    expect(lat).toBeCloseTo(0, CLOSE);
    expect(lon).toBeCloseTo(90, CLOSE);
  });

  it('heading north gains latitude only', () => {
    const [lat, lon] = placeAlong([10, 20], 0, (Math.PI / 18) * RADIUS_KM, RADIUS_KM);
    expect(lat).toBeCloseTo(20, CLOSE);
    expect(lon).toBeCloseTo(20, CLOSE);
  });

  it('heading east from the north drifts towards the equator, as a great circle does', () => {
    const [lat, lon] = placeAlong([28.4658, -80.6209], 90, 1000, RADIUS_KM);
    expect(lat).toBeLessThan(28.4658);
    expect(lon).toBeGreaterThan(-80.6209);
  });
});
