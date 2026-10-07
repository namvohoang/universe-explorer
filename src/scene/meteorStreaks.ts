import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** How many shooting stars are in the air or waiting their turn. */
const STREAKS = 44;
/** How far from the spot they fly out of a streak starts, and how long it is, in degrees. */
const START_DEG: readonly [number, number] = [4, 36];
const LENGTH_DEG: readonly [number, number] = [7, 18];
/** How long a streak lasts and how long before the next in its place, in seconds. */
const LIFE_SECONDS = 0.7;
const WAIT_SECONDS: readonly [number, number] = [0.2, 2.4];
/** The colour of a streak's bright head; its tail fades to nothing. */
const HEAD: readonly [number, number, number] = [1, 0.97, 0.85];
const DEG = Math.PI / 180;

/**
 * Shooting stars as they are seen from a world passing through a comet's dust: short streaks
 * that all fly straight out from one spot in the sky. Where and when each one appears is a
 * drawing; the spot they fly out of is worked out from the real paths. Put `group` at the
 * world they are seen from.
 */
export interface MeteorStreaks {
  readonly group: Group;
  /** The unit direction of the spot the streaks fly out of, in scene axes; `null` for none. */
  setRadiant(towards: Vec3 | null): void;
  /** Lets the streaks fly on for so many seconds. */
  flow(seconds: number): void;
  dispose(): void;
}

/** The same "random" numbers every time, so the sky is the same on every device. */
function mulberry(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMeteorStreaks(far: number): MeteorStreaks {
  const random = mulberry(1986);
  const between = ([low, high]: readonly [number, number]): number => low + (high - low) * random();
  const positions = new BufferAttribute(new Float32Array(STREAKS * 2 * 3), 3);
  const colors = new BufferAttribute(new Float32Array(STREAKS * 2 * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setAttribute('color', colors);
  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const lines = new LineSegments(geometry, material);
  lines.frustumCulled = false;
  const group = new Group();
  group.add(lines);
  group.visible = false;

  // Each streak: which way round the spot it flies, where it starts, how long it is, and how
  // old it is in seconds (below zero while it waits its turn). A few are in flight at the start.
  const streaks = Array.from({ length: STREAKS }, (_, index) => ({
    around: random() * Math.PI * 2,
    startDeg: between(START_DEG),
    lengthDeg: between(LENGTH_DEG),
    age: index % 3 === 0 ? LIFE_SECONDS * (0.35 + 0.4 * random()) : -between(WAIT_SECONDS),
  }));
  let flying = false;
  const middle = new Vector3(0, 1, 0);
  const across = new Vector3(1, 0, 0);
  const upward = new Vector3(0, 0, 1);
  const point = new Vector3();
  /** A place on the sky so many degrees from the spot, a given way round it. */
  const place = (index: number, fromSpotDeg: number, around: number): void => {
    const angle = fromSpotDeg * DEG;
    point
      .copy(middle)
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(across, Math.sin(angle) * Math.cos(around))
      .addScaledVector(upward, Math.sin(angle) * Math.sin(around))
      .multiplyScalar(far);
    positions.setXYZ(index, point.x, point.y, point.z);
  };
  const draw = (): void => {
    for (const [index, streak] of streaks.entries()) {
      const through = streak.age / LIFE_SECONDS;
      const flying = through >= 0 && through <= 1;
      // The head runs out from the spot; the tail follows and is gone by the end.
      const head = streak.startDeg + streak.lengthDeg * Math.min(1, Math.max(0, through) * 1.4);
      const tail = streak.startDeg + streak.lengthDeg * Math.max(0, through * 1.4 - 0.4);
      place(index * 2, tail, streak.around);
      place(index * 2 + 1, head, streak.around);
      const bright = flying ? Math.sin(Math.PI * Math.min(1, through)) ** 0.6 : 0;
      colors.setXYZ(index * 2, 0, 0, 0);
      colors.setXYZ(index * 2 + 1, HEAD[0] * bright, HEAD[1] * bright, HEAD[2] * bright);
    }
    positions.needsUpdate = true;
    colors.needsUpdate = true;
  };

  return {
    group,
    setRadiant(towards) {
      flying = towards !== null;
      group.visible = flying;
      if (!towards) return;
      middle.set(towards.x, towards.y, towards.z).normalize();
      // Any two directions square to the spot and to each other.
      across.set(0, 1, 0);
      if (Math.abs(middle.y) > 0.9) across.set(1, 0, 0);
      across.cross(middle).normalize();
      upward.crossVectors(middle, across);
      draw();
    },
    flow(seconds) {
      // Whether the streaks are on show at this instant is not asked: a look that leaves them
      // out for one picture must not stop them.
      if (!flying) return;
      for (const streak of streaks) {
        streak.age += seconds;
        if (streak.age > LIFE_SECONDS) {
          streak.age = -between(WAIT_SECONDS);
          streak.around = random() * Math.PI * 2;
          streak.startDeg = between(START_DEG);
          streak.lengthDeg = between(LENGTH_DEG);
        }
      }
      draw();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
