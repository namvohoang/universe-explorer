import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import { radToDeg } from '../src/sim/angles';
import { orbitPositionKmAt } from '../src/sim/elements';
import { eclipticOffsetKm } from '../src/sim/layout';
import { dateLimits } from '../src/sim/time';
import { angleBetween, length, type Vec3 } from '../src/sim/vec3';
import { HORIZONS, JPL_NOMINAL_ERRORS } from './fixtures/horizons';

/**
 * Tolerances for the planets. JPL publishes "nominal" errors for its approximate elements,
 * not hard bounds. Against Horizons at seven dates across 1800–2050 the worst error seen was
 * 4.6 times nominal (Neptune's distance, which swings as the Sun itself moves around the
 * solar system's centre of mass); most are within 1.5 times. A margin of 5 accepts what the
 * elements can do and still catches any mistake in the maths, which shows up as degrees, not
 * arcseconds.
 */
const NOMINAL_ERROR_MARGIN = 5;

/**
 * Tolerances for the Moon. Its record uses JPL's mean elements: one ellipse that turns slowly.
 * JPL warns these are "not intended for ephemeris computation": they leave out the Sun's pull,
 * which swings the real Moon a few degrees either side. Against Horizons at 60 dates across
 * 1800–2050 the worst error seen was 3.13° in direction and 7,040 km in distance. That is
 * about six Moon-widths on the sky: right phase to within a few hours, wrong for eclipses.
 */
const MOON_DIRECTION_TOLERANCE_DEG = 4;
const MOON_DISTANCE_TOLERANCE_KM = 9_000;

/**
 * Tolerances for the moons of the other planets, checked at 16 dates across 1960–2040. Each
 * is drawn on one ellipse (slowly turning where the source says how), so what is left out is
 * the tug of its neighbours. The worst seen was 4.2° (Tethys) and 1.2% in distance.
 */
const OTHER_MOONS_DIRECTION_TOLERANCE_DEG = 5;
const OTHER_MOONS_DISTANCE_TOLERANCE = 0.02;

/**
 * Moons a single ellipse cannot follow well. Each stays on the right orbit, at the right
 * distance, but can be well away from its true place along it. Worst seen: Mimas 67° and 4.5% in
 * distance (its neighbour Tethys swings it back and forth along its orbit over decades);
 * Triton 8° (its tilted orbit slowly turns about Neptune, and that turning is left out);
 * Phobos 5.6° and 2.6% (one fixed period does not quite fit 80 years of so fast a moon).
 */
const LOOSE_MOONS: Readonly<Record<string, { directionDeg: number; distance: number }>> = {
  mimas: { directionDeg: 75, distance: 0.06 },
  triton: { directionDeg: 10, distance: OTHER_MOONS_DISTANCE_TOLERANCE },
  phobos: { directionDeg: 8, distance: 0.04 },
};

const ARCSEC_PER_DEG = 3600;

const longitudeDeg = (v: Vec3): number => radToDeg(Math.atan2(v.y, v.x));
const latitudeDeg = (v: Vec3): number => radToDeg(Math.asin(v.z / length(v)));

/** Difference between two angles in degrees, taken the short way round. */
const angleDifferenceDeg = (a: number, b: number): number => {
  const d = a - b;
  return Math.abs(d - 360 * Math.round(d / 360));
};

function orbitOf(bodyId: string) {
  const orbit = catalogue.find((object) => object.id === bodyId)?.orbit;
  if (!orbit) throw new Error(`${bodyId} has no orbit in the catalogue`);
  return orbit;
}

describe('positions against JPL Horizons', () => {
  it('has reference positions for every body with an orbit', () => {
    const withOrbit = catalogue.filter((object) => object.orbit).map((object) => object.id);
    expect(HORIZONS.map((series) => series.bodyId).sort()).toEqual(withOrbit.sort());
  });

  it('only uses dates the elements are valid for', () => {
    const limits = dateLimits(catalogue);
    if (!limits) throw new Error('the planet elements state a validity span');
    for (const series of HORIZONS) {
      for (const [jd] of series.positionsKm) {
        expect(jd).toBeGreaterThanOrEqual(limits.minJd);
        expect(jd).toBeLessThanOrEqual(limits.maxJd);
      }
    }
  });

  const planets = HORIZONS.filter((series) => series.bodyId in JPL_NOMINAL_ERRORS);

  it.each(planets.map((series) => [series.bodyId, series] as const))(
    '%s matches Horizons within the accuracy JPL states for its elements',
    (bodyId, series) => {
      const nominal = JPL_NOMINAL_ERRORS[bodyId];
      if (!nominal) throw new Error(`no nominal errors for ${bodyId}`);
      const orbit = orbitOf(bodyId);
      expect(series.positionsKm.length).toBeGreaterThanOrEqual(7);
      for (const [jd, x, y, z] of series.positionsKm) {
        const expected = { x, y, z };
        const actual = orbitPositionKmAt(orbit, jd);
        const longitudeArcsec =
          angleDifferenceDeg(longitudeDeg(actual), longitudeDeg(expected)) * ARCSEC_PER_DEG;
        const latitudeArcsec =
          Math.abs(latitudeDeg(actual) - latitudeDeg(expected)) * ARCSEC_PER_DEG;
        const distanceKm = Math.abs(length(actual) - length(expected));
        expect(longitudeArcsec).toBeLessThan(nominal.longitudeArcsec * NOMINAL_ERROR_MARGIN);
        expect(latitudeArcsec).toBeLessThan(nominal.latitudeArcsec * NOMINAL_ERROR_MARGIN);
        expect(distanceKm).toBeLessThan(nominal.distanceKm * NOMINAL_ERROR_MARGIN);
      }
    },
  );

  it('the Moon matches Horizons as closely as mean elements can', () => {
    const series = HORIZONS.find((s) => s.bodyId === 'moon');
    if (!series) throw new Error('no Moon reference positions');
    const orbit = orbitOf('moon');
    expect(series.positionsKm.length).toBeGreaterThanOrEqual(60);
    for (const [jd, x, y, z] of series.positionsKm) {
      const expected = { x, y, z };
      const actual = orbitPositionKmAt(orbit, jd);
      expect(radToDeg(angleBetween(actual, expected))).toBeLessThan(MOON_DIRECTION_TOLERANCE_DEG);
      expect(Math.abs(length(actual) - length(expected))).toBeLessThan(MOON_DISTANCE_TOLERANCE_KM);
    }
  });

  const otherMoons = HORIZONS.filter(
    (series) => series.bodyId !== 'moon' && !(series.bodyId in JPL_NOMINAL_ERRORS),
  );

  it.each(otherMoons.map((series) => [series.bodyId, series] as const))(
    '%s stays close to where Horizons puts it around its planet',
    (bodyId, series) => {
      const object = catalogue.find((o) => o.id === bodyId);
      if (!object) throw new Error(`${bodyId} is not in the catalogue`);
      const loose = LOOSE_MOONS[bodyId];
      const directionDeg = loose?.directionDeg ?? OTHER_MOONS_DIRECTION_TOLERANCE_DEG;
      const distance = loose?.distance ?? OTHER_MOONS_DISTANCE_TOLERANCE;
      expect(series.positionsKm.length).toBeGreaterThanOrEqual(16);
      for (const [jd, x, y, z] of series.positionsKm) {
        const expected = { x, y, z };
        const actual = eclipticOffsetKm(object, catalogue, jd);
        expect(radToDeg(angleBetween(actual, expected))).toBeLessThan(directionDeg);
        expect(Math.abs(length(actual) - length(expected)) / length(expected)).toBeLessThan(
          distance,
        );
      }
    },
  );

  it('would catch precession running the wrong way', () => {
    // Guard on the direction chosen in elements.ts: with the node turning forwards instead of
    // backwards, the Moon ends up many degrees out within a few decades.
    const series = HORIZONS.find((s) => s.bodyId === 'moon');
    const orbit = orbitOf('moon');
    if (!series || orbit.motion.type !== 'precessing-ellipse') throw new Error('unexpected Moon');
    const node = orbit.motion.nodalPrecession;
    if (!node) throw new Error('the Moon has a nodal precession');
    const flipped = {
      ...orbit,
      motion: { ...orbit.motion, nodalPrecession: { ...node, direction: 'forward' as const } },
    };
    const worst = Math.max(
      ...series.positionsKm.map(([jd, x, y, z]) =>
        radToDeg(angleBetween(orbitPositionKmAt(flipped, jd), { x, y, z })),
      ),
    );
    expect(worst).toBeGreaterThan(2 * MOON_DIRECTION_TOLERANCE_DEG);
  });
});
