import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { J2000_JD } from './constants';
import { scenePositions } from './layout';
import { illuminatedFraction, phaseAngleRad } from './phase';
import { createScale } from './scale';
import type { Vec3 } from './vec3';

const SUN: Vec3 = { x: 0, y: 0, z: 0 };
const EARTH: Vec3 = { x: 100, y: 0, z: 0 };

describe('illuminatedFraction', () => {
  it('is full when the body is beyond the viewer, away from the Sun', () => {
    expect(illuminatedFraction({ x: 101, y: 0, z: 0 }, SUN, EARTH)).toBeCloseTo(1, 12);
  });

  it('is new when the body is between the viewer and the Sun', () => {
    expect(illuminatedFraction({ x: 99, y: 0, z: 0 }, SUN, EARTH)).toBeCloseTo(0, 12);
  });

  it('is half when the Sun and the viewer are at a right angle seen from the body', () => {
    const body = { x: 0, y: 0, z: 0 };
    const sun = { x: 50, y: 0, z: 0 };
    const viewer = { x: 0, y: 0, z: 3 };
    expect(phaseAngleRad(body, sun, viewer)).toBeCloseTo(Math.PI / 2, 12);
    expect(illuminatedFraction(body, sun, viewer)).toBeCloseTo(0.5, 12);
  });
});

describe('the Moon', () => {
  it('goes through all its phases in a month', () => {
    const scale = createScale('true');
    const fractions = Array.from({ length: 60 }, (_, i) => {
      const positions = scenePositions(catalogue, J2000_JD + i * 0.5, scale);
      const [moon, sun, earth] = ['moon', 'sun', 'earth'].map((id) => positions.get(id));
      if (!moon || !sun || !earth) throw new Error('missing a body');
      return illuminatedFraction(moon, sun, earth);
    });
    expect(Math.min(...fractions)).toBeLessThan(0.02);
    expect(Math.max(...fractions)).toBeGreaterThan(0.98);
  });
});
