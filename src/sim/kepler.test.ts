import { describe, expect, it } from 'vitest';
import { TAU, degToRad } from './angles';
import {
  KEPLER_TOLERANCE_RAD,
  orbitPath,
  positionFromState,
  solveKepler,
  trueAnomaly,
  type OrbitState,
} from './kepler';
import { length } from './vec3';

const flat = (changes: Partial<OrbitState> = {}): OrbitState => ({
  semiMajorAxis: 10,
  eccentricity: 0,
  inclinationRad: 0,
  longitudeOfAscendingNodeRad: 0,
  argumentOfPeriapsisRad: 0,
  meanAnomalyRad: 0,
  ...changes,
});

describe('solveKepler', () => {
  it('returns the mean anomaly for a circle', () => {
    for (const m of [0, 0.5, 2, 3, -1]) expect(solveKepler(m, 0)).toBeCloseTo(m, 12);
  });

  it('is exact at periapsis and apoapsis', () => {
    expect(solveKepler(0, 0.7)).toBeCloseTo(0, 12);
    expect(Math.abs(solveKepler(Math.PI, 0.7))).toBeCloseTo(Math.PI, 12);
  });

  it.each([0.01, 0.2, 0.5, 0.9, 0.99, 0.999])('satisfies the equation for e = %f', (e) => {
    for (let i = -200; i <= 200; i++) {
      const m = (i / 200) * Math.PI;
      const big = solveKepler(m, e);
      // Compare as angles: −π and π are the same place.
      const residual = big - e * Math.sin(big) - m;
      const wrapped = residual - TAU * Math.round(residual / TAU);
      expect(Math.abs(wrapped)).toBeLessThan(10 * KEPLER_TOLERANCE_RAD);
    }
  });

  it('gives the same place for a mean anomaly one turn later', () => {
    expect(Math.sin(solveKepler(1 + 3 * TAU, 0.3))).toBeCloseTo(Math.sin(solveKepler(1, 0.3)), 12);
  });

  it('rejects unbound orbits', () => {
    expect(() => solveKepler(1, 1)).toThrow(RangeError);
    expect(() => solveKepler(1, -0.1)).toThrow(RangeError);
  });
});

describe('trueAnomaly', () => {
  it('equals the eccentric anomaly for a circle', () => {
    expect(trueAnomaly(1.2, 0)).toBeCloseTo(1.2, 12);
  });

  it('runs ahead of the eccentric anomaly on the way out from periapsis', () => {
    expect(trueAnomaly(1, 0.5)).toBeGreaterThan(1);
    expect(trueAnomaly(Math.PI, 0.5)).toBeCloseTo(Math.PI, 12);
  });
});

describe('positionFromState', () => {
  it('is at distance a(1 − e) at periapsis and a(1 + e) at apoapsis', () => {
    const e = 0.4;
    expect(length(positionFromState(flat({ eccentricity: e })))).toBeCloseTo(6, 10);
    expect(
      length(positionFromState(flat({ eccentricity: e, meanAnomalyRad: Math.PI }))),
    ).toBeCloseTo(14, 10);
  });

  it('puts periapsis along +x when no angle is set', () => {
    const p = positionFromState(flat({ eccentricity: 0.4 }));
    expect(p.x).toBeCloseTo(6, 10);
    expect(p.y).toBeCloseTo(0, 10);
    expect(p.z).toBeCloseTo(0, 10);
  });

  it('turns periapsis by the argument of periapsis and by the node', () => {
    const byPeri = positionFromState(flat({ argumentOfPeriapsisRad: degToRad(90) }));
    expect(byPeri.x).toBeCloseTo(0, 10);
    expect(byPeri.y).toBeCloseTo(10, 10);
    const byNode = positionFromState(flat({ longitudeOfAscendingNodeRad: degToRad(90) }));
    expect(byNode.x).toBeCloseTo(0, 10);
    expect(byNode.y).toBeCloseTo(10, 10);
  });

  it('lifts the orbit out of the plane by the inclination', () => {
    // A quarter turn past the ascending node is the highest point: z = a·sin(i).
    const p = positionFromState(flat({ inclinationRad: degToRad(30), meanAnomalyRad: TAU / 4 }));
    expect(p.z).toBeCloseTo(5, 10);
    expect(p.x).toBeCloseTo(0, 10);
    expect(length(p)).toBeCloseTo(10, 10);
  });

  it('crosses the plane going up at the ascending node', () => {
    const node = degToRad(40);
    const state = flat({ inclinationRad: degToRad(30), longitudeOfAscendingNodeRad: node });
    const at = positionFromState(state);
    const after = positionFromState({ ...state, meanAnomalyRad: 0.01 });
    expect(at.z).toBeCloseTo(0, 10);
    expect(Math.atan2(at.y, at.x)).toBeCloseTo(node, 10);
    expect(after.z).toBeGreaterThan(0);
  });

  it('moves faster near periapsis than near apoapsis', () => {
    const step = 0.01;
    const moved = (from: number): number => {
      const a = positionFromState(flat({ eccentricity: 0.6, meanAnomalyRad: from }));
      const b = positionFromState(flat({ eccentricity: 0.6, meanAnomalyRad: from + step }));
      return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    };
    expect(moved(0)).toBeGreaterThan(3 * moved(Math.PI));
  });
});

describe('orbitPath', () => {
  const state = flat({
    eccentricity: 0.3,
    inclinationRad: degToRad(20),
    longitudeOfAscendingNodeRad: degToRad(50),
    argumentOfPeriapsisRad: degToRad(70),
  });

  it('is a closed loop', () => {
    const path = orbitPath(state, 64);
    expect(path).toHaveLength(65);
    expect(path[64]?.x).toBeCloseTo(path[0]?.x ?? NaN, 10);
    expect(path[64]?.y).toBeCloseTo(path[0]?.y ?? NaN, 10);
    expect(path[64]?.z).toBeCloseTo(path[0]?.z ?? NaN, 10);
  });

  it('passes through the body wherever it is on its orbit', () => {
    // The body sits on its drawn path: its distance from the focus matches the ellipse there.
    for (const m of [0, 1, 2.5, 4, 6]) {
      const body = positionFromState({ ...state, meanAnomalyRad: m });
      const nearest = Math.min(
        ...orbitPath(state, 4096).map((p) => Math.hypot(p.x - body.x, p.y - body.y, p.z - body.z)),
      );
      expect(nearest).toBeLessThan(0.02);
    }
  });

  it('stays between periapsis and apoapsis distance', () => {
    for (const p of orbitPath(state, 128)) {
      expect(length(p)).toBeGreaterThanOrEqual(7 - 1e-9);
      expect(length(p)).toBeLessThanOrEqual(13 + 1e-9);
    }
  });

  it('rejects too few segments', () => {
    expect(() => orbitPath(state, 2)).toThrow(RangeError);
  });
});
