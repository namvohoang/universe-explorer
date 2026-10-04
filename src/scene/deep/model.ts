import type { Group } from 'three';

/**
 * How a 3D model of something beyond the solar system was made. The card says this in plain
 * words, because none of these is a photo.
 * - `picture-cloud`: points coloured from the real picture; how deep the cloud is, is a guess.
 * - `simulation`: a computer model of what the thing is thought to look like.
 * - `measured`: built from positions or sizes that were measured.
 */
export type DeepModelBasis = 'picture-cloud' | 'simulation' | 'measured';

/** A 3D model shown in place of the solar system when a deep-space object is picked. */
export interface DeepModel {
  readonly group: Group;
  /** How far the model reaches from its centre, in scene units, for framing the camera. */
  readonly radius: number;
  readonly basis: DeepModelBasis;
  /** The side to look at it from first: a direction from its centre towards the camera. */
  readonly viewFrom: { readonly x: number; readonly y: number; readonly z: number };
  /**
   * Advances any motion; `dt` is real seconds since the last frame. `camera` is where the
   * viewer is, for parts that must face them.
   */
  update(dt: number, camera: { x: number; y: number; z: number }): void;
  dispose(): void;
}

/** A small repeatable random source, so a model looks the same every time it is built. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** A roughly bell-shaped random number centred on 0, mostly within ±1. */
export function bell(random: () => number): number {
  return (random() + random() + random() + random() - 2) / 2;
}
