import type { RingBand, RingSystem } from '../data/types';
import { isKnown } from '../data/types';

/**
 * The share of light a ring stops when looked at straight through, from its optical depth τ:
 * 1 − e^(−τ). A ring with τ = 0 is empty space; a thick one approaches 1.
 */
export function opacityFromOpticalDepth(opticalDepth: number): number {
  if (!(opticalDepth >= 0)) throw new RangeError('Optical depth cannot be negative');
  return 1 - Math.exp(-opticalDepth);
}

/** Opacity across a ring system, sampled evenly from its inner to its outer radius. */
export interface RingProfile {
  readonly innerRadiusKm: number;
  readonly outerRadiusKm: number;
  /** One value in [0, 1] per sample; sample i is centred at inner + (i + ½)·(outer − inner)/n. */
  readonly opacity: Float32Array;
}

/** Opacity of one band, from the middle of the optical-depth range its source gives; 0 if unknown. */
function bandOpacity(band: RingBand): number {
  if (!isKnown(band.opticalDepth)) return 0;
  const [min, max] = band.opticalDepth.value;
  return opacityFromOpticalDepth((min + max) / 2);
}

/**
 * Builds the opacity profile the broad rings are drawn from: each band fills its real span and
 * gaps between bands stay empty. Narrow ringlets are not part of it; see `ringlets`.
 */
export function ringProfile(system: RingSystem, samples: number): RingProfile {
  if (!Number.isInteger(samples) || samples < 2) {
    throw new RangeError(`A ring profile needs at least 2 samples, got ${String(samples)}`);
  }
  const innerRadiusKm = system.shape.innerRadiusKm.value;
  const outerRadiusKm = system.shape.outerRadiusKm.value;
  const step = (outerRadiusKm - innerRadiusKm) / samples;
  const opacity = new Float32Array(samples);

  for (const band of system.bands) {
    if (band.type !== 'band') continue;
    const value = bandOpacity(band);
    for (let i = 0; i < samples; i++) {
      const radius = innerRadiusKm + (i + 0.5) * step;
      if (radius >= band.innerRadiusKm.value && radius < band.outerRadiusKm.value) {
        opacity[i] = Math.max(opacity[i] ?? 0, value);
      }
    }
  }
  return { innerRadiusKm, outerRadiusKm, opacity };
}

/** A ring too narrow to draw with a width: a line at its real radius. */
export interface Ringlet {
  readonly name: string;
  readonly radiusKm: number;
  readonly opacity: number;
}

/** The narrow rings of a system, for drawing as lines. */
export function ringlets(system: RingSystem): Ringlet[] {
  return system.bands.flatMap((band) =>
    band.type === 'ringlet'
      ? [{ name: band.name, radiusKm: band.radiusKm.value, opacity: bandOpacity(band) }]
      : [],
  );
}
