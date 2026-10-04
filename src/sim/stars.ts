import type { ClusterStar } from '../data/types';
import { degToRad } from './angles';
import type { Vec3 } from './vec3';

/** A parallax of one arcsecond puts a star one parsec away; Gaia gives milliarcseconds. */
const MAS_PARSECS = 1000;

/**
 * Where a star is in space from where it is on the sky and its parallax: a position in
 * parsecs from the Sun, in the ICRS frame (x towards right ascension 0, z towards the north).
 */
export function starPositionPc(raDeg: number, decDeg: number, parallaxMas: number): Vec3 {
  if (!(parallaxMas > 0)) throw new RangeError('A star needs a positive parallax to be placed');
  const distance = MAS_PARSECS / parallaxMas;
  const ra = degToRad(raDeg);
  const dec = degToRad(decDeg);
  return {
    x: distance * Math.cos(dec) * Math.cos(ra),
    y: distance * Math.cos(dec) * Math.sin(ra),
    z: distance * Math.sin(dec),
  };
}

/** A cluster's stars as offsets from their common middle, in parsecs, with how far the farthest is. */
export function clusterLayout(stars: readonly ClusterStar[]): {
  offsets: Vec3[];
  radiusPc: number;
} {
  if (stars.length === 0) return { offsets: [], radiusPc: 0 };
  const positions = stars.map(([ra, dec, parallax]) => starPositionPc(ra, dec, parallax));
  const middle = positions.reduce(
    (sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y, z: sum.z + p.z }),
    { x: 0, y: 0, z: 0 },
  );
  const n = positions.length;
  const offsets = positions.map((p) => ({
    x: p.x - middle.x / n,
    y: p.y - middle.y / n,
    z: p.z - middle.z / n,
  }));
  return { offsets, radiusPc: Math.max(...offsets.map((o) => Math.hypot(o.x, o.y, o.z))) };
}

/** An RGB colour with each part from 0 to 1. */
export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Roughly the colour a glowing body of a temperature looks: red when cool, white near the
 * Sun's temperature, blue-white when very hot. A drawing aid (a well-known fit to the colour
 * of a black body), not a measurement of any star.
 */
export function colorFromTemperature(kelvin: number): Rgb {
  const t = Math.min(40_000, Math.max(1000, kelvin)) / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return { r: clamp01(r / 255), g: clamp01(g / 255), b: clamp01(b / 255) };
}

/**
 * A star's temperature guessed from its Gaia colour (BP−RP), for tinting its dot: bluer
 * stars are hotter. A smooth made-up curve through typical values, used only for drawing.
 */
export function temperatureFromBpRp(bpRp: number): number {
  return 4600 * (1 / (0.92 * bpRp + 1.7) + 1 / (0.92 * bpRp + 0.62));
}
