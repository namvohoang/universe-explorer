import { TAU, wrapTau } from './angles';
import type { Vec3 } from './vec3';

/**
 * How closely Kepler's equation must be satisfied, in radians. JPL calls 1e-6 degrees
 * (about 1.7e-8 rad) sufficient for its approximate elements; this is far tighter and still
 * converges in a handful of steps (ssd.jpl.nasa.gov/planets/approx_pos.html).
 */
export const KEPLER_TOLERANCE_RAD = 1e-12;

/** Newton's method converges in well under this many steps for any bound orbit. */
const MAX_ITERATIONS = 50;

/** An orbit frozen at one instant: a plain ellipse and where the body is on it. Angles in radians. */
export interface OrbitState {
  /** In any length unit; positions come out in the same unit. */
  readonly semiMajorAxis: number;
  readonly eccentricity: number;
  readonly inclinationRad: number;
  readonly longitudeOfAscendingNodeRad: number;
  readonly argumentOfPeriapsisRad: number;
  readonly meanAnomalyRad: number;
}

/**
 * Solves Kepler's equation M = E − e·sin E for the eccentric anomaly E, for a bound orbit
 * (0 ≤ e < 1). Uses Newton's method from JPL's starting guess E₀ = M + e·sin M.
 */
export function solveKepler(meanAnomalyRad: number, eccentricity: number): number {
  if (!(eccentricity >= 0 && eccentricity < 1)) {
    throw new RangeError(`Eccentricity must be in [0, 1), got ${String(eccentricity)}`);
  }
  // Work in [−π, π], where the starting guess is best.
  const m = wrapTau(meanAnomalyRad + Math.PI) - Math.PI;
  let e = m + eccentricity * Math.sin(m);
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const deltaM = m - (e - eccentricity * Math.sin(e));
    const deltaE = deltaM / (1 - eccentricity * Math.cos(e));
    e += deltaE;
    if (Math.abs(deltaE) <= KEPLER_TOLERANCE_RAD) return e;
  }
  throw new Error(
    `Kepler's equation did not converge for M=${String(m)}, e=${String(eccentricity)}`,
  );
}

/** Angle from periapsis to the body, seen from the focus, in [0, 2π). */
export function trueAnomaly(eccentricAnomalyRad: number, eccentricity: number): number {
  const y = Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomalyRad);
  const x = Math.cos(eccentricAnomalyRad) - eccentricity;
  return wrapTau(Math.atan2(y, x));
}

/**
 * Position in the orbit's own plane, x pointing from the focus to periapsis.
 * Takes the eccentric anomaly so a whole path can be drawn by stepping it.
 */
export function positionInOrbitPlane(
  semiMajorAxis: number,
  eccentricity: number,
  eccentricAnomalyRad: number,
): Vec3 {
  return {
    x: semiMajorAxis * (Math.cos(eccentricAnomalyRad) - eccentricity),
    y: semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomalyRad),
    z: 0,
  };
}

/**
 * Rotates a point from the orbit plane into the frame the elements are given in:
 * Rz(−Ω)·Rx(−I)·Rz(−ω), written out as on JPL's page.
 */
export function orbitPlaneToFrame(point: Vec3, state: OrbitState): Vec3 {
  const cosW = Math.cos(state.argumentOfPeriapsisRad);
  const sinW = Math.sin(state.argumentOfPeriapsisRad);
  const cosO = Math.cos(state.longitudeOfAscendingNodeRad);
  const sinO = Math.sin(state.longitudeOfAscendingNodeRad);
  const cosI = Math.cos(state.inclinationRad);
  const sinI = Math.sin(state.inclinationRad);
  return {
    x: (cosW * cosO - sinW * sinO * cosI) * point.x + (-sinW * cosO - cosW * sinO * cosI) * point.y,
    y: (cosW * sinO + sinW * cosO * cosI) * point.x + (-sinW * sinO + cosW * cosO * cosI) * point.y,
    z: sinW * sinI * point.x + cosW * sinI * point.y,
  };
}

/** Where the body is, in the frame of its elements and the unit of its semi-major axis. */
export function positionFromState(state: OrbitState): Vec3 {
  const e = solveKepler(state.meanAnomalyRad, state.eccentricity);
  return orbitPlaneToFrame(positionInOrbitPlane(state.semiMajorAxis, state.eccentricity, e), state);
}

/**
 * The whole ellipse as a closed loop of points, for drawing the path the body moves along.
 * Steps the eccentric anomaly, so points are evenly spread around the ellipse.
 */
export function orbitPath(state: OrbitState, segments: number): Vec3[] {
  if (!Number.isInteger(segments) || segments < 3) {
    throw new RangeError(`An orbit path needs at least 3 segments, got ${String(segments)}`);
  }
  return Array.from({ length: segments + 1 }, (_, i) => {
    const e = (i / segments) * TAU;
    return orbitPlaneToFrame(
      positionInOrbitPlane(state.semiMajorAxis, state.eccentricity, e),
      state,
    );
  });
}
