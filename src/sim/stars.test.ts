import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { clusterLayout, colorFromTemperature, starPositionPc, temperatureFromBpRp } from './stars';

describe('starPositionPc', () => {
  it('puts a star with a parallax of 10 mas 100 parsecs away', () => {
    const p = starPositionPc(0, 0, 10);
    expect(p.x).toBeCloseTo(100, 9);
    expect(p.y).toBeCloseTo(0, 9);
    expect(p.z).toBeCloseTo(0, 9);
  });

  it('points north for a declination of 90', () => {
    expect(starPositionPc(123, 90, 4).z).toBeCloseTo(250, 9);
  });

  it('refuses a star with no usable parallax', () => {
    expect(() => starPositionPc(0, 0, 0)).toThrow(RangeError);
  });
});

describe('colorFromTemperature', () => {
  it('is red for a cool star, near white for the Sun and blue-white for a hot one', () => {
    const cool = colorFromTemperature(2600);
    expect(cool.r).toBeGreaterThan(cool.b + 0.4);
    const sun = colorFromTemperature(5772);
    expect(sun.r).toBeGreaterThan(0.95);
    expect(sun.b).toBeGreaterThan(0.85);
    const hot = colorFromTemperature(20_000);
    expect(hot.b).toBeGreaterThan(hot.r);
  });
});

describe('temperatureFromBpRp', () => {
  it('makes bluer stars hotter', () => {
    expect(temperatureFromBpRp(-0.1)).toBeGreaterThan(temperatureFromBpRp(0.8));
    expect(temperatureFromBpRp(0.8)).toBeGreaterThan(temperatureFromBpRp(2));
    expect(temperatureFromBpRp(0.82)).toBeGreaterThan(5000);
    expect(temperatureFromBpRp(0.82)).toBeLessThan(6500);
  });
});

describe('the Pleiades', () => {
  const pleiades = catalogue.find((o) => o.id === 'pleiades');
  if (pleiades?.kind !== 'star-cluster' || !pleiades.stars) throw new Error('no Pleiades stars');
  const stars = pleiades.stars.value;

  it('has over a hundred measured stars', () => {
    expect(stars.length).toBeGreaterThan(100);
  });

  it('sits about as far away as its card says', () => {
    const [ra, dec, parallax] = stars[0] ?? [0, 0, 1];
    const p = starPositionPc(ra, dec, parallax);
    const lightYears = Math.hypot(p.x, p.y, p.z) * 3.2616;
    const card = pleiades.sky.distanceLy.value ?? NaN;
    expect(Math.abs(lightYears - card) / card).toBeLessThan(0.1);
  });

  it('is a few parsecs across, centred on its own middle', () => {
    const { offsets, radiusPc } = clusterLayout(stars);
    expect(offsets).toHaveLength(stars.length);
    expect(radiusPc).toBeGreaterThan(2);
    expect(radiusPc).toBeLessThan(15);
    const sum = offsets.reduce((s, o) => s + o.x + o.y + o.z, 0);
    expect(sum / offsets.length).toBeCloseTo(0, 6);
  });
});
