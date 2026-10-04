import type { CardContent, CelestialObject, ObjectOfKind } from '../data/types';
import { isKnown } from '../data/types';
import { lightTravelSeconds, orbitalPeriodDays, semiMajorAxisKm } from '../sim/elements';
import { KM_PER_AU } from '../sim/constants';
import { bodyRadiusKm } from '../sim/layout';
import { fill } from './format';
import { displayName } from './names';
import { en } from './strings/en';

/** One line of a card's fact box: what is measured and its value, both ready to show. */
export interface Stat {
  readonly label: string;
  readonly value: string;
}

const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR = 365.25;
const KELVIN_TO_CELSIUS = 273.15;
const NUMBER = new Intl.NumberFormat('en-GB');

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
  if (days < 2) return fill(en.valueHours, { n: show(hours, 2) });
  if (days < 2 * DAYS_PER_YEAR) return fill(en.valueEarthDays, { n: show(days, 3) });
  return fill(en.valueEarthYears, { n: show(days / DAYS_PER_YEAR, 3) });
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
            label: en.statSpin,
            value: formatDuration(orbitalPeriodDays(object.orbit) * HOURS_PER_DAY),
          },
        ]
      : [];
  }
  const period = shape.orientation.rotationPeriodHours;
  return isKnown(period) ? [{ label: en.statSpin, value: formatDuration(period.value) }] : [];
}

function widthStat(object: CelestialObject, earth: CelestialObject): Stat[] {
  const radius = bodyRadiusKm(object);
  const earthRadius = bodyRadiusKm(earth);
  if (radius === null || earthRadius === null) return [];
  const inEarths = radius / earthRadius;
  let value = fill(en.valueEarths, { n: show(inEarths, 2) });
  if (object.id === earth.id) value = fill(en.valueKm, { n: show(2 * radius, 4) });
  else if (inEarths < SMALL_NEXT_TO_EARTH) value = fill(en.valueKmWide, { n: show(2 * radius, 3) });
  return [{ label: en.statWidth, value }];
}

function moonsStat(card: CardContent | undefined): Stat[] {
  return card?.moons ? [{ label: en.statMoons, value: NUMBER.format(card.moons.value) }] : [];
}

function sunlightStat(earth: CelestialObject): Stat[] {
  if (!earth.orbit) return [];
  const minutes = lightTravelSeconds(semiMajorAxisKm(earth.orbit)) / 60;
  return [{ label: en.statSunlight, value: fill(en.valueMinutes, { n: show(minutes, 1) }) }];
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
            label:
              object.kind === 'moon'
                ? fill(en.statTripAround, { parent: parentName })
                : en.statYear,
            value: formatDuration(orbitalPeriodDays(object.orbit) * HOURS_PER_DAY),
          },
        ];

  if (object.kind === 'star') {
    const temperature = isKnown(object.effectiveTemperatureK)
      ? [
          {
            label: en.statSurface,
            value: fill(en.valueCelsius, {
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
  if (object.kind === 'moon') {
    const distance =
      object.orbit === null
        ? []
        : [
            {
              label: fill(en.statFromParent, { parent: parentName }),
              value: fill(en.valueKm, { n: show(semiMajorAxisKm(object.orbit), 4) }),
            },
          ];
    return [...trip, ...spinStat(object), ...distance, ...widthStat(object, earth)];
  }
  if (object.kind === 'comet' && object.orbit) {
    const closestAu =
      (semiMajorAxisKm(object.orbit) * (1 - object.orbit.eccentricity.value)) / KM_PER_AU;
    const closest = {
      label: en.statClosest,
      value: fill(en.valueTimesEarthOne, { n: show(closestAu, 2) }),
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
    { label: en.statPlanets, value: NUMBER.format(planets) },
    { label: en.statStars, value: en.valueOneSun },
    ...(earth ? sunlightStat(earth) : []),
  ];
}

/** The fact box for a belt: how many dots are drawn and how far from the Sun it lies. */
export function beltStats(belt: ObjectOfKind<'belt'>): Stat[] {
  return [
    { label: en.statDots, value: NUMBER.format(belt.members.value.length) },
    {
      label: en.statBeltSpan,
      // One AU is Earth's distance from the Sun, so a distance in AU is "times Earth's".
      value: fill(en.valueTimesEarth, {
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
    ? fill(en.valueMillionLightYears, { n: show(lightYears / MILLION, 2) })
    : fill(en.valueLightYears, { n: show(lightYears, 3) });
}

/**
 * The fact box for something beyond the solar system. A light-year is how far light goes in a
 * year, so the distance in light-years is also how many years ago the light we see set out.
 */
export function deepSkyStats(object: CelestialObject): Stat[] {
  if (!('sky' in object) || object.sky === null || !isKnown(object.sky.distanceLy)) return [];
  const lightYears = object.sky.distanceLy.value;
  const ago =
    lightYears >= MILLION
      ? fill(en.valueMillionYearsAgo, { n: show(lightYears / MILLION, 2) })
      : fill(en.valueYearsAgo, { n: show(lightYears, 3) });
  const width =
    object.shape?.type === 'extended' && isKnown(object.shape.diameterLy)
      ? [{ label: en.statWide, value: formatLightYears(object.shape.diameterLy.value) }]
      : [];
  return [
    { label: en.statHowFar, value: formatLightYears(lightYears) },
    { label: en.statLightLeft, value: ago },
    ...width,
  ];
}
