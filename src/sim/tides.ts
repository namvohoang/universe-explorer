import { dot, length, normalize, type Vec3 } from './vec3';

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

/**
 * How high a sea with no land in it, covering a smooth world and given time to settle, would
 * stand in each direction from the world's middle, for all the raisers together. The answer is
 * a share of the height the strongest raiser alone raises right under itself: 1 there and on
 * the far side, and -1/2 all round the ring half way between. Real seas do not settle like
 * this: the world turns under them and land is in the way.
 */
export function tideHeights(raisers: readonly TideRaiser[]): (towards: Vec3) => number {
  const strongest = Math.max(0, ...raisers.map(tideStrength));
  const pulls = raisers.map((raiser) => ({
    share: strongest > 0 ? tideStrength(raiser) / strongest : 0,
    towards: normalize(raiser.offsetKm),
  }));
  return (towards) => {
    const out = normalize(towards);
    return pulls.reduce((sum, pull) => {
      const cosine = dot(out, pull.towards);
      return sum + (pull.share * (3 * cosine * cosine - 1)) / 2;
    }, 0);
  };
}
