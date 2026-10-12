import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { isKnown } from '../data/types';
import { eclipticOffsetKm } from './layout';
import { tideHeights, tideStrength, type TideRaiser } from './tides';
import { scale, type Vec3 } from './vec3';

const moon: TideRaiser = { massKg: 1, offsetKm: { x: 10, y: 0, z: 0 } };

describe('tideStrength', () => {
  it('falls with the cube of the distance', () => {
    const twiceAsFar = { ...moon, offsetKm: { x: 20, y: 0, z: 0 } };
    expect(tideStrength(twiceAsFar)).toBeCloseTo(tideStrength(moon) / 8, 15);
  });

  it('grows with the mass', () => {
    expect(tideStrength({ ...moon, massKg: 3 })).toBeCloseTo(3 * tideStrength(moon), 15);
  });
});

describe('tideHeights', () => {
  it('is highest under the raiser and as high on the far side, and low half way between', () => {
    const height = tideHeights([moon]);
    expect(height({ x: 1, y: 0, z: 0 })).toBeCloseTo(1, 12);
    expect(height({ x: -1, y: 0, z: 0 })).toBeCloseTo(1, 12);
    expect(height({ x: 0, y: 1, z: 0 })).toBeCloseTo(-0.5, 12);
    expect(height({ x: 0, y: 0, z: -7 })).toBeCloseTo(-0.5, 12);
  });

  it('adds a second raiser in line, and takes it away at right angles', () => {
    const half = (offsetKm: Vec3): TideRaiser => ({ massKg: 0.5, offsetKm });
    const inLine = tideHeights([moon, half({ x: -10, y: 0, z: 0 })]);
    const square = tideHeights([moon, half({ x: 0, y: 10, z: 0 })]);
    const under = { x: 1, y: 0, z: 0 };
    expect(inLine(under)).toBeCloseTo(1.5, 12);
    expect(square(under)).toBeCloseTo(0.75, 12);
  });

  it('is flat with nothing to raise it', () => {
    expect(tideHeights([])({ x: 1, y: 0, z: 0 })).toBe(0);
  });
});

describe('the tides the catalogue’s Moon and Sun raise on Earth', () => {
  const find = (id: string) => {
    const object = catalogue.find((candidate) => candidate.id === id);
    if (!object || !('massKg' in object) || !isKnown(object.massKg)) {
      throw new Error(`${id} with a mass is expected`);
    }
    return { object, massKg: object.massKg.value };
  };
  const raisersAt = (jd: number): readonly [TideRaiser, TideRaiser] => {
    const moonOf = find('moon');
    const sunOf = find('sun');
    return [
      { massKg: moonOf.massKg, offsetKm: eclipticOffsetKm(moonOf.object, catalogue, jd) },
      // The Sun from Earth is Earth from the Sun, the other way.
      {
        massKg: sunOf.massKg,
        offsetKm: scale(eclipticOffsetKm(find('earth').object, catalogue, jd), -1),
      },
    ];
  };
  /** The US Naval Observatory's instants for October 2026, as in the Moon's phases story. */
  const FIRST_QUARTER = 2461332.175;
  const FULL_MOON = 2461339.675;
  /**
   * NOAA: "the sun’s tide-generating force is about half that of the moon". From its own round
   * numbers (27 million times the mass, 390 times as far) it is 0.46, for the Moon at its mean
   * distance. The Moon's distance changes through the month (NOAA: "by about 31,000 miles"),
   * and with the cube of it the Moon's tide by about a sixth either way, so the share runs
   * from about 0.4 with the Moon near to about 0.55 with the Moon far. "About half" is taken
   * as within a tenth of a half.
   */
  const ABOUT_HALF: readonly [number, number] = [0.4, 0.6];

  it('makes the Sun’s tide about half the Moon’s, as NOAA says', () => {
    for (const jd of [FIRST_QUARTER, FULL_MOON]) {
      const [byMoon, bySun] = raisersAt(jd);
      const share = tideStrength(bySun) / tideStrength(byMoon);
      expect(share).toBeGreaterThan(ABOUT_HALF[0]);
      expect(share).toBeLessThan(ABOUT_HALF[1]);
    }
  });

  it('makes the tide under the Moon higher at full Moon than at first quarter', () => {
    const under = (jd: number): number => {
      const raisers = raisersAt(jd);
      return tideHeights(raisers)(raisers[0].offsetKm);
    };
    // In line the Sun adds nearly all of its share; at right angles it takes half of it away.
    expect(under(FULL_MOON)).toBeGreaterThan(1.35);
    expect(under(FIRST_QUARTER)).toBeLessThan(0.85);
  });
});
