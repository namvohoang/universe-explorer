import { describe, expect, it } from 'vitest';
import { pictureSpanKm, scaleBarKm } from './pictureSpan';

const RADIUS_KM = 6371;

describe('pictureSpanKm', () => {
  it('spans as much ground each way at the equator', () => {
    const span = pictureSpanKm([10, -1, 12, 1], RADIUS_KM);
    expect(span.widthKm / span.heightKm).toBeCloseTo(1, 3);
    expect(span.heightKm).toBeCloseTo((2 * RADIUS_KM * Math.PI) / 180, 9);
  });

  it('narrows a degree of longitude by the cosine of the latitude', () => {
    const span = pictureSpanKm([0, 59, 2, 61], RADIUS_KM);
    expect(span.widthKm / span.heightKm).toBeCloseTo(Math.cos((60 * Math.PI) / 180), 3);
  });
});

describe('scaleBarKm', () => {
  it('picks the longest round length that fits', () => {
    expect(scaleBarKm(4.3)).toBe(2);
    expect(scaleBarKm(5)).toBe(5);
    expect(scaleBarKm(9.99)).toBe(5);
    expect(scaleBarKm(10)).toBe(10);
    expect(scaleBarKm(0.37)).toBeCloseTo(0.2, 12);
  });

  it('needs some room', () => {
    expect(() => scaleBarKm(0)).toThrow(RangeError);
  });
});
