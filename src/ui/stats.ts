import type { CardContent, CelestialObject, ObjectOfKind } from '../data/types';
import { isKnown, isSatellite } from '../data/types';
import { lightTravelSeconds, orbitalPeriodDays, semiMajorAxisKm } from '../sim/elements';
import { KM_PER_AU } from '../sim/constants';
import { bodyRadiusKm } from '../sim/layout';
import { figureDepth } from '../sim/stars';
import { fill } from './format';
import { displayName } from './names';
import { locale, words } from './strings';

/** One line of a card's fact box: what is measured and its value, both ready to show. */
export interface Stat {
  readonly label: string;
  readonly value: string;
}

const HOURS_PER_DAY = 24;
const METRES_PER_KM = 1000;
/** From this eccentricity an orbit is shown as an oval with a nearest and a farthest point. */
const OVAL_FROM = 0.05;
const DAYS_PER_YEAR = 365.25;
const KELVIN_TO_CELSIUS = 273.15;
const NUMBER = new Intl.NumberFormat(locale);

/** Rounds to a number of significant figures: values on a card are approximate, not exact. */
function significant(value: number, figures: number): number {
  if (value === 0) return 0;
  const magnitude = 10 ** (figures - 1 - Math.floor(Math.log10(Math.abs(value))));
  return Math.round(value * magnitude) / magnitude;
}

const show = (value: number, figures: number): string => NUMBER.format(significant(value, figures));

/** A length of time in the unit a kid would use for it: hours, Earth days or Earth years. */
export function formatDuration(hours: number): string {
  const days = hours / HOURS_PER_DAY;
  if (days < 2) return fill(words.valueHours, { n: show(hours, 2) });
  if (days < 2 * DAYS_PER_YEAR) return fill(words.valueEarthDays, { n: show(days, 3) });
  return fill(words.valueEarthYears, { n: show(days / DAYS_PER_YEAR, 3) });
}

/** Below this share of Earth's width, a size in kilometres says more than a fraction of Earth. */
const SMALL_NEXT_TO_EARTH = 0.2;

function spinStat(object: CelestialObject): Stat[] {
  const { shape } = object;
  if (shape?.type !== 'spheroid' && shape?.type !== 'triaxial') return [];
  // A body that keeps one face to its parent turns exactly once per trip around it.
  if (shape.orientation.rotation === 'synchronous') {
    return object.orbit
      ? [
          {
            label: words.statSpin,
            value: formatDuration(orbitalPeriodDays(object.orbit) * HOURS_PER_DAY),
          },
        ]
      : [];
  }
  const period = shape.orientation.rotationPeriodHours;
  return isKnown(period) ? [{ label: words.statSpin, value: formatDuration(period.value) }] : [];
}

function widthStat(object: CelestialObject, earth: CelestialObject): Stat[] {
  const radius = bodyRadiusKm(object);
  const earthRadius = bodyRadiusKm(earth);
  if (radius === null || earthRadius === null) return [];
  const inEarths = radius / earthRadius;
  let value = fill(words.valueEarths, { n: show(inEarths, 2) });
  if (object.id === earth.id) value = fill(words.valueKm, { n: show(2 * radius, 4) });
  else if (inEarths < SMALL_NEXT_TO_EARTH)
    value = fill(words.valueKmWide, { n: show(2 * radius, 3) });
  return [{ label: words.statWidth, value }];
}

function moonsStat(card: CardContent | undefined): Stat[] {
  return card?.moons ? [{ label: words.statMoons, value: NUMBER.format(card.moons.value) }] : [];
}

function sunlightStat(earth: CelestialObject): Stat[] {
  if (!earth.orbit) return [];
  const minutes = lightTravelSeconds(semiMajorAxisKm(earth.orbit)) / 60;
  return [{ label: words.statSunlight, value: fill(words.valueMinutes, { n: show(minutes, 1) }) }];
}

/**
 * The fact box for one object. Every number is worked out from the catalogue when the card is
 * shown, so it can never drift from the data the scene is drawn from.
 */
export function objectStats(
  object: CelestialObject,
  catalogue: readonly CelestialObject[],
  card: CardContent | undefined,
): Stat[] {
  const earth = catalogue.find((o) => o.id === 'earth');
  if (!earth) throw new Error('The catalogue has no Earth to compare with');
  const parent = catalogue.find((o) => o.id === object.parentId);
  const parentName = parent ? displayName(parent) : '';
  const trip =
    object.orbit === null
      ? []
      : [
          {
            label: isSatellite(object)
              ? fill(words.statTripAround, { parent: parentName })
              : words.statYear,
            value: formatDuration(orbitalPeriodDays(object.orbit) * HOURS_PER_DAY),
          },
        ];

  if (object.kind === 'star') {
    const temperature = isKnown(object.effectiveTemperatureK)
      ? [
          {
            label: words.statSurface,
            value: fill(words.valueCelsius, {
              n: show(object.effectiveTemperatureK.value - KELVIN_TO_CELSIUS, 2),
            }),
          },
        ]
      : [];
    return [
      ...widthStat(object, earth),
      ...temperature,
      ...spinStat(object),
      ...sunlightStat(earth),
    ];
  }
  if (object.kind === 'spacecraft') {
    const parentRadiusKm = parent ? bodyRadiusKm(parent) : null;
    const above = (distanceKm: number): string =>
      fill(words.valueKm, { n: show(distanceKm - (parentRadiusKm ?? 0), 2) });
    let height: Stat[] = [];
    if (object.orbit !== null && parentRadiusKm !== null) {
      const a = semiMajorAxisKm(object.orbit);
      const e = object.orbit.eccentricity.value;
      // A round path has one height. A long oval one has a nearest and a farthest point.
      height =
        e < OVAL_FROM
          ? [{ label: words.statHeight, value: above(a) }]
          : [
              { label: words.statNearest, value: above(a * (1 - e)) },
              { label: words.statFarthest, value: above(a * (1 + e)) },
            ];
    }
    // A craft whose size the sources do not give has no size to show.
    const size: Stat[] = object.shape
      ? [
          {
            label: words.statLength,
            value: fill(object.orbit === null ? words.valueMetresEndToEnd : words.valueMetresLong, {
              n: show(2 * object.shape.radiiKm.value[0] * METRES_PER_KM, 3),
            }),
          },
        ]
      : [];
    // A year is shown as written, with no thousands separator.
    const firstUsed: Stat[] = object.firstUsedYear
      ? [{ label: words.statFirstUsed, value: String(object.firstUsedYear.value) }]
      : [];
    return [...trip, ...height, ...size, ...firstUsed];
  }
  if (object.kind === 'moon') {
    const distance =
      object.orbit === null
        ? []
        : [
            {
              label: fill(words.statFromParent, { parent: parentName }),
              value: fill(words.valueKm, { n: show(semiMajorAxisKm(object.orbit), 4) }),
            },
          ];
    return [...trip, ...spinStat(object), ...distance, ...widthStat(object, earth)];
  }
  if (object.kind === 'comet' && object.orbit) {
    const closestAu =
      (semiMajorAxisKm(object.orbit) * (1 - object.orbit.eccentricity.value)) / KM_PER_AU;
    const closest = {
      label: words.statClosest,
      value: fill(words.valueTimesEarthOne, { n: show(closestAu, 2) }),
    };
    return [...trip, closest, ...widthStat(object, earth)];
  }
  return [...spinStat(object), ...trip, ...moonsStat(card), ...widthStat(object, earth)];
}

/** The fact box for the whole view. */
export function solarSystemStats(catalogue: readonly CelestialObject[]): Stat[] {
  const earth = catalogue.find((o) => o.id === 'earth');
  const planets = catalogue.filter((o) => o.kind === 'planet').length;
  return [
    { label: words.statPlanets, value: NUMBER.format(planets) },
    { label: words.statStars, value: words.valueOneSun },
    ...(earth ? sunlightStat(earth) : []),
  ];
}

/** The fact box for a belt: how many dots are drawn and how far from the Sun it lies. */
export function beltStats(belt: ObjectOfKind<'belt'>): Stat[] {
  return [
    { label: words.statDots, value: NUMBER.format(belt.members.value.length) },
    {
      label: words.statBeltSpan,
      // One AU is Earth's distance from the Sun, so a distance in AU is "times Earth's".
      value: fill(words.valueTimesEarth, {
        from: show(belt.shape.innerRadiusAu.value, 2),
        to: show(belt.shape.outerRadiusAu.value, 2),
      }),
    },
  ];
}

const MILLION = 1_000_000;

/** A distance in light-years the way a kid would say it: "1,500" or "2.5 million". */
export function formatLightYears(lightYears: number): string {
  return lightYears >= MILLION
    ? fill(words.valueMillionLightYears, { n: show(lightYears / MILLION, 2) })
    : fill(words.valueLightYears, { n: show(lightYears, 3) });
}

/**
 * The fact box for something beyond the solar system. A light-year is how far light goes in a
 * year, so the distance in light-years is also how many years ago the light we see set out.
 */
export function deepSkyStats(object: CelestialObject): Stat[] {
  if (object.kind === 'constellation') {
    const depth = figureDepth(object.stars.value);
    if (!depth) return [];
    const star = (one: { name: string; lightYears: number }): string =>
      fill(words.valueStarAt, { name: one.name, distance: formatLightYears(one.lightYears) });
    return [
      { label: words.statNearestStar, value: star(depth.nearest) },
      { label: words.statFarthestStar, value: star(depth.farthest) },
    ];
  }
  if (!('sky' in object) || object.sky === null || !isKnown(object.sky.distanceLy)) return [];
  const lightYears = object.sky.distanceLy.value;
  const ago =
    lightYears >= MILLION
      ? fill(words.valueMillionYearsAgo, { n: show(lightYears / MILLION, 2) })
      : fill(words.valueYearsAgo, { n: show(lightYears, 3) });
  const width =
    object.shape?.type === 'extended' && isKnown(object.shape.diameterLy)
      ? [{ label: words.statWide, value: formatLightYears(object.shape.diameterLy.value) }]
      : [];
  return [
    { label: words.statHowFar, value: formatLightYears(lightYears) },
    { label: words.statLightLeft, value: ago },
    ...width,
  ];
}
