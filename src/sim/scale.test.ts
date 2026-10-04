import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import type { CelestialObject } from '../data/types';
import { KM_PER_AU } from './constants';
import { bodyRadiusKm } from './layout';
import { SCALE_MODES, createScale, type Scale } from './scale';

const radiusKm = (object: CelestialObject): number => {
  const radius = bodyRadiusKm(object);
  if (radius === null) throw new Error(`${object.id} is not a solid body`);
  return radius;
};

/** How far a planet's rings reach, in its own radii; 1 when it has none. */
const ringReach = (object: CelestialObject): number => {
  const rings = catalogue.find((o) => o.kind === 'ring-system' && o.parentId === object.id);
  return rings?.shape?.type === 'ring'
    ? Math.max(1, rings.shape.outerRadiusKm.value / radiusKm(object))
    : 1;
};

const semiMajorAxisKm = (object: CelestialObject): number => {
  if (!object.orbit) throw new Error(`${object.id} has no orbit`);
  return 'semiMajorAxisAu' in object.orbit
    ? object.orbit.semiMajorAxisAu.value * KM_PER_AU
    : object.orbit.semiMajorAxisKm.value;
};

const byId = (id: string): CelestialObject => {
  const object = catalogue.find((o) => o.id === id);
  if (!object) throw new Error(`no ${id}`);
  return object;
};

const parentOf = (object: CelestialObject): CelestialObject => byId(object.parentId ?? '');

/**
 * Bodies whose orbits are well apart from their neighbours': the planets and the moons. Dwarf
 * planets and asteroids are left out because their real orbits cross others' (Pluto comes inside
 * Neptune's; Eros crosses Mars's).
 */
const keepsItsLane = (object: CelestialObject): boolean =>
  object.kind !== 'dwarf-planet' && object.kind !== 'asteroid';
const childrenOf = (parent: CelestialObject): CelestialObject[] =>
  catalogue
    .filter((o) => o.parentId === parent.id && o.orbit && keepsItsLane(o))
    .sort((a, b) => semiMajorAxisKm(a) - semiMajorAxisKm(b));

/** Nearest and farthest scene distance of a body from its parent's centre. */
const sceneRange = (scale: Scale, object: CelestialObject): { near: number; far: number } => {
  const a = semiMajorAxisKm(object);
  const e = object.orbit?.eccentricity.value ?? 0;
  const factor = scale.orbitFactor(a, radiusKm(parentOf(object)));
  return { near: a * (1 - e) * factor, far: a * (1 + e) * factor };
};

/** How far a body and everything orbiting it reaches from its own centre, in scene units. */
const sceneReach = (scale: Scale, object: CelestialObject): number =>
  Math.max(
    scale.sizeToScene(radiusKm(object)) * ringReach(object),
    ...childrenOf(object).map((c) => sceneRange(scale, c).far + sceneReach(scale, c)),
  );

const bodies = catalogue.filter((o) => bodyRadiusKm(o) !== null);
const orbiting = catalogue.filter((o) => o.orbit);

describe('true scale', () => {
  const scale = createScale('true');

  it('uses one factor for sizes and distances', () => {
    const factor = scale.sizeToScene(1);
    expect(scale.orbitFactor(5e8, 7e5)).toBe(factor);
    expect(scale.orbitFactor(4e5, 6e3)).toBe(factor);
    expect(scale.sizeToScene(70_000)).toBeCloseTo(70_000 * factor, 12);
  });

  it('keeps every size and distance ratio of the catalogue', () => {
    for (const a of bodies) {
      for (const b of bodies) {
        expect(scale.sizeToScene(radiusKm(a)) / scale.sizeToScene(radiusKm(b))).toBeCloseTo(
          radiusKm(a) / radiusKm(b),
          9,
        );
      }
    }
    for (const a of orbiting) {
      for (const b of orbiting) {
        const sceneA = semiMajorAxisKm(a) * scale.orbitFactor(semiMajorAxisKm(a), 1);
        const sceneB = semiMajorAxisKm(b) * scale.orbitFactor(semiMajorAxisKm(b), 1);
        expect(sceneA / sceneB).toBeCloseTo(semiMajorAxisKm(a) / semiMajorAxisKm(b), 9);
      }
    }
  });

  it('keeps size against distance true as well', () => {
    const earth = byId('earth');
    const sceneRatio =
      (semiMajorAxisKm(earth) * scale.orbitFactor(semiMajorAxisKm(earth), 1)) /
      scale.sizeToScene(radiusKm(earth));
    expect(sceneRatio).toBeCloseTo(semiMajorAxisKm(earth) / radiusKm(earth), 6);
  });
});

describe('true sizes', () => {
  const scale = createScale('true-sizes');

  it('keeps every size ratio of the catalogue', () => {
    for (const a of bodies) {
      for (const b of bodies) {
        expect(scale.sizeToScene(radiusKm(a)) / scale.sizeToScene(radiusKm(b))).toBeCloseTo(
          radiusKm(a) / radiusKm(b),
          9,
        );
      }
    }
  });

  it('keeps a close moon at its real distance from its planet', () => {
    // Inside the near zone the distance, measured in planet radii, is the real one.
    const planetRadiusKm = 60_000;
    const scene = 2 * planetRadiusKm * scale.orbitFactor(2 * planetRadiusKm, planetRadiusKm);
    expect(scene / scale.sizeToScene(planetRadiusKm)).toBeCloseTo(2, 9);
  });

  it('brings distances in: far orbits are compressed more than near ones', () => {
    const near = scale.orbitFactor(1e7, 7e5);
    const far = scale.orbitFactor(1e9, 7e5);
    expect(far).toBeLessThan(near);
  });
});

describe('easy view', () => {
  const scale = createScale('easy');

  it('keeps bigger bodies bigger, but by less than the real ratio', () => {
    const sorted = [...bodies].sort((a, b) => radiusKm(a) - radiusKm(b));
    for (let i = 1; i < sorted.length; i++) {
      const [small, big] = [sorted[i - 1], sorted[i]];
      if (!small || !big || radiusKm(small) === radiusKm(big)) continue;
      const sceneRatio = scale.sizeToScene(radiusKm(big)) / scale.sizeToScene(radiusKm(small));
      expect(sceneRatio).toBeGreaterThan(1);
      expect(sceneRatio).toBeLessThan(radiusKm(big) / radiusKm(small));
    }
  });
});

describe.each(SCALE_MODES)('%s mode', (mode) => {
  const scale = createScale(mode);

  it('says what is and is not to scale', () => {
    expect(scale.mode).toBe(mode);
    expect(scale.labelKey).toMatch(/^scaleLabel/);
    expect(scale.sizes === 'true' && scale.distances === 'true').toBe(mode === 'true');
  });

  it('grows scene distance with real distance, for any parent', () => {
    for (const parentRadius of [1_000, 60_000, 700_000]) {
      let previous = 0;
      for (let a = parentRadius * 2; a < 1e10; a *= 1.37) {
        const scene = a * scale.orbitFactor(a, parentRadius);
        expect(scene).toBeGreaterThan(previous);
        previous = scene;
      }
    }
  });

  it('grows scene size with real size', () => {
    let previous = 0;
    for (let r = 1; r < 1e7; r *= 1.5) {
      const scene = scale.sizeToScene(r);
      expect(scene).toBeGreaterThan(previous);
      previous = scene;
    }
  });

  it('keeps the planets in their real order from the Sun', () => {
    const planets = childrenOf(byId('sun'));
    const scene = planets.map((p) => sceneRange(scale, p).near);
    expect([...scene].sort((a, b) => a - b)).toEqual(scene);
    expect(planets.map((p) => p.id)).toEqual([
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ]);
  });

  it('never draws a body inside its parent or its parent’s rings', () => {
    for (const object of orbiting) {
      const clearance =
        sceneRange(scale, object).near -
        sceneReach(scale, object) -
        scale.sizeToScene(radiusKm(parentOf(object))) * ringReach(parentOf(object));
      expect(clearance).toBeGreaterThan(0);
    }
  });

  it('never lets neighbouring systems overlap', () => {
    for (const parent of catalogue) {
      const children = childrenOf(parent);
      for (let i = 1; i < children.length; i++) {
        const [inner, outer] = [children[i - 1], children[i]];
        if (!inner || !outer) continue;
        const innerEdge = sceneRange(scale, inner).far + sceneReach(scale, inner);
        const outerEdge = sceneRange(scale, outer).near - sceneReach(scale, outer);
        expect(outerEdge).toBeGreaterThan(innerEdge);
      }
    }
  });

  it('rejects sizes and distances that are not positive', () => {
    expect(() => scale.sizeToScene(0)).toThrow(RangeError);
    expect(() => scale.orbitFactor(-1, 1)).toThrow(RangeError);
    expect(() => scale.orbitFactor(1, Number.NaN)).toThrow(RangeError);
  });
});
