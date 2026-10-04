import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import type { ObjectOfKind, RingSystem, Sourced } from '../data/types';
import { opacityFromOpticalDepth, ringProfile, ringlets } from './rings';

const v = <T>(value: T): Sourced<T> => ({ value, sourceId: 'test' });

// A made-up system: a faint band, a gap, a thick band and one ringlet.
const system: RingSystem = {
  id: 'test-rings',
  kind: 'ring-system',
  name: 'Test rings',
  parentId: 'planet',
  orbit: null,
  shape: { type: 'ring', innerRadiusKm: v(100), outerRadiusKm: v(200) },
  bands: [
    {
      type: 'band',
      name: 'faint',
      innerRadiusKm: v(100),
      outerRadiusKm: v(120),
      opticalDepth: v([0.1, 0.1]),
    },
    {
      type: 'band',
      name: 'thick',
      innerRadiusKm: v(150),
      outerRadiusKm: v(180),
      opticalDepth: v([1, 3]),
    },
    { type: 'ringlet', name: 'thread', radiusKm: v(195), opticalDepth: v([0.5, 0.5]) },
    {
      type: 'band',
      name: 'unmeasured',
      innerRadiusKm: v(125),
      outerRadiusKm: v(130),
      opticalDepth: { value: null, reason: 'never measured' },
    },
  ],
  media: [],
  sources: [],
};

const sample = (radiusKm: number, samples = 100): number => {
  const profile = ringProfile(system, samples);
  return profile.opacity[Math.floor(((radiusKm - 100) / 100) * samples)] ?? NaN;
};

describe('opacityFromOpticalDepth', () => {
  it('is 0 for empty space and approaches 1 for a thick ring', () => {
    expect(opacityFromOpticalDepth(0)).toBe(0);
    expect(opacityFromOpticalDepth(1)).toBeCloseTo(1 - 1 / Math.E, 12);
    expect(opacityFromOpticalDepth(20)).toBeCloseTo(1, 6);
  });

  it('grows with optical depth and rejects a negative one', () => {
    expect(opacityFromOpticalDepth(0.5)).toBeGreaterThan(opacityFromOpticalDepth(0.1));
    expect(() => opacityFromOpticalDepth(-1)).toThrow(RangeError);
  });
});

describe('ringProfile', () => {
  it('spans the system from its inner to its outer radius', () => {
    const profile = ringProfile(system, 100);
    expect(profile.innerRadiusKm).toBe(100);
    expect(profile.outerRadiusKm).toBe(200);
    expect(profile.opacity).toHaveLength(100);
  });

  it('fills each band with the opacity of the middle of its optical-depth range', () => {
    expect(sample(110)).toBeCloseTo(opacityFromOpticalDepth(0.1), 6);
    expect(sample(165)).toBeCloseTo(opacityFromOpticalDepth(2), 6);
  });

  it('leaves gaps and unmeasured bands empty', () => {
    expect(sample(140)).toBe(0);
    expect(sample(127)).toBe(0);
    expect(sample(185)).toBe(0);
  });

  it('leaves ringlets out: they are drawn as lines', () => {
    expect(sample(195)).toBe(0);
    expect(ringlets(system)).toEqual([
      { name: 'thread', radiusKm: 195, opacity: opacityFromOpticalDepth(0.5) },
    ]);
  });

  it('rejects too few samples', () => {
    expect(() => ringProfile(system, 1)).toThrow(RangeError);
  });
});

describe('the real rings', () => {
  const rings = catalogue.filter((o): o is ObjectOfKind<'ring-system'> => o.kind === 'ring-system');

  it('are in the catalogue for Saturn and Uranus', () => {
    expect(rings.map((r) => r.parentId).sort()).toEqual(['saturn', 'uranus']);
  });

  it("make Saturn's B ring the most opaque and the Cassini division nearly clear", () => {
    const saturn = rings.find((r) => r.parentId === 'saturn');
    if (!saturn) throw new Error('no Saturn rings');
    const profile = ringProfile(saturn, 2048);
    const at = (radiusKm: number): number =>
      profile.opacity[
        Math.floor(
          ((radiusKm - profile.innerRadiusKm) / (profile.outerRadiusKm - profile.innerRadiusKm)) *
            2048,
        )
      ] ?? NaN;
    const middle = (name: string): number => {
      const band = saturn.bands.find((b) => b.name === name);
      if (band?.type !== 'band') throw new Error(`no band ${name}`);
      return at((band.innerRadiusKm.value + band.outerRadiusKm.value) / 2);
    };
    expect(middle('B ring')).toBeGreaterThan(middle('A ring'));
    expect(middle('A ring')).toBeGreaterThan(middle('C ring'));
    expect(middle('C ring')).toBeGreaterThan(middle('Cassini division'));
    expect(Math.max(...profile.opacity)).toBeLessThanOrEqual(1);
  });

  it('give Uranus ten ringlets and Saturn its F ring', () => {
    const count = (parentId: string): number => {
      const system = rings.find((r) => r.parentId === parentId);
      if (!system) throw new Error(`no rings for ${parentId}`);
      return ringlets(system).length;
    };
    expect(count('uranus')).toBe(10);
    expect(count('saturn')).toBe(1);
  });

  it('lie outside their planet', () => {
    for (const ring of rings) {
      const planet = catalogue.find((o) => o.id === ring.parentId);
      if (planet?.shape?.type !== 'spheroid') throw new Error('ringed planets are spheroids');
      expect(ring.shape.innerRadiusKm.value).toBeGreaterThan(planet.shape.equatorialRadiusKm.value);
    }
  });
});
