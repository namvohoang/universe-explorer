import type { BeltOrbit } from '../data/types';
import { KM_PER_AU } from './constants';
import { solveKepler } from './kepler';
import type { Scale } from './scale';

const DEG = Math.PI / 180;

/**
 * Where every member of a belt is at a date, as offsets from the belt's parent in scene units,
 * written into `out` as x, y, z triples (so nothing is allocated per frame). Each member moves
 * on its own real ellipse, scaled the same way a planet's orbit is.
 */
export function beltScenePositions(
  members: readonly BeltOrbit[],
  parentRadiusKm: number,
  jd: number,
  scale: Scale,
  out: Float32Array,
): Float32Array {
  if (out.length < members.length * 3) throw new RangeError('Output is too small for the belt');
  members.forEach(([aAu, e, iDeg, nodeDeg, periDeg, anomalyDeg, motionDegPerDay, epochJd], n) => {
    const big = solveKepler((anomalyDeg + motionDegPerDay * (jd - epochJd)) * DEG, e);
    // In the orbit's own plane, x towards perihelion.
    const px = aAu * (Math.cos(big) - e);
    const py = aAu * Math.sqrt(1 - e * e) * Math.sin(big);
    const cosW = Math.cos(periDeg * DEG);
    const sinW = Math.sin(periDeg * DEG);
    const cosO = Math.cos(nodeDeg * DEG);
    const sinO = Math.sin(nodeDeg * DEG);
    const cosI = Math.cos(iDeg * DEG);
    const sinI = Math.sin(iDeg * DEG);
    // Into the ecliptic (the same rotation kepler.ts uses), still in AU.
    const x = (cosW * cosO - sinW * sinO * cosI) * px + (-sinW * cosO - cosW * sinO * cosI) * py;
    const y = (cosW * sinO + sinW * cosO * cosI) * px + (-sinW * sinO + cosW * cosO * cosI) * py;
    const z = sinW * sinI * px + cosW * sinI * py;
    // Scene axes put the ecliptic's north up: (x, z, −y).
    const unitsPerAu = scale.orbitFactor(aAu * KM_PER_AU, parentRadiusKm) * KM_PER_AU;
    out[n * 3] = x * unitsPerAu;
    out[n * 3 + 1] = z * unitsPerAu;
    out[n * 3 + 2] = -y * unitsPerAu;
  });
  return out;
}

/** The scene radius of a circle around the parent at a real distance, e.g. a belt's outer edge. */
export function sceneDistance(distanceAu: number, parentRadiusKm: number, scale: Scale): number {
  const km = distanceAu * KM_PER_AU;
  return km * scale.orbitFactor(km, parentRadiusKm);
}
