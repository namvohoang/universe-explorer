import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import type { FigureStar } from '../data/types';
import { LIGHT_YEARS_PER_PARSEC } from './constants';
import {
  clusterLayout,
  colorFromTemperature,
  figureDepth,
  figureLayout,
  middleDirection,
  starColourName,
  starPositionPc,
  temperatureFromBpRp,
} from './stars';
import { dot, normalize, scale, subtract } from './vec3';

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

describe('a star pattern', () => {
  // Made-up stars for the maths only: two in the same direction, one near and one far.
  const stars: readonly FigureStar[] = [
    ['Near', 10, 20, 100, 1, 0],
    ['Far', 10, 20, 10, 2, 1],
  ];

  it('is centred on the middle of its stars, with the Sun on the same line', () => {
    const { offsets, sun, radiusPc, distancesPc } = figureLayout(stars);
    expect(distancesPc[0]).toBeCloseTo(10, 9);
    expect(distancesPc[1]).toBeCloseTo(100, 9);
    expect(radiusPc).toBeCloseTo(45, 9);
    expect(Math.hypot(sun.x, sun.y, sun.z)).toBeCloseTo(55, 9);
    const [near, far] = offsets;
    if (!near || !far) throw new Error('two stars were laid out');
    expect(near.x + far.x).toBeCloseTo(0, 9);
    // The Sun, the near star and the far star are in a row.
    const towardsSun = { x: sun.x / 55, y: sun.y / 55, z: sun.z / 55 };
    expect(near.x / 45).toBeCloseTo(towardsSun.x, 9);
    expect(far.z / 45).toBeCloseTo(-towardsSun.z, 9);
  });

  it('has its middle in the middle of the pattern on the sky, however far one star is', () => {
    // Three stars 20 degrees apart along the equator; the last is a hundred times farther.
    const wide: readonly FigureStar[] = [
      ['West', 40, 0, 100, 1, 0],
      ['Mid', 30, 0, 100, 1, 0],
      ['East', 20, 0, 1, 1, 0],
    ];
    const { sun, offsets } = figureLayout(wide);
    const toMiddle = normalize(scale(sun, -1));
    const expected = starPositionPc(30, 0, 1000);
    expect(toMiddle.x).toBeCloseTo(expected.x, 2);
    expect(toMiddle.y).toBeCloseTo(expected.y, 2);
    // From the Sun, the two end stars are the same angle from the middle.
    const angles = offsets.map((o) => Math.acos(dot(normalize(subtract(o, sun)), toMiddle)));
    expect(angles[0]).toBeCloseTo(angles[2] ?? NaN, 2);
  });

  it('finds the middle of directions that lie on a circle round it', () => {
    const ring = [0, 90, 180, 270].map((ra) => normalize(starPositionPc(ra, 60, 1)));
    const middle = middleDirection(ring);
    // The steps shrink slowly, so the answer is good to a fraction of a degree: enough to aim a view.
    expect(middle.z).toBeCloseTo(1, 4);
    expect(() => middleDirection([])).toThrow(RangeError);
  });

  it('names its nearest and farthest stars in light-years', () => {
    const depth = figureDepth(stars);
    expect(depth?.nearest.name).toBe('Near');
    expect(depth?.farthest.name).toBe('Far');
    expect(depth?.farthest.lightYears).toBeCloseTo(100 * LIGHT_YEARS_PER_PARSEC, 6);
    expect(figureDepth([])).toBeNull();
  });

  it('counts about 3.26 light-years to a parsec', () => {
    expect(LIGHT_YEARS_PER_PARSEC).toBeGreaterThan(3.26);
    expect(LIGHT_YEARS_PER_PARSEC).toBeLessThan(3.27);
  });
});

describe('starColourName', () => {
  it('names a star by how hot it is, from red for the coolest to blue-white for the hottest', () => {
    expect(starColourName(2900)).toBe('red');
    expect(starColourName(4893)).toBe('orange');
    // The Sun, which NASA calls yellow.
    expect(starColourName(5772)).toBe('yellow');
    expect(starColourName(7000)).toBe('white');
    expect(starColourName(10273)).toBe('blue-white');
  });

  it('gives hotter stars a name no earlier in the list', () => {
    const order = ['red', 'orange', 'yellow', 'white', 'blue-white'];
    let last = 0;
    for (let kelvin = 2000; kelvin <= 30000; kelvin += 250) {
      const at = order.indexOf(starColourName(kelvin));
      expect(at).toBeGreaterThanOrEqual(last);
      last = at;
    }
  });
});
