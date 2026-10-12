import type { QuakeArrival } from '../data/types';
import { bodyFramePoint } from './groundPath';
import type { Vec3 } from './vec3';

const DEG = Math.PI / 180;

/**
 * The place reached by going `distanceDeg` round a world from a place on it, setting off in
 * the direction `azimuthDeg` east of north: a unit vector in the world's frame.
 */
export function placeAlong(
  lonDegEast: number,
  latDegNorth: number,
  distanceDeg: number,
  azimuthDeg: number,
): Vec3 {
  const lat = latDegNorth * DEG;
  const far = distanceDeg * DEG;
  const way = azimuthDeg * DEG;
  const sineLat = Math.sin(lat) * Math.cos(far) + Math.cos(lat) * Math.sin(far) * Math.cos(way);
  const toLat = Math.asin(Math.min(1, Math.max(-1, sineLat)));
  const toLon =
    lonDegEast * DEG +
    Math.atan2(
      Math.sin(way) * Math.sin(far) * Math.cos(lat),
      Math.cos(far) - Math.sin(lat) * sineLat,
    );
  return bodyFramePoint({ lonDegEast: toLon / DEG, latDeg: toLat / DEG, altitudeKm: 0 }, 1);
}

/** Whether a picked wave came straight through the rock, not round or through the core. */
export function cameStraight(arrival: QuakeArrival): boolean {
  return arrival[3] === 'P';
}

/** How far an earthquake's first wave has got round its world, from when stations felt it. */
export interface WaveFront {
  /** The farthest station the wave reached straight through the rock, in degrees round the world. */
  readonly farthestDeg: number;
  /**
   * How far round the world the wave has got so many seconds after the earthquake began, in
   * degrees: `null` before the nearest station felt it, and once it has passed the farthest
   * station it reached straight, beyond which the record does not follow it.
   */
  reachDeg(secondsAfter: number): number | null;
}

/**
 * The front of the wave that came straight through the rock, drawn through the instants the
 * stations felt it: at any instant it is as far out as the station that felt it then, and
 * between two stations it goes evenly from one to the other. A station that felt the wave a
 * little before one nearer in (the rock under each is not the same, and a pick is read off a
 * wiggly line) is taken to have felt it with that nearer one, so the front never goes back.
 */
export function waveFront(arrivals: readonly QuakeArrival[]): WaveFront {
  const straight = arrivals.filter(cameStraight).sort((a, b) => a[0] - b[0]);
  const steps: (readonly [distanceDeg: number, seconds: number])[] = [];
  let latest = -Infinity;
  for (const [distanceDeg, , seconds] of straight) {
    latest = Math.max(latest, seconds);
    steps.push([distanceDeg, latest]);
  }
  const first = steps[0];
  const last = steps[steps.length - 1];
  return {
    farthestDeg: last?.[0] ?? 0,
    reachDeg(secondsAfter) {
      if (!first || !last || secondsAfter < first[1] || secondsAfter > last[1]) return null;
      // The last station to have felt it by now, and the next one out.
      let at = 0;
      while (at + 1 < steps.length && (steps[at + 1]?.[1] ?? Infinity) <= secondsAfter) at++;
      const [fromDeg, fromSeconds] = steps[at] ?? first;
      const next = steps[at + 1];
      if (!next || !(next[1] > fromSeconds)) return fromDeg;
      return (
        fromDeg + ((next[0] - fromDeg) * (secondsAfter - fromSeconds)) / (next[1] - fromSeconds)
      );
    },
  };
}
