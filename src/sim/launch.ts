import type { CelestialObject, PathSample, StagedPath } from '../data/types';
import { isKnown } from '../data/types';
import { northPoleEcliptic, poleOf } from './frames';
import {
  drawnThrough,
  groundVelocityKmPerS,
  noseDirection,
  pathPositionKm,
  pathVelocityKmPerS,
} from './trajectory';
import { SECONDS_PER_DAY } from './constants';
import { add, normalize, scale, type Vec3 } from './vec3';

/** How a body turns: the pole it turns anticlockwise about (ecliptic frame) and how long a turn takes. */
export interface Turning {
  readonly north: Vec3;
  readonly turnHours: number;
}

/** A body's turning from the catalogue, or `null` when its pole or its day is not known. */
export function turningOf(body: CelestialObject | undefined): Turning | null {
  const shape = body?.shape;
  if (shape?.type !== 'spheroid' && shape?.type !== 'triaxial') return null;
  const { orientation } = shape;
  const pole = poleOf(orientation);
  const hours = orientation.rotationPeriodHours;
  if (!pole || !isKnown(hours) || orientation.rotation === 'synchronous') return null;
  const north = northPoleEcliptic(pole);
  return orientation.rotation === 'retrograde'
    ? { north: { x: -north.x, y: -north.y, z: -north.z }, turnHours: hours.value }
    : { north, turnHours: hours.value };
}

const STILL: Vec3 = { x: 0, y: 0, z: 0 };

/** How fast the ground under a place moves, in km/s; nothing when the body's turning is not known. */
function groundAt(placeKm: Vec3, turning: Turning | null): Vec3 {
  return turning ? groundVelocityKmPerS(placeKm, turning.north, turning.turnHours) : STILL;
}

/**
 * The curve drawn through the known places of a staged path. A craft that stands on the
 * ground at the first of them leaves it from rest: that place is given the ground's own speed.
 */
export function stagedSamples(
  path: StagedPath,
  fromGround: boolean,
  turning: Turning | null,
): PathSample[] {
  const points = path.points.value;
  const first = points[0];
  if (!fromGround || !first || !turning) return drawnThrough(points);
  return drawnThrough(points, groundAt({ x: first[1], y: first[2], z: first[3] }, turning));
}

/**
 * Once a craft that stood upright starts to lean, it is drawn coming round to the way it
 * moves over this many seconds, not snapping to it. A drawing choice.
 */
const LEAN_IN_SECONDS = 20;

/**
 * Which way a craft's nose is drawn pointing at a date on its path round a turning body: the
 * way it moves over the ground, and straight up while it stands on it. A craft that climbs
 * straight up at first is held upright until `uprightUntilJd`, then eased round. A unit
 * vector in the ecliptic frame.
 */
export function noseAlong(
  samples: readonly PathSample[],
  turning: Turning | null,
  jd: number,
  uprightUntilJd?: number,
): Vec3 {
  const place = pathPositionKm(samples, jd);
  const heading = noseDirection(place, pathVelocityKmPerS(samples, jd), groundAt(place, turning));
  if (uprightUntilJd === undefined) return heading;
  const up = normalize(place);
  const through = ((jd - uprightUntilJd) * SECONDS_PER_DAY) / LEAN_IN_SECONDS;
  if (through <= 0) return up;
  if (through >= 1) return heading;
  const eased = through * through * (3 - 2 * through);
  return normalize(add(scale(up, 1 - eased), scale(heading, eased)));
}

/** Which flame, if any, a craft's engines make at a date. */
export function flameAt<Flame>(
  burns: readonly {
    readonly fromJd: { readonly value: number };
    readonly untilJd: { readonly value: number };
    readonly flame: Flame;
  }[],
  jd: number,
): Flame | null {
  return burns.find((burn) => burn.fromJd.value <= jd && jd < burn.untilJd.value)?.flame ?? null;
}

/**
 * How much of the day sky's blue is left at a height: all of it on the ground, and less by
 * the same share for every `scaleHeightKm` climbed, as the air itself thins. Nothing at night.
 */
export function skyShare(altitudeKm: number, scaleHeightKm: number, sunIsUp: boolean): number {
  if (!sunIsUp || !(scaleHeightKm > 0)) return 0;
  return Math.exp(-Math.max(0, altitudeKm) / scaleHeightKm);
}

/**
 * How much of a craft, from its tail, it has let go of by a date: the largest share among
 * the parts shed at or before then, and 0 while it is whole.
 */
export function shedShareAt(
  sheds: readonly {
    readonly atJd: { readonly value: number };
    readonly belowShare: { readonly value: number };
  }[],
  jd: number,
): number {
  return Math.max(
    0,
    ...sheds.filter((shed) => shed.atJd.value <= jd).map((shed) => shed.belowShare.value),
  );
}

/**
 * A part just let go is drawn dropping behind the craft faster and faster, as the craft pulls
 * away under its next engines: this many km/s gained every second. A drawing choice.
 */
const DROP_BEHIND_KM_PER_S2 = 0.008;
/** It is drawn for this many seconds after it is let go; by then it is far out of the close look. */
const DROP_SHOWN_SECONDS = 25;

/**
 * The part a craft has just let go of, if it is still near: the stretch of the craft's
 * length it was (shares from tail to nose), and how far behind the craft it has dropped.
 */
export function droppedPartAt(
  sheds: readonly {
    readonly atJd: { readonly value: number };
    readonly belowShare: { readonly value: number };
    readonly stays?: true;
  }[],
  jd: number,
): { readonly fromShare: number; readonly toShare: number; readonly behindKm: number } | null {
  for (const [index, shed] of sheds.entries()) {
    const seconds = (jd - shed.atJd.value) * SECONDS_PER_DAY;
    if (shed.stays === true || seconds < 0 || seconds > DROP_SHOWN_SECONDS) continue;
    return {
      fromShare: sheds[index - 1]?.belowShare.value ?? 0,
      toShare: shed.belowShare.value,
      behindKm: (DROP_BEHIND_KM_PER_S2 * seconds * seconds) / 2,
    };
  }
  return null;
}

/**
 * The eye takes this many seconds to come round to what is left of a craft once a part has
 * been let go, so the look glides to it and does not jump. A drawing choice.
 */
const LOOK_SETTLES_SECONDS = 10;

/**
 * `shedShareAt`, but changing smoothly: for a few seconds after a part is let go it runs
 * from the share before to the share after. The middle of the look is worked out from it.
 */
export function settlingShedShareAt(
  sheds: readonly {
    readonly atJd: { readonly value: number };
    readonly belowShare: { readonly value: number };
  }[],
  jd: number,
): number {
  let share = 0;
  for (const shed of sheds) {
    const through = ((jd - shed.atJd.value) * SECONDS_PER_DAY) / LOOK_SETTLES_SECONDS;
    if (through <= 0) break;
    const eased = through >= 1 ? 1 : through * through * (3 - 2 * through);
    share += (shed.belowShare.value - share) * eased;
  }
  return share;
}

/**
 * The part a craft has left standing on the ground, once it has: the stretch of the craft's
 * height it was (shares from tail to nose) and the instant it was left there.
 */
export function standingPartAt(
  sheds: readonly {
    readonly atJd: { readonly value: number };
    readonly belowShare: { readonly value: number };
    readonly stays?: true;
  }[],
  jd: number,
): { readonly fromShare: number; readonly toShare: number; readonly atJd: number } | null {
  for (const [index, shed] of sheds.entries()) {
    if (shed.stays !== true || jd < shed.atJd.value) continue;
    return {
      fromShare: sheds[index - 1]?.belowShare.value ?? 0,
      toShare: shed.belowShare.value,
      atJd: shed.atJd.value,
    };
  }
  return null;
}

/** A look at dim ground is brightened at most this many times. */
const MOST_EXPOSURE = 3.5;

/**
 * How many times brighter a look from beside a craft on a world with no air is drawn, so
 * that ground lit by a low star can be made out, as a camera standing there would be opened
 * up for it: ground is lit in proportion to the sine of the star's height over it, and the
 * picture is brightened by as much back, up to a limit. `starHeightSine` is that sine.
 */
export function groundExposure(starHeightSine: number): number {
  return 1 / Math.max(starHeightSine, 1 / MOST_EXPOSURE);
}

/**
 * Two craft that have just parted, or are about to join, are drawn drawing apart or closing
 * at this many km a second, and never further apart than the second number while their paths
 * are still at one place. Drawing choices: how far apart they really flew is not known here.
 */
const PARTING_KM_PER_S = 0.00005;
const WIDEST_GAP_KM = 0.03;

/**
 * How wide a gap a craft is drawn standing off from the one it flies joined to, in km:
 * nothing while they are joined, opening steadily after they part and closing steadily
 * before they join again.
 */
export function joinedGapKm(apartFromJd: number, togetherAtJd: number, jd: number): number {
  const seconds = Math.min(jd - apartFromJd, togetherAtJd - jd) * SECONDS_PER_DAY;
  return Math.min(WIDEST_GAP_KM, Math.max(0, seconds) * PARTING_KM_PER_S);
}
