import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import type { BeltOrbit, ObjectOfKind } from '../data/types';
import { beltScenePositions, sceneDistance } from './belt';
import { J2000_JD, KM_PER_AU } from './constants';
import { bodyRadiusKm } from './layout';
import { SCALE_MODES, createScale } from './scale';

const sun = catalogue.find((o) => o.id === 'sun');
const SUN_RADIUS_KM = (sun && bodyRadiusKm(sun)) ?? 1;
const belts = catalogue.filter((o): o is ObjectOfKind<'belt'> => o.kind === 'belt');

// A made-up member: a = 2 AU, e = 0.5, in the ecliptic, at perihelion at the epoch.
const ONE: BeltOrbit[] = [[2, 0.5, 0, 0, 0, 0, 1, J2000_JD]];

const distances = (positions: Float32Array): number[] =>
  Array.from({ length: positions.length / 3 }, (_, n) =>
    Math.hypot(positions[n * 3] ?? 0, positions[n * 3 + 1] ?? 0, positions[n * 3 + 2] ?? 0),
  );

describe('beltScenePositions', () => {
  const scale = createScale('true');
  const unitsPerAu = scale.sizeToScene(KM_PER_AU);

  it('puts a member at perihelion on +x at its epoch', () => {
    const out = beltScenePositions(ONE, SUN_RADIUS_KM, J2000_JD, scale, new Float32Array(3));
    expect(out[0]).toBeCloseTo(1 * unitsPerAu, 2);
    expect(out[1]).toBeCloseTo(0, 6);
    expect(out[2]).toBeCloseTo(0, 6);
  });

  it('reaches aphelion half a turn later', () => {
    const out = beltScenePositions(ONE, SUN_RADIUS_KM, J2000_JD + 180, scale, new Float32Array(3));
    expect(out[0]).toBeCloseTo(-3 * unitsPerAu, 1);
  });

  it('puts the ecliptic north up', () => {
    const tilted: BeltOrbit[] = [[2, 0, 90, 0, 0, 90, 1, J2000_JD]];
    const out = beltScenePositions(tilted, SUN_RADIUS_KM, J2000_JD, scale, new Float32Array(3));
    expect(out[1]).toBeCloseTo(2 * unitsPerAu, 1);
  });

  it('refuses an output that is too small', () => {
    expect(() =>
      beltScenePositions(ONE, SUN_RADIUS_KM, J2000_JD, scale, new Float32Array(2)),
    ).toThrow(RangeError);
  });
});

describe('the real belts', () => {
  it('are the asteroid belt and the Kuiper Belt, each with hundreds of real orbits', () => {
    expect(belts.map((b) => b.id)).toEqual(['asteroid-belt', 'kuiper-belt']);
    for (const belt of belts) expect(belt.members.value.length).toBeGreaterThan(500);
  });

  it('hold only bound orbits inside the belt’s own span', () => {
    for (const belt of belts) {
      for (const [a, e] of belt.members.value) {
        expect(e).toBeGreaterThanOrEqual(0);
        expect(e).toBeLessThan(1);
        expect(a).toBeGreaterThanOrEqual(belt.shape.innerRadiusAu.value - 1);
        expect(a).toBeLessThanOrEqual(belt.shape.outerRadiusAu.value + 1e-9);
      }
    }
  });

  it.each(SCALE_MODES)('sit between Mars and Jupiter, and beyond Neptune, in %s mode', (mode) => {
    const scale = createScale(mode);
    const at = (au: number): number => sceneDistance(au, SUN_RADIUS_KM, scale);
    const [asteroids, kuiper] = belts;
    if (!asteroids || !kuiper) throw new Error('two belts');
    const spread = (belt: ObjectOfKind<'belt'>): number[] =>
      distances(
        beltScenePositions(
          belt.members.value,
          SUN_RADIUS_KM,
          J2000_JD + 9000,
          scale,
          new Float32Array(belt.members.value.length * 3),
        ),
      ).sort((a, b) => a - b);
    const middle = (sorted: number[]): number => sorted[Math.floor(sorted.length / 2)] ?? NaN;
    // The planets' distances here are only rough landmarks for the test, not catalogue data.
    expect(middle(spread(asteroids))).toBeGreaterThan(at(1.6));
    expect(middle(spread(asteroids))).toBeLessThan(at(5));
    expect(middle(spread(kuiper))).toBeGreaterThan(at(30));
  });

  it('move as the date changes', () => {
    const belt = belts[0];
    if (!belt) throw new Error('no belt');
    const scale = createScale('easy');
    const size = belt.members.value.length * 3;
    const a = beltScenePositions(
      belt.members.value,
      SUN_RADIUS_KM,
      J2000_JD,
      scale,
      new Float32Array(size),
    );
    const b = beltScenePositions(
      belt.members.value,
      SUN_RADIUS_KM,
      J2000_JD + 100,
      scale,
      new Float32Array(size),
    );
    expect(a[0]).not.toBe(b[0]);
  });
});
