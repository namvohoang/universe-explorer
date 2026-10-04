import type { CardContent, CelestialObject } from '../data/types';
import { isKnown } from '../data/types';
import { lightTravelSeconds, orbitalPeriodDays, semiMajorAxisKm } from '../sim/elements';
import { fill } from './format';
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

function equatorialRadiusKm(object: CelestialObject): number | null {
  return object.shape?.type === 'spheroid' ? object.shape.equatorialRadiusKm.value : null;
}

function spinStat(object: CelestialObject): Stat[] {
  if (object.shape?.type !== 'spheroid') return [];
  const period = object.shape.orientation.rotationPeriodHours;
  return isKnown(period) ? [{ label: en.statSpin, value: formatDuration(period.value) }] : [];
}

function widthStat(object: CelestialObject, earth: CelestialObject): Stat[] {
  const radius = equatorialRadiusKm(object);
  const earthRadius = equatorialRadiusKm(earth);
  if (radius === null || earthRadius === null) return [];
  const value =
    object.id === earth.id
      ? fill(en.valueKm, { n: show(2 * radius, 4) })
      : fill(en.valueEarths, { n: show(radius / earthRadius, 2) });
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
  const trip =
    object.orbit === null
      ? []
      : [
          {
            label: object.kind === 'moon' ? en.statMonth : en.statYear,
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
              label: en.statFromEarth,
              value: fill(en.valueKm, { n: show(semiMajorAxisKm(object.orbit), 4) }),
            },
          ];
    return [...trip, ...spinStat(object), ...distance, ...widthStat(object, earth)];
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
