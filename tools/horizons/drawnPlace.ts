/**
 * Places on the ground for a climb whose heights are known but whose track over the ground is
 * not: the track is drawn as a straight line (a great circle) from the pad, and how far along
 * it the rocket has gone at each second is read off another flight's table.
 */

/** The international nautical mile, by definition. */
const KM_PER_NAUTICAL_MILE = 1.852;
const RADIANS = Math.PI / 180;

/**
 * How far down its range a flight had gone at a second, in km, read straight-line between
 * the rows of its table: [seconds, range (nautical miles)], earliest first. Before the first
 * row it has gone nowhere; after the last it is held there.
 */
export function rangeAtKm(table: readonly (readonly [number, number])[], seconds: number): number {
  const first = table[0];
  const last = table[table.length - 1];
  if (!first || !last) throw new RangeError('A range table needs at least one row');
  if (seconds <= first[0]) return first[1] * KM_PER_NAUTICAL_MILE;
  if (seconds >= last[0]) return last[1] * KM_PER_NAUTICAL_MILE;
  const after = table.findIndex((row) => row[0] > seconds);
  const [t0, r0] = table[after - 1] ?? first;
  const [t1, r1] = table[after] ?? last;
  return (r0 + ((seconds - t0) / (t1 - t0)) * (r1 - r0)) * KM_PER_NAUTICAL_MILE;
}

/**
 * The place `distanceKm` from `[latDeg, lonDeg]` along a great circle that leaves it heading
 * `azimuthDeg` east of north, on a ball `radiusKm` in radius: [latitude (deg N), longitude (deg E)].
 */
export function placeAlong(
  from: readonly [latDeg: number, lonDeg: number],
  azimuthDeg: number,
  distanceKm: number,
  radiusKm: number,
): [number, number] {
  const lat = from[0] * RADIANS;
  const lon = from[1] * RADIANS;
  const heading = azimuthDeg * RADIANS;
  const angle = distanceKm / radiusKm;
  const toLat = Math.asin(
    Math.sin(lat) * Math.cos(angle) + Math.cos(lat) * Math.sin(angle) * Math.cos(heading),
  );
  const toLon =
    lon +
    Math.atan2(
      Math.sin(heading) * Math.sin(angle) * Math.cos(lat),
      Math.cos(angle) - Math.sin(lat) * Math.sin(toLat),
    );
  return [toLat / RADIANS, toLon / RADIANS];
}
