import type { Group } from 'three';

/**
 * What kind of 3D model this is, which decides the plain words the card uses to say how it
 * was made. None of these is a photo.
 * - `picture-cloud`: points coloured from the real picture; how deep the cloud is, is a guess.
 * - `simulation`: a computer model of what the thing is thought to look like.
 * - `cluster`: every star placed from its measured position and distance.
 * - `star-sizes`: stars at their true sizes next to each other, lined up to compare.
 * - `constellation`: stars of a pattern placed from their measured positions and distances.
 * - `planet-system`: a star and its planets' orbits to scale, with the planets enlarged.
 */
export type DeepModelNote =
  'picture-cloud' | 'simulation' | 'cluster' | 'star-sizes' | 'constellation' | 'planet-system';

/** A 3D model shown in place of the solar system when a deep-space object is picked. */
export interface DeepModel {
  readonly group: Group;
  /** How far the model reaches from its centre, in scene units, for framing the camera. */
  readonly radius: number;
  readonly note: DeepModelNote;
  /** The side to look at it from first: a direction from its centre towards the camera. */
  readonly viewFrom: { readonly x: number; readonly y: number; readonly z: number };
  /**
   * How far away to start, for a model that must first be seen from one exact spot. Left out,
   * the camera stands back far enough to fit `radius`.
   */
  readonly viewDistance?: number;
  /**
   * Advances any motion; `dt` is real seconds since the last frame. `camera` is where the
   * viewer is, for parts that must face them.
   */
  update(dt: number, camera: { x: number; y: number; z: number }): void;
  /**
   * For a model best seen through a zoom lens from one spot: how wide the camera should see
   * (degrees, top to bottom) with the viewer where they are, given the usual width. Left out,
   * the usual width is kept.
   */
  fieldOfViewDeg?(camera: { x: number; y: number; z: number }, usualDeg: number): number;
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
