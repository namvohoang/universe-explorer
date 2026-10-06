import type { ClusterStar, FigureStar } from '../data/types';
import { degToRad } from './angles';
import { LIGHT_YEARS_PER_PARSEC } from './constants';
import { add, dot, length, normalize, scale, subtract, type Vec3 } from './vec3';

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

/**
 * A star's temperature guessed from its B−V colour, for tinting its dot. The same curve as
 * for the Gaia colour: both say how much bluer or redder a star is, on nearly the same scale.
 */
export const temperatureFromBV = temperatureFromBpRp;

/** How many times the middle of a pattern on the sky is nudged towards its farthest star. */
const SKY_MIDDLE_STEPS = 200;

/**
 * The middle of some directions: the direction whose widest angle to any of them is smallest
 * (the axis of the narrowest cone that holds them all), found by stepping towards whichever
 * is farthest by ever smaller steps. Each direction is a unit vector.
 */
export function middleDirection(directions: readonly Vec3[]): Vec3 {
  let middle = directions[0];
  if (!middle) throw new RangeError('The middle of no directions is not defined');
  for (let step = 1; step <= SKY_MIDDLE_STEPS; step += 1) {
    const from = middle;
    const farthest = directions.reduce((a, b) => (dot(b, from) < dot(a, from) ? b : a));
    middle = normalize(add(from, scale(subtract(farthest, from), 1 / (step + 1))));
  }
  return middle;
}

/** A star pattern laid out in space around its middle, in parsecs. */
export interface FigureLayout {
  /** Each star, measured from the middle. */
  readonly offsets: Vec3[];
  /** Where the Sun is, measured from the same middle. From there the pattern looks as it does from Earth. */
  readonly sun: Vec3;
  /** How far the farthest star is from the middle. */
  readonly radiusPc: number;
  /** How far each star is from the Sun. */
  readonly distancesPc: number[];
}

/**
 * The middle is the middle of the pattern as seen from the Sun, at the stars' average
 * distance. So a view from the Sun towards it has the pattern in the centre, however much
 * farther one star is than the rest.
 */
export function figureLayout(stars: readonly FigureStar[]): FigureLayout {
  if (stars.length === 0)
    return { offsets: [], sun: { x: 0, y: 0, z: 0 }, radiusPc: 0, distancesPc: [] };
  const positions = stars.map(([, ra, dec, parallax]) => starPositionPc(ra, dec, parallax));
  const distancesPc = positions.map(length);
  const average = distancesPc.reduce((sum, d) => sum + d, 0) / distancesPc.length;
  const middle = scale(middleDirection(positions.map(normalize)), average);
  const offsets = positions.map((p) => subtract(p, middle));
  return {
    offsets,
    sun: scale(middle, -1),
    radiusPc: Math.max(...offsets.map(length)),
    distancesPc,
  };
}

/** The nearest and the farthest star of a pattern, with how far each is in light-years. */
export function figureDepth(stars: readonly FigureStar[]): {
  nearest: { name: string; lightYears: number };
  farthest: { name: string; lightYears: number };
} | null {
  const { distancesPc } = figureLayout(stars);
  const ranked = stars
    .map(([name], n) => ({ name, lightYears: (distancesPc[n] ?? 0) * LIGHT_YEARS_PER_PARSEC }))
    .sort((a, b) => a.lightYears - b.lightYears);
  const nearest = ranked[0];
  const farthest = ranked.at(-1);
  return nearest && farthest ? { nearest, farthest } : null;
}
