import { dot, normalize, type Vec3 } from './vec3';

/**
 * How near the equator, in degrees, the star counts as crossing it. The catalogue's pole for
 * Earth is the one for the year 2000, and the pole has swung a little since: with it the
 * equinoxes of 2027 come about nine hours late, when the Sun is still 0.15 degrees short of
 * the equator at the instant the almanac gives. Inside this band the season that is
 * beginning is named, so the name agrees with the almanac's day.
 */
const CROSSING_DEG = 0.2;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * The latitude on a world over which its star stands straight overhead, in degrees north:
 * above zero when the north pole leans towards the star. `pole` is the world's north pole and
 * `toStar` the direction from the world to the star, in one frame.
 */
export function starLatitudeDeg(pole: Vec3, toStar: Vec3): number {
  const lean = dot(normalize(pole), normalize(toStar));
  return (Math.asin(Math.min(1, Math.max(-1, lean))) * 180) / Math.PI;
}

/**
 * The season in each half of a world, from where its star stands overhead now and a little
 * later. The star over the northern half and still going north is northern spring; over it and
 * coming back is summer; then autumn and winter over the southern half. The south is always
 * half a year away from the north.
 */
export function seasonsAt(
  latitudeNowDeg: number,
  latitudeSoonDeg: number,
): { readonly north: Season; readonly south: Season } {
  const northward = latitudeSoonDeg > latitudeNowDeg;
  // This near the equator the star is taken to be crossing it: the season that is beginning
  // is named, not the one that has minutes left to run.
  if (Math.abs(latitudeNowDeg) < CROSSING_DEG) {
    return northward ? { north: 'spring', south: 'autumn' } : { north: 'autumn', south: 'spring' };
  }
  if (latitudeNowDeg >= 0) {
    return northward ? { north: 'spring', south: 'autumn' } : { north: 'summer', south: 'winter' };
  }
  return northward ? { north: 'winter', south: 'summer' } : { north: 'autumn', south: 'spring' };
}
