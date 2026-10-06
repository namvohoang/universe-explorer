import { describe, expect, it } from 'vitest';
import { catalogue } from '../../src/data/catalogue';
import type { Moon, Planet, Source, Sourced, SpheroidShape, Star } from '../../src/data/types';
import { checkCatalogue } from './catalogue';

// Placeholder values for testing the checks, not astronomy.
const SOURCE: Source = {
  id: 'test',
  title: 'Test page',
  url: 'https://example.nasa.gov/page',
  retrieved: '2026-10-04',
};
const v = <T>(value: T, sourceId = 'test'): Sourced<T> => ({ value, sourceId });

const shape = (radiusKm: number, polarKm = radiusKm): SpheroidShape => ({
  type: 'spheroid',
  equatorialRadiusKm: v(radiusKm),
  polarRadiusKm: v(polarKm),
  orientation: {
    axialTiltDeg: v(1),
    poleRaDeg: { value: null, reason: 'not measured' },
    poleDecDeg: { value: null, reason: 'not measured' },
    rotationPeriodHours: v(10),
    rotation: 'prograde',
  },
});

const star: Star = {
  id: 'star',
  kind: 'star',
  name: 'Star',
  parentId: null,
  orbit: null,
  shape: shape(100),
  massKg: v(1),
  effectiveTemperatureK: v(1),
  spectralType: v('X'),
  sky: null,
  media: [],
  sources: [SOURCE],
};

const planet: Planet = {
  id: 'planet',
  kind: 'planet',
  name: 'Planet',
  parentId: 'star',
  shape: shape(10, 9),
  massKg: v(1),
  orbit: {
    frame: { type: 'ecliptic-j2000' },
    epochJd: v(0),
    semiMajorAxisAu: v(1),
    eccentricity: v(0.1),
    inclinationDeg: v(0),
    longitudeOfAscendingNodeDeg: v(0),
    phase: { form: 'anomalies', argumentOfPeriapsisDeg: v(0), meanAnomalyDeg: v(0) },
    motion: { type: 'precessing-ellipse', siderealPeriodDays: v(100) },
    validity: { fromYear: v(1800), toYear: v(2050) },
  },
  media: [],
  sources: [SOURCE],
};

const withOrbit = (changes: Partial<NonNullable<Planet['orbit']>>): Planet => {
  if (!planet.orbit) throw new Error('fixture has an orbit');
  return { ...planet, orbit: { ...planet.orbit, ...changes } };
};

describe('checkCatalogue', () => {
  it('passes a sound catalogue', () => {
    expect(checkCatalogue([star, planet])).toEqual([]);
  });

  it.each<[string, Planet]>([
    ['a value citing a source the record does not list', { ...planet, massKg: v(1, 'other') }],
    ['a record with no sources', { ...planet, sources: [] }],
    [
      'a source with a malformed date',
      { ...planet, sources: [{ ...SOURCE, retrieved: '2026-13-01' }] },
    ],
    ['an unknown value with an empty reason', { ...planet, massKg: { value: null, reason: ' ' } }],
    ['a non-finite number', { ...planet, massKg: v(Number.NaN) }],
    ['a missing parent', { ...planet, parentId: 'nowhere' }],
    ['a badly formed id', { ...planet, id: 'Planet One' }],
    ['a polar radius above the equatorial one', { ...planet, shape: shape(9, 10) }],
    ['a body as big as its parent', { ...planet, shape: shape(100) }],
    ['an unbound eccentricity', withOrbit({ eccentricity: v(1) })],
    ['a negative eccentricity', withOrbit({ eccentricity: v(-0.1) })],
    [
      'validity that ends before it starts',
      withOrbit({ validity: { fromYear: v(2050), toYear: v(1800) } }),
    ],
    [
      'a zero period',
      withOrbit({ motion: { type: 'precessing-ellipse', siderealPeriodDays: v(0) } }),
    ],
  ])('flags %s', (_name, broken) => {
    expect(checkCatalogue([star, broken]).length).toBeGreaterThan(0);
  });

  it('flags a listed source that no value cites', () => {
    const extra: Source = { ...SOURCE, id: 'unused' };
    expect(checkCatalogue([star, { ...planet, sources: [SOURCE, extra] }])).toEqual([
      'planet: source "unused" is listed but no value cites it',
    ]);
  });

  it('accepts a record whose source was read but gave no values', () => {
    const silent: Planet = {
      ...planet,
      orbit: null,
      shape: {
        ...shape(10),
        equatorialRadiusKm: v(10, 'test'),
      },
      massKg: { value: null, reason: 'not given' },
      sources: [SOURCE, { ...SOURCE, id: 'other' }],
    };
    // One value cites "test", so the unused "other" is still flagged.
    expect(checkCatalogue([star, silent])).toHaveLength(1);
  });

  it('flags a duplicate id', () => {
    expect(checkCatalogue([star, planet, planet])).toContain('planet: id is used more than once');
  });

  it('flags a negative rotation period', () => {
    const spun = shape(10);
    const backwards: Planet = {
      ...planet,
      shape: { ...spun, orientation: { ...spun.orientation, rotationPeriodHours: v(-10) } },
    };
    expect(checkCatalogue([star, backwards])).toHaveLength(1);
  });

  it('flags an orbit with nothing to orbit', () => {
    const moon: Moon = { ...planet, kind: 'moon', id: 'moon', parentId: 'planet', shape: shape(1) };
    expect(checkCatalogue([star, planet, moon])).toEqual([]);
    expect(checkCatalogue([{ ...star, orbit: planet.orbit }])).toHaveLength(1);
  });
});

describe('the real catalogue', () => {
  it('passes every check', () => {
    expect(checkCatalogue(catalogue)).toEqual([]);
  });

  it('holds the Sun, the eight planets, their major moons and two ring systems', () => {
    const count = (kind: string): number => catalogue.filter((o) => o.kind === kind).length;
    expect(count('star')).toBe(12);
    expect(catalogue[0]?.id).toBe('sun');
    expect(count('planet')).toBe(8);
    expect(count('ring-system')).toBe(2);
    expect(count('moon')).toBeGreaterThanOrEqual(18);
    expect(count('dwarf-planet')).toBe(4);
    expect(count('asteroid')).toBe(4);
    expect(count('belt')).toBe(2);
    expect(count('comet')).toBe(1);
    // Parents come before what orbits them, so anything placed relative to a parent finds it.
    catalogue.forEach((object, i) => {
      if (object.parentId === null) return;
      expect(catalogue.findIndex((o) => o.id === object.parentId)).toBeLessThan(i);
    });
  });
});
