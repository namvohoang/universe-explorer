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
 * Neptune's; Eros crosses Mars's). Spacecraft are left out for the same reason: Juno's long oval
 * round Jupiter passes through the distances of all four big moons.
 */
const keepsItsLane = (object: CelestialObject): boolean =>
  object.kind !== 'dwarf-planet' &&
  object.kind !== 'asteroid' &&
  object.kind !== 'comet' &&
  object.kind !== 'spacecraft';
const childrenOf = (parent: CelestialObject): CelestialObject[] =>
  catalogue
    .filter((o) => o.parentId === parent.id && o.orbit && keepsItsLane(o))
    .sort((a, b) => semiMajorAxisKm(a) - semiMajorAxisKm(b));

/** Nearest and farthest scene distance of a body from its parent's centre. */
const sceneRange = (scale: Scale, object: CelestialObject): { near: number; far: number } => {
  const a = semiMajorAxisKm(object);
  const e = object.orbit?.eccentricity.value ?? 0;
  const parentRadius = radiusKm(parentOf(object));
  return {
    near: scale.distanceToScene(a * (1 - e), parentRadius),
    far: scale.distanceToScene(a * (1 + e), parentRadius),
  };
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
    expect(scale.distanceToScene(5e8, 7e5)).toBeCloseTo(5e8 * factor, 9);
    expect(scale.distanceToScene(4e5, 6e3)).toBeCloseTo(4e5 * factor, 9);
    expect(scale.sizeToScene(70_000)).toBeCloseTo(70_000 * factor, 12);
  });

  it('keeps every size and distance ratio of the catalogue', () => {
    for (const a of bodies) {
      for (const b of bodies) {
        // Compared as a ratio of ratios: Earth is millions of times wider than a spacecraft,
        // and a number that big cannot be held to a fixed number of decimal places.
        const drawn = scale.sizeToScene(radiusKm(a)) / scale.sizeToScene(radiusKm(b));
        expect(drawn / (radiusKm(a) / radiusKm(b))).toBeCloseTo(1, 12);
      }
    }
    for (const a of orbiting) {
      for (const b of orbiting) {
        const sceneA = scale.distanceToScene(semiMajorAxisKm(a), 1);
        const sceneB = scale.distanceToScene(semiMajorAxisKm(b), 1);
        expect(sceneA / sceneB).toBeCloseTo(semiMajorAxisKm(a) / semiMajorAxisKm(b), 9);
      }
    }
  });

  it('keeps size against distance true as well', () => {
    const earth = byId('earth');
    const sceneRatio =
      scale.distanceToScene(semiMajorAxisKm(earth), 1) / scale.sizeToScene(radiusKm(earth));
    expect(sceneRatio).toBeCloseTo(semiMajorAxisKm(earth) / radiusKm(earth), 6);
  });
});

describe('true sizes', () => {
  const scale = createScale('true-sizes');

  it('keeps every size ratio of the catalogue', () => {
    for (const a of bodies) {
      for (const b of bodies) {
        // Compared as a ratio of ratios: Earth is millions of times wider than a spacecraft,
        // and a number that big cannot be held to a fixed number of decimal places.
        const drawn = scale.sizeToScene(radiusKm(a)) / scale.sizeToScene(radiusKm(b));
        expect(drawn / (radiusKm(a) / radiusKm(b))).toBeCloseTo(1, 12);
      }
    }
  });

  it('keeps a close moon at its real distance from its planet', () => {
    // Inside the near zone the distance, measured in planet radii, is the real one.
    const planetRadiusKm = 60_000;
    const scene = scale.distanceToScene(2 * planetRadiusKm, planetRadiusKm);
    expect(scene / scale.sizeToScene(planetRadiusKm)).toBeCloseTo(2, 9);
  });

  it('brings distances in: far orbits are compressed more than near ones', () => {
    const near = scale.distanceToScene(1e7, 7e5) / 1e7;
    const far = scale.distanceToScene(1e9, 7e5) / 1e9;
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

describe('the diagram scale', () => {
  const scale = createScale('diagram');

  it('says that nothing in it is to scale, and is not a mode to pick', () => {
    expect(scale.labelKey).toBe('scaleLabelDiagram');
    expect(scale.sizes).toBe('compressed');
    expect(scale.distances).toBe('compressed');
    expect(SCALE_MODES).not.toContain(scale.mode);
  });

  it('keeps what is bigger bigger and what is farther farther', () => {
    let size = 0;
    for (let r = 1; r < 1e7; r *= 1.5) {
      expect(scale.sizeToScene(r)).toBeGreaterThan(size);
      size = scale.sizeToScene(r);
    }
    for (const parentRadius of [1_000, 60_000, 700_000]) {
      let previous = 0;
      for (let a = parentRadius * 1.01; a < 1e10; a *= 1.37) {
        const scene = scale.distanceToScene(a, parentRadius);
        expect(scene).toBeGreaterThan(previous);
        // Nothing outside its parent is drawn inside it.
        expect(scene).toBeGreaterThan(scale.sizeToScene(parentRadius));
        previous = scene;
      }
    }
  });

  it('brings the Sun, Earth and the Moon into one small picture', () => {
    // Real radii and distances, rounded: only the order of size of the drawing is checked.
    const sun = scale.sizeToScene(696_000);
    const earth = scale.sizeToScene(6_378);
    const moon = scale.sizeToScene(1_737);
    const earthOut = scale.distanceToScene(149_600_000, 696_000);
    const moonOut = scale.distanceToScene(384_400, 6_378);
    expect(sun / earth).toBeLessThan(3);
    expect(earth / moon).toBeLessThan(1.5);
    // The whole line is under ten Earths long, where the real one is 11,700.
    expect((sun + earthOut + moonOut + moon) / (2 * earth)).toBeLessThan(10);
    expect(moonOut).toBeGreaterThan(earth + moon);
    expect(earthOut).toBeGreaterThan(sun + earth + moonOut + moon);
  });
});

describe('the moon-path scale', () => {
  const scale = createScale('moon-path');
  const diagram = createScale('diagram');
  // Rounded: only how the drawing treats them is checked.
  const EARTH_KM = 6_378;
  const NEAR_KM = 357_000;
  const FAR_KM = 406_000;

  it('says that nothing in it is to scale, and draws sizes as the diagram does', () => {
    expect(scale.labelKey).toBe('scaleLabelDiagram');
    expect(SCALE_MODES).not.toContain(scale.mode);
    expect(scale.sizeToScene(1_737)).toBe(diagram.sizeToScene(1_737));
  });

  it('draws a moon as much nearer as it really is, where the diagram all but hides it', () => {
    const drawn = (of: Scale): number =>
      of.distanceToScene(FAR_KM, EARTH_KM) / of.distanceToScene(NEAR_KM, EARTH_KM);
    expect(drawn(scale)).toBeCloseTo(FAR_KM / NEAR_KM, 12);
    expect(drawn(diagram)).toBeLessThan(1.03);
  });

  it('keeps the Moon clear of Earth at its nearest', () => {
    const gap = scale.distanceToScene(NEAR_KM, EARTH_KM);
    expect(gap).toBeGreaterThan(scale.sizeToScene(EARTH_KM) + scale.sizeToScene(1_737));
  });

  it('meets the diagram where its reach ends, and is the diagram beyond', () => {
    let previous = 0;
    for (let km = 50 * EARTH_KM; km < 80 * EARTH_KM; km += EARTH_KM / 7) {
      const scene = scale.distanceToScene(km, EARTH_KM);
      expect(scene).toBeGreaterThan(previous);
      expect(scene - previous).toBeLessThan(0.02 + (previous === 0 ? scene : 0));
      previous = scene;
    }
    expect(scale.distanceToScene(149_600_000, 696_000)).toBe(
      diagram.distanceToScene(149_600_000, 696_000),
    );
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
        const scene = scale.distanceToScene(a, parentRadius);
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

  it('keeps a comet that dives close to its star outside the star', () => {
    const halley = byId('halley');
    const closest = sceneRange(scale, halley).near;
    expect(closest).toBeGreaterThan(scale.sizeToScene(radiusKm(parentOf(halley))));
    // And inside Venus's orbit, as it really is at its closest.
    expect(closest).toBeLessThan(sceneRange(scale, byId('venus')).near);
  });

  it('rejects sizes and distances that are not positive', () => {
    expect(() => scale.sizeToScene(0)).toThrow(RangeError);
    expect(() => scale.distanceToScene(-1, 1)).toThrow(RangeError);
    expect(() => scale.distanceToScene(1, Number.NaN)).toThrow(RangeError);
  });
});
