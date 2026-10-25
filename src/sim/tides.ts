import { add, cross, dot, length, normalize, scale, subtract, type Vec3 } from './vec3';

/** Something that raises a tide on a world: its mass, and where it is from the world's middle. */
export interface TideRaiser {
  readonly massKg: number;
  /** In any frame, so long as the directions the tide is asked for are in the same one. */
  readonly offsetKm: Vec3;
}

/**
 * How strongly a body raises a tide: its mass over the cube of its distance. The pull of
 * gravity falls with the square of the distance, but a tide is raised by how much that pull
 * differs from one side of the world to the other, which falls with the cube. Only ratios of
 * this number mean anything.
 */
export function tideStrength(raiser: TideRaiser): number {
  return raiser.massKg / length(raiser.offsetKm) ** 3;
}

/** Each raiser's direction, and its tide as a share of the strongest one's. */
function shares(raisers: readonly TideRaiser[]): readonly { share: number; towards: Vec3 }[] {
  const strongest = Math.max(0, ...raisers.map(tideStrength));
  return raisers.map((raiser) => ({
    share: strongest > 0 ? tideStrength(raiser) / strongest : 0,
    towards: normalize(raiser.offsetKm),
  }));
}

/**
 * How high a sea with no land in it, covering a smooth world and given time to settle, would
 * stand in each direction from the world's middle, for all the raisers together. The answer is
 * a share of the height the strongest raiser alone raises right under itself: 1 there and on
 * the far side, and -1/2 all round the ring half way between. Real seas do not settle like
 * this: the world turns under them and land is in the way.
 */
export function tideHeights(raisers: readonly TideRaiser[]): (towards: Vec3) => number {
  const pulls = shares(raisers);
  return (towards) => {
    const out = normalize(towards);
    return pulls.reduce((sum, pull) => {
      const cosine = dot(out, pull.towards);
      return sum + (pull.share * (3 * cosine * cosine - 1)) / 2;
    }, 0);
  };
}

/**
 * The pull that raises the tide at each point of the world's surface: what is left of a
 * raiser's pull there once the pull on the world's middle is taken away. It points out
 * towards the raiser and out on the far side, and in all round the ring half way between,
 * half as strongly. Measured on the same scale as `tideHeights`: 1 outward right under the
 * strongest raiser alone.
 */
export function tidePulls(raisers: readonly TideRaiser[]): (towards: Vec3) => Vec3 {
  const pulls = shares(raisers);
  return (towards) => {
    const out = normalize(towards);
    return pulls.reduce<Vec3>(
      (sum, pull) => {
        const along = scale(pull.towards, 3 * dot(out, pull.towards));
        return add(sum, scale(subtract(along, out), pull.share / 2));
      },
      { x: 0, y: 0, z: 0 },
    );
  };
}

/** A direction or a pull as it is seen at one place on a world: along east, up and north. */
export interface InSky {
  readonly east: number;
  readonly up: number;
  readonly north: number;
}

/**
 * A vector split along a place's east, up and north, for a place on its world's equator:
 * `up` is straight up there and `pole` the world's north pole, both unit vectors in the same
 * axes as `v`. Its length is kept, so a direction gives where it lies in the place's sky, and
 * a pull how much of it is along the ground and how much straight up.
 */
export function inSkyAtEquator(v: Vec3, up: Vec3, pole: Vec3): InSky {
  return { east: dot(v, cross(pole, up)), up: dot(v, up), north: dot(v, pole) };
}
