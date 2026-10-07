import { KM_PER_AU } from './constants';
import { add, length, scale, type Vec3 } from './vec3';

/**
 * How far from a comet's path its dust is drawn spread, in AU. NASA says the dust a comet sheds
 * "gradually spreads into a dusty trail around their orbits" and that Earth passes through
 * Halley's twice a year, but gives no width. This is wide enough to take in Earth's path at
 * both of Halley's showers, where the comet's present orbit passes 0.07 and 0.15 AU from it.
 * A drawing choice, said as one on screen.
 */
export const DUST_TRAIL_RADIUS_AU = 0.17;
export const DUST_TRAIL_RADIUS_KM = DUST_TRAIL_RADIUS_AU * KM_PER_AU;
/** Dust is drawn only along the part of the path this near the Sun, in AU: where the planets are. */
export const DUST_TRAIL_WITHIN_AU = 3;

/** A stream of numbers from 0 up to 1 that is the same every time for the same seed. */
function stream(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    // Numerical Recipes' linear congruential generator.
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

/**
 * Specks strewn round a path: for each point of the path, `perPoint` specks at random within
 * `radius` of it, thicker towards the middle. The same specks every time, so the picture does
 * not flicker. Lengths in whatever unit the path is in.
 */
export function strewnAlong(
  path: readonly Vec3[],
  radius: number,
  perPoint: number,
  seed = 1,
): Vec3[] {
  const next = stream(seed);
  const specks: Vec3[] = [];
  for (const point of path) {
    for (let i = 0; i < perPoint; i++) {
      // A direction picked evenly over the sphere, and a distance that favours the middle.
      const z = 2 * next() - 1;
      const around = 2 * Math.PI * next();
      const flat = Math.sqrt(1 - z * z);
      const direction = { x: flat * Math.cos(around), y: flat * Math.sin(around), z };
      specks.push(add(point, scale(direction, radius * next() * next())));
    }
  }
  return specks;
}

/** How near a place comes to any point of a path. */
export function nearestOnPath(path: readonly Vec3[], place: Vec3): number {
  let nearest = Infinity;
  for (const point of path) {
    nearest = Math.min(
      nearest,
      length({ x: point.x - place.x, y: point.y - place.y, z: point.z - place.z }),
    );
  }
  return nearest;
}
