import { describe, expect, it } from 'vitest';
import type { OrbitalElements, Sourced } from '../data/types';
import { TAU, degToRad } from './angles';
import { DAYS_PER_JULIAN_CENTURY, DAYS_PER_JULIAN_YEAR, KM_PER_AU } from './constants';
import { orbitPositionKmAt, orbitStateAt } from './elements';
import { length } from './vec3';

// Made-up orbits that exercise the maths. Real elements are tested against JPL Horizons.
const v = (value: number): Sourced<number> => ({ value, sourceId: 'test' });
const EPOCH = 2_451_545;

const planetLike: OrbitalElements = {
  frame: { type: 'ecliptic-j2000' },
  epochJd: v(EPOCH),
  semiMajorAxisAu: v(2),
  eccentricity: v(0.1),
  inclinationDeg: v(5),
  longitudeOfAscendingNodeDeg: v(40),
  phase: { form: 'longitudes', longitudeOfPerihelionDeg: v(100), meanLongitudeDeg: v(130) },
  motion: {
    type: 'rates-per-century',
    semiMajorAxisAuPerCentury: v(0.01),
    eccentricityPerCentury: v(0.002),
    inclinationDegPerCentury: v(-0.5),
    meanLongitudeDegPerCentury: v(36_000),
    longitudeOfPerihelionDegPerCentury: v(1),
    longitudeOfAscendingNodeDegPerCentury: v(-2),
  },
  validity: null,
};

const moonLike: OrbitalElements = {
  frame: { type: 'ecliptic-j2000' },
  epochJd: v(EPOCH),
  semiMajorAxisKm: v(1000),
  eccentricity: v(0.05),
  inclinationDeg: v(5),
  longitudeOfAscendingNodeDeg: v(120),
  phase: { form: 'anomalies', argumentOfPeriapsisDeg: v(300), meanAnomalyDeg: v(10) },
  motion: {
    type: 'precessing-ellipse',
    siderealPeriodDays: v(20),
    apsidalPrecessionPeriodYears: v(6),
    nodalPrecessionPeriodYears: v(18),
  },
  validity: null,
};

describe('orbitStateAt, rates per century', () => {
  it('turns longitudes into argument of periapsis and mean anomaly at the epoch', () => {
    const state = orbitStateAt(planetLike, EPOCH);
    expect(state.semiMajorAxis).toBeCloseTo(2 * KM_PER_AU, 3);
    expect(state.eccentricity).toBe(0.1);
    expect(state.inclinationRad).toBeCloseTo(degToRad(5), 12);
    expect(state.longitudeOfAscendingNodeRad).toBeCloseTo(degToRad(40), 12);
    expect(state.argumentOfPeriapsisRad).toBeCloseTo(degToRad(60), 12);
    expect(state.meanAnomalyRad).toBeCloseTo(degToRad(30), 12);
  });

  it('applies every rate over one century', () => {
    const state = orbitStateAt(planetLike, EPOCH + DAYS_PER_JULIAN_CENTURY);
    expect(state.semiMajorAxis).toBeCloseTo(2.01 * KM_PER_AU, 3);
    expect(state.eccentricity).toBeCloseTo(0.102, 12);
    expect(state.inclinationRad).toBeCloseTo(degToRad(4.5), 12);
    expect(state.longitudeOfAscendingNodeRad).toBeCloseTo(degToRad(38), 10);
    // ϖ goes 100 → 101 while Ω goes 40 → 38, so ω = 63.
    expect(state.argumentOfPeriapsisRad).toBeCloseTo(degToRad(63), 10);
    // L goes 130 → 130 + 36000 (a whole number of turns) and ϖ → 101, so M = 29.
    expect(state.meanAnomalyRad).toBeCloseTo(degToRad(29), 9);
  });

  it('runs backwards before the epoch', () => {
    const state = orbitStateAt(planetLike, EPOCH - DAYS_PER_JULIAN_CENTURY);
    expect(state.longitudeOfAscendingNodeRad).toBeCloseTo(degToRad(42), 10);
    expect(state.eccentricity).toBeCloseTo(0.098, 12);
  });

  it('keeps every angle in [0, 2π)', () => {
    for (const days of [-40_000, -1, 0, 12_345, 90_000]) {
      const state = orbitStateAt(planetLike, EPOCH + days);
      for (const angle of [
        state.longitudeOfAscendingNodeRad,
        state.argumentOfPeriapsisRad,
        state.meanAnomalyRad,
      ]) {
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(TAU);
      }
    }
  });
});

describe('orbitStateAt, precessing ellipse', () => {
  it('reads the elements as given at the epoch', () => {
    const state = orbitStateAt(moonLike, EPOCH);
    expect(state.semiMajorAxis).toBe(1000);
    expect(state.argumentOfPeriapsisRad).toBeCloseTo(degToRad(300), 12);
    expect(state.meanAnomalyRad).toBeCloseTo(degToRad(10), 12);
  });

  it('moves the node backwards and the periapsis forwards', () => {
    const year = orbitStateAt(moonLike, EPOCH + DAYS_PER_JULIAN_YEAR);
    expect(year.longitudeOfAscendingNodeRad).toBeCloseTo(degToRad(120 - 360 / 18), 10);
    expect(year.argumentOfPeriapsisRad).toBeCloseTo(degToRad(300 + 360 / 6 - 360), 10);
  });

  it('brings the mean longitude round once per sidereal period', () => {
    const longitude = (jd: number): number => {
      const s = orbitStateAt(moonLike, jd);
      return s.longitudeOfAscendingNodeRad + s.argumentOfPeriapsisRad + s.meanAnomalyRad;
    };
    const turned = (longitude(EPOCH + 20) - longitude(EPOCH)) / TAU;
    expect(turned - Math.round(turned)).toBeCloseTo(0, 10);
  });

  it('keeps a fixed ellipse when no precession is given', () => {
    const fixed: OrbitalElements = {
      ...moonLike,
      motion: { type: 'precessing-ellipse', siderealPeriodDays: v(20) },
    };
    const start = orbitPositionKmAt(fixed, EPOCH);
    const later = orbitPositionKmAt(fixed, EPOCH + 20 * 7);
    expect(later.x).toBeCloseTo(start.x, 6);
    expect(later.y).toBeCloseTo(start.y, 6);
    expect(later.z).toBeCloseTo(start.z, 6);
  });
});

describe('orbitPositionKmAt', () => {
  it('stays between periapsis and apoapsis distance', () => {
    for (let day = 0; day < 40; day++) {
      const r = length(orbitPositionKmAt(moonLike, EPOCH + day));
      expect(r).toBeGreaterThanOrEqual(950 - 1e-6);
      expect(r).toBeLessThanOrEqual(1050 + 1e-6);
    }
  });

  it('gives kilometres for an orbit sized in AU', () => {
    const r = length(orbitPositionKmAt(planetLike, EPOCH));
    expect(r).toBeGreaterThan(1.8 * KM_PER_AU);
    expect(r).toBeLessThan(2.2 * KM_PER_AU);
  });
});
