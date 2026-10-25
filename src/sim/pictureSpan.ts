/**
 * How big a picture of the ground is on the ground, for a picture laid out evenly in longitude
 * and latitude between the edges of `box`, on a world of radius `radiusKm` taken as round.
 * Its width is measured across its middle: a degree of longitude spans less ground the further
 * from the equator, by the cosine of the latitude.
 */
export function pictureSpanKm(
  box: readonly [
    westDegEast: number,
    southDegNorth: number,
    eastDegEast: number,
    northDegNorth: number,
  ],
  radiusKm: number,
): { readonly widthKm: number; readonly heightKm: number } {
  const [west, south, east, north] = box;
  const kmPerDeg = (radiusKm * Math.PI) / 180;
  const middleRad = (((south + north) / 2) * Math.PI) / 180;
  return {
    widthKm: (east - west) * kmPerDeg * Math.cos(middleRad),
    heightKm: (north - south) * kmPerDeg,
  };
}

/** The lengths a scale bar may stand for: a 1, 2 or 5 times a power of ten, in km. */
const BAR_STEPS = [1, 2, 5] as const;

/**
 * The longest round length, in km, that fits within `maxKm`: 1, 2 or 5 times a power of ten,
 * so a scale bar under a picture reads easily.
 */
export function scaleBarKm(maxKm: number): number {
  if (!(maxKm > 0)) throw new RangeError('A scale bar needs room for some length');
  const power = 10 ** Math.floor(Math.log10(maxKm));
  const fits = BAR_STEPS.filter((step) => step * power <= maxKm * (1 + 1e-12));
  return (fits[fits.length - 1] ?? 1) * power;
}
