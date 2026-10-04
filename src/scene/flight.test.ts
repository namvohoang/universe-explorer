import { describe, expect, it } from 'vitest';
import { dot, length, normalize, subtract, type Vec3 } from '../sim/vec3';
import {
  FLIGHT_SECONDS,
  distanceForAspect,
  easeInOutCubic,
  followTarget,
  litSideBearing,
  startFlight,
  stepFlight,
  type View,
} from './flight';

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 };
const HOME: View = { camera: { x: 0, y: 30, z: 60 }, target: ORIGIN };
const TARGET: Vec3 = { x: 10, y: 0, z: 0 };

const expectVec = (actual: Vec3, expected: Vec3): void => {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
  expect(actual.z).toBeCloseTo(expected.z, 10);
};

describe('easeInOutCubic', () => {
  it('starts at 0, ends at 1 and is half way at the middle', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('never goes backwards', () => {
    let previous = 0;
    for (let t = 0; t <= 1; t += 0.01) {
      expect(easeInOutCubic(t)).toBeGreaterThanOrEqual(previous);
      previous = easeInOutCubic(t);
    }
  });
});

describe('distanceForAspect', () => {
  it('leaves wide screens alone and steps back on narrow ones', () => {
    expect(distanceForAspect(72, 16 / 9)).toBe(72);
    expect(distanceForAspect(72, 1.25)).toBe(72);
    expect(distanceForAspect(72, 0.5)).toBe(180);
  });
});

describe('flight', () => {
  it('ends at the asked distance from the target, looking at it', () => {
    const flight = startFlight(HOME, TARGET, 5, null, false);
    const { view, flight: rest } = stepFlight(flight, FLIGHT_SECONDS, TARGET);
    expect(rest).toBeNull();
    expectVec(view.target, TARGET);
    expect(length(subtract(view.camera, TARGET))).toBeCloseTo(5, 10);
  });

  it('starts where the camera is', () => {
    const { view, flight } = stepFlight(startFlight(HOME, TARGET, 5, null, false), 0, TARGET);
    expectVec(view.camera, HOME.camera);
    expectVec(view.target, HOME.target);
    expect(flight).not.toBeNull();
  });

  it('arrives after the flight time, not before', () => {
    let step = stepFlight(startFlight(HOME, TARGET, 5, null, false), FLIGHT_SECONDS / 2, TARGET);
    expect(step.flight).not.toBeNull();
    if (!step.flight) return;
    step = stepFlight(step.flight, FLIGHT_SECONDS / 2, TARGET);
    expect(step.flight).toBeNull();
  });

  it('arrives at once with reduced motion', () => {
    const step = stepFlight(startFlight(HOME, TARGET, 5, null, true), 0, TARGET);
    expect(step.flight).toBeNull();
    expectVec(step.view.target, TARGET);
  });

  it('uses the given direction when there is one', () => {
    const flight = startFlight(HOME, TARGET, 4, { x: 0, y: 0, z: 2 }, true);
    expectVec(stepFlight(flight, 0, TARGET).view.camera, { x: 10, y: 0, z: 4 });
  });

  it('never ends up below or flat along the plane', () => {
    const low: View = { camera: { x: 50, y: -20, z: 0 }, target: ORIGIN };
    const { view } = stepFlight(startFlight(low, TARGET, 5, null, true), 0, TARGET);
    expect(view.camera.y).toBeGreaterThan(1);
  });

  it('copes with a camera sitting exactly on the target', () => {
    const on: View = { camera: TARGET, target: TARGET };
    const { view } = stepFlight(startFlight(on, TARGET, 5, null, true), 0, TARGET);
    expect(length(subtract(view.camera, TARGET))).toBeCloseTo(5, 10);
  });

  it('chases a target that moves during the flight', () => {
    const moved = { x: 20, y: 0, z: 5 };
    const { view } = stepFlight(startFlight(HOME, TARGET, 5, null, false), FLIGHT_SECONDS, moved);
    expectVec(view.target, moved);
    expect(length(subtract(view.camera, moved))).toBeCloseTo(5, 10);
  });
});

describe('followTarget', () => {
  it('moves the camera and its target by what the body moved', () => {
    const view: View = { camera: { x: 10, y: 2, z: 4 }, target: TARGET };
    const next = followTarget(view, TARGET, { x: 11, y: 0, z: -1 });
    expectVec(next.target, { x: 11, y: 0, z: -1 });
    expectVec(next.camera, { x: 11, y: 2, z: 3 });
  });
});

describe('litSideBearing', () => {
  const sun: Vec3 = { x: 0, y: 0, z: 0 };

  it('looks from the sunny side, a little above', () => {
    const body: Vec3 = { x: 50, y: 0, z: 20 };
    const bearing = litSideBearing(body, sun);
    if (!bearing) throw new Error('expected a bearing');
    expect(length(bearing)).toBeCloseTo(1, 12);
    expect(dot(bearing, normalize(subtract(sun, body)))).toBeGreaterThan(0.7);
    expect(bearing.y).toBeGreaterThan(0.2);
  });

  it('has no answer for the light itself', () => {
    expect(litSideBearing(sun, sun)).toBeNull();
  });

  it('copes with a body straight above the light', () => {
    const bearing = litSideBearing({ x: 0, y: 10, z: 0 }, sun);
    expect(bearing && Number.isFinite(bearing.x)).toBe(true);
  });
});
