import type { OrbitalElements } from '../data/types';
import { TAU, degToRad, wrapTau } from './angles';
import {
  DAYS_PER_JULIAN_CENTURY,
  DAYS_PER_JULIAN_YEAR,
  KM_PER_AU,
  SPEED_OF_LIGHT_KM_PER_S,
} from './constants';
import { positionFromState, type OrbitState } from './kepler';
import type { Vec3 } from './vec3';

/** Radians per day for something that turns once in `periodYears`; 0 when no period is given. */
function ratePerDay(periodYears: number | undefined): number {
  return periodYears === undefined ? 0 : TAU / (periodYears * DAYS_PER_JULIAN_YEAR);
}

/**
 * The catalogue's elements evaluated at a Julian date, as a plain ellipse in kilometres and
 * radians. Angles stay in the frame the elements are given in (`orbit.frame`).
 */
export function orbitStateAt(orbit: OrbitalElements, jd: number): OrbitState {
  const days = jd - orbit.epochJd.value;
  const aAtEpochKm =
    'semiMajorAxisAu' in orbit
      ? orbit.semiMajorAxisAu.value * KM_PER_AU
      : orbit.semiMajorAxisKm.value;
  const nodeAtEpoch = degToRad(orbit.longitudeOfAscendingNodeDeg.value);

  // Sources give either (longitude of perihelion, mean longitude) or (argument of periapsis,
  // mean anomaly). With ϖ = Ω + ω and L = ϖ + M they say the same thing.
  const periAtEpoch =
    orbit.phase.form === 'longitudes'
      ? degToRad(orbit.phase.longitudeOfPerihelionDeg.value) - nodeAtEpoch
      : degToRad(orbit.phase.argumentOfPeriapsisDeg.value);
  const anomalyAtEpoch =
    orbit.phase.form === 'longitudes'
      ? degToRad(orbit.phase.meanLongitudeDeg.value - orbit.phase.longitudeOfPerihelionDeg.value)
      : degToRad(orbit.phase.meanAnomalyDeg.value);

  const { motion } = orbit;
  switch (motion.type) {
    case 'rates-per-century': {
      // JPL: each element is a₀ + ȧ·T, with T in Julian centuries; then ω = ϖ − Ω, M = L − ϖ.
      const t = days / DAYS_PER_JULIAN_CENTURY;
      const nodeRate = degToRad(motion.longitudeOfAscendingNodeDegPerCentury.value);
      const periLongitudeRate = degToRad(motion.longitudeOfPerihelionDegPerCentury.value);
      const meanLongitudeRate = degToRad(motion.meanLongitudeDegPerCentury.value);
      return {
        semiMajorAxis: aAtEpochKm + motion.semiMajorAxisAuPerCentury.value * KM_PER_AU * t,
        eccentricity: orbit.eccentricity.value + motion.eccentricityPerCentury.value * t,
        inclinationRad: degToRad(
          orbit.inclinationDeg.value + motion.inclinationDegPerCentury.value * t,
        ),
        longitudeOfAscendingNodeRad: wrapTau(nodeAtEpoch + nodeRate * t),
        argumentOfPeriapsisRad: wrapTau(periAtEpoch + (periLongitudeRate - nodeRate) * t),
        meanAnomalyRad: wrapTau(anomalyAtEpoch + (meanLongitudeRate - periLongitudeRate) * t),
      };
    }
    case 'precessing-ellipse': {
      // The source gives precession periods without a direction. For an orbit going the same
      // way as its parent spins, the node moves backwards and the periapsis forwards; PLAN.md
      // task 1.6 checks this against JPL Horizons for every body that uses it.
      const nodeRate = -ratePerDay(motion.nodalPrecessionPeriodYears?.value);
      const periRate = ratePerDay(motion.apsidalPrecessionPeriodYears?.value);
      // One sidereal period carries the mean longitude Ω + ω + M once round.
      const anomalyRate = TAU / motion.siderealPeriodDays.value - periRate - nodeRate;
      return {
        semiMajorAxis: aAtEpochKm,
        eccentricity: orbit.eccentricity.value,
        inclinationRad: degToRad(orbit.inclinationDeg.value),
        longitudeOfAscendingNodeRad: wrapTau(nodeAtEpoch + nodeRate * days),
        argumentOfPeriapsisRad: wrapTau(periAtEpoch + periRate * days),
        meanAnomalyRad: wrapTau(anomalyAtEpoch + anomalyRate * days),
      };
    }
    default:
      return motion satisfies never;
  }
}

/** Position relative to the parent, in km, in the frame of the elements. */
export function orbitPositionKmAt(orbit: OrbitalElements, jd: number): Vec3 {
  return positionFromState(orbitStateAt(orbit, jd));
}

/** How long one trip around the parent takes, in days, from the elements' own rate. */
export function orbitalPeriodDays(orbit: OrbitalElements): number {
  const { motion } = orbit;
  switch (motion.type) {
    case 'rates-per-century':
      // The mean longitude advances by this many degrees per century; one trip is 360.
      return (360 / motion.meanLongitudeDegPerCentury.value) * DAYS_PER_JULIAN_CENTURY;
    case 'precessing-ellipse':
      return motion.siderealPeriodDays.value;
    default:
      return motion satisfies never;
  }
}

/** The orbit's semi-major axis in km, whichever unit the source gave it in. */
export function semiMajorAxisKm(orbit: OrbitalElements): number {
  return 'semiMajorAxisAu' in orbit
    ? orbit.semiMajorAxisAu.value * KM_PER_AU
    : orbit.semiMajorAxisKm.value;
}

/** Seconds light takes to cross a distance. */
export function lightTravelSeconds(distanceKm: number): number {
  return distanceKm / SPEED_OF_LIGHT_KM_PER_S;
}
