import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import type { BodyShape, CelestialObject, SpheroidShape } from '../data/types';
import { J2000_JD, KM_PER_AU } from './constants';
import { orbitPositionKmAt } from './elements';
import { bodyRadiusKm, sceneAxes, sceneOrbitPath, scenePositions } from './layout';
import { SCALE_MODES, createScale } from './scale';
import { length, subtract, type Vec3 } from './vec3';

const byId = (id: string): CelestialObject => {
  const object = catalogue.find((o) => o.id === id);
  if (!object) throw new Error(`no ${id}`);
  return object;
};

const at = (positions: Map<string, Vec3>, id: string): Vec3 => {
  const position = positions.get(id);
  if (!position) throw new Error(`no position for ${id}`);
  return position;
};

const spheroid = (id: string): SpheroidShape => {
  const { shape } = byId(id);
  if (shape?.type !== 'spheroid') throw new Error(`${id} is not a spheroid`);
  return shape;
};

const DATES = [J2000_JD - 50_000, J2000_JD, J2000_JD + 9_772.5];

const bodyShape = (id: string): BodyShape => {
  const { shape } = byId(id);
  if (shape?.type !== 'spheroid' && shape?.type !== 'triaxial')
    throw new Error(`${id} is not solid`);
  return shape;
};

describe('sceneAxes', () => {
  it.each(SCALE_MODES)('keeps the real flattening in %s mode', (mode) => {
    const scale = createScale(mode);
    for (const id of ['earth', 'jupiter', 'saturn', 'sun']) {
      const shape = spheroid(id);
      const axes = sceneAxes(shape, scale);
      expect(axes.y / axes.x).toBeCloseTo(
        shape.polarRadiusKm.value / shape.equatorialRadiusKm.value,
        12,
      );
      expect(axes.x).toBe(scale.sizeToScene(shape.equatorialRadiusKm.value));
      expect(axes.z).toBe(axes.x);
    }
  });

  it('draws Saturn visibly flattened', () => {
    const axes = sceneAxes(spheroid('saturn'), createScale('easy'));
    expect(axes.y / axes.x).toBeLessThan(0.95);
  });

  it('draws Phobos lumpy: its three radii are clearly different', () => {
    const axes = sceneAxes(bodyShape('phobos'), createScale('true'));
    expect(axes.y / axes.x).toBeLessThan(0.75);
    expect(axes.z / axes.x).toBeLessThan(0.9);
  });

  it.each(SCALE_MODES)('keeps the real proportions of a three-axis moon in %s mode', (mode) => {
    const shape = bodyShape('mimas');
    if (shape.type !== 'triaxial') throw new Error('Mimas is triaxial in the catalogue');
    const [towards, along, polar] = shape.radiiKm.value;
    const axes = sceneAxes(shape, createScale(mode));
    expect(axes.z / axes.x).toBeCloseTo(along / towards, 12);
    expect(axes.y / axes.x).toBeCloseTo(polar / towards, 12);
    expect(axes.x).toBeGreaterThan(axes.z);
    expect(axes.z).toBeGreaterThan(axes.y);
  });
});

describe('scenePositions', () => {
  it('places every object, the Sun at the origin', () => {
    const positions = scenePositions(catalogue, J2000_JD, createScale('easy'));
    expect([...positions.keys()].sort()).toEqual(catalogue.map((o) => o.id).sort());
    expect(at(positions, 'sun')).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('matches the real distances in true mode', () => {
    const scale = createScale('true');
    const unitsPerKm = scale.sizeToScene(1);
    for (const jd of DATES) {
      const positions = scenePositions(catalogue, jd, scale);
      for (const id of ['mercury', 'earth', 'neptune']) {
        const orbit = byId(id).orbit;
        if (!orbit) throw new Error('planets have orbits');
        expect(length(at(positions, id))).toBeCloseTo(
          length(orbitPositionKmAt(orbit, jd)) * unitsPerKm,
          6,
        );
      }
    }
  });

  it('places the Moon relative to Earth, not the Sun', () => {
    const scale = createScale('true');
    const positions = scenePositions(catalogue, J2000_JD, scale);
    const moonOrbit = byId('moon').orbit;
    if (!moonOrbit) throw new Error('the Moon has an orbit');
    const fromEarth = length(subtract(at(positions, 'moon'), at(positions, 'earth')));
    expect(fromEarth).toBeCloseTo(
      length(orbitPositionKmAt(moonOrbit, J2000_JD)) * scale.sizeToScene(1),
      8,
    );
    expect(fromEarth).toBeLessThan(length(at(positions, 'earth')) / 100);
  });

  it('keeps the planets close to the ecliptic, which is the scene floor', () => {
    const positions = scenePositions(catalogue, J2000_JD, createScale('true'));
    const earth = at(positions, 'earth');
    expect(Math.abs(earth.y)).toBeLessThan(length(earth) * 1e-3);
    expect(length(earth)).toBeGreaterThan(0.9 * 1000);
    expect(length(earth)).toBeLessThan(1.1 * 1000);
  });

  it.each(SCALE_MODES)('never puts a body inside its parent in %s mode', (mode) => {
    const scale = createScale(mode);
    for (const jd of DATES) {
      const positions = scenePositions(catalogue, jd, scale);
      for (const object of catalogue) {
        if (!object.orbit || object.parentId === null) continue;
        const gap = length(subtract(at(positions, object.id), at(positions, object.parentId)));
        const parent = byId(object.parentId);
        const radii =
          scale.sizeToScene(bodyRadiusKm(object) ?? 0) +
          scale.sizeToScene(bodyRadiusKm(parent) ?? 0);
        expect(gap).toBeGreaterThan(radii);
      }
    }
  });

  it('moves the planets as the date changes', () => {
    const scale = createScale('easy');
    const before = at(scenePositions(catalogue, J2000_JD, scale), 'earth');
    const after = at(scenePositions(catalogue, J2000_JD + 30, scale), 'earth');
    expect(length(subtract(after, before))).toBeGreaterThan(1);
  });
});

describe('sceneOrbitPath', () => {
  it.each(SCALE_MODES)('passes through the body in %s mode', (mode) => {
    const scale = createScale(mode);
    for (const jd of DATES) {
      const positions = scenePositions(catalogue, jd, scale);
      for (const object of catalogue) {
        if (!object.orbit || object.parentId === null) continue;
        const offset = subtract(at(positions, object.id), at(positions, object.parentId));
        const path = sceneOrbitPath(object, catalogue, jd, scale, 2048);
        const nearest = Math.min(...path.map((point) => length(subtract(point, offset))));
        // Within the spacing of the path's own points: the body is on the line.
        expect(nearest).toBeLessThan((length(offset) * 2 * Math.PI) / 2048);
      }
    }
  });

  it('is a closed loop', () => {
    const path = sceneOrbitPath(byId('mars'), catalogue, J2000_JD, createScale('easy'), 64);
    const [first, last] = [path[0], path[64]];
    if (!first || !last) throw new Error('path has 65 points');
    expect(length(subtract(first, last))).toBeCloseTo(0, 9);
  });

  it('is an ellipse, not a circle: Mercury swings in and out', () => {
    const path = sceneOrbitPath(byId('mercury'), catalogue, J2000_JD, createScale('true'), 256);
    const distances = path.map(length);
    const unitsPerAu = createScale('true').sizeToScene(KM_PER_AU);
    expect(Math.max(...distances) - Math.min(...distances)).toBeGreaterThan(0.1 * unitsPerAu);
  });

  it('refuses an object with no orbit', () => {
    expect(() =>
      sceneOrbitPath(byId('sun'), catalogue, J2000_JD, createScale('easy'), 64),
    ).toThrow();
  });
});
