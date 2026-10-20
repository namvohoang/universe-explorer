import type { Scene } from 'three';
import type { Vec3 } from '../sim/vec3';
import { createTornadoSlice, type TornadoSlice, type TornadoPhase } from './tornadoSlice';

export type { TornadoSlice, TornadoPhase };
export { createTornadoSlice };

/** A tornado on its surveyed path, in a scene of its own, to be drawn beside the look at where it was. */
export interface TornadoScene {
  readonly scene: Scene;
  /**
   * Where to look, and from how far and which way: at the foot of the storm as it goes, from
   * low enough to see the funnel under the cloud.
   */
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /**
   * Puts the funnel a share of the way along its path, with the track it has left behind it;
   * `null` before it touched down. Past 1 the funnel is gone and the whole track is left.
   */
  set(share: number | null, chapterId?: string): void;
  /** Moves the bits of dust round the funnel on by so many seconds. */
  flow(seconds: number): void;
  dispose(): void;
  readonly slice?: TornadoSlice;
}

/**
 * `lengthKm` is how far it is from where the tornado touched down to where it lifted,
 * `bearingDeg` the way from the one to the other (degrees east of north) and `widthKm` how
 * wide the tornado was at the ground at its widest.
 */
export function createTornadoScene(
  lengthKm: number,
  bearingDeg: number,
  widthKm: number,
): TornadoScene {
  const slice = createTornadoSlice(lengthKm, bearingDeg, widthKm);

  return {
    get scene() {
      return slice.scene;
    },
    get target() {
      return slice.target;
    },
    get distance() {
      return slice.distance;
    },
    get direction() {
      return slice.direction;
    },
    set(share: number | null, chapterId?: string) {
      slice.set(chapterId ?? 'mature-wedge', share);
    },
    flow(seconds: number) {
      slice.flow(seconds);
    },
    dispose() {
      slice.dispose();
    },
    slice,
  };
}
