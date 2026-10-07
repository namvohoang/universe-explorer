import { unixMsFromJulianDate } from '../sim/time';
import { locale } from './strings';

const DATE_FORMAT = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A Julian date as a calendar day, e.g. "4 October 2026". */
export function formatDate(jd: number): string {
  return DATE_FORMAT.format(new Date(unixMsFromJulianDate(jd)));
}

const HOUR_FORMAT = new Intl.DateTimeFormat(locale, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

/** A Julian date as a day and the hour, e.g. "4 October 2026, 14:00", in world time (UTC). */
export function formatDateAndHour(jd: number): string {
  const HOUR_MS = 3_600_000;
  // Shown to the whole hour: at one hour a second, minutes would only be a blur.
  const hour = Math.floor(unixMsFromJulianDate(jd) / HOUR_MS) * HOUR_MS;
  return `${DATE_FORMAT.format(new Date(hour))}, ${HOUR_FORMAT.format(new Date(hour))}`;
}

/**
 * A Julian date as a day and the time to the minute, e.g. "20 July 1969, 20:17", in world
 * time (UTC): for something that takes a day or two, where the minute still matters.
 */
export function formatDateAndMinute(jd: number): string {
  const MINUTE_MS = 60_000;
  // Rounded down, as a clock shows it; half a millisecond is added for what a Julian date cannot hold.
  const minute = Math.floor((unixMsFromJulianDate(jd) + 0.5) / MINUTE_MS) * MINUTE_MS;
  return `${DATE_FORMAT.format(new Date(minute))}, ${HOUR_FORMAT.format(new Date(minute))}`;
}

const SECOND_FORMAT = new Intl.DateTimeFormat(locale, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

/**
 * A Julian date as a day and the time to the second, e.g. "16 July 1969, 13:32:00", in world
 * time (UTC): for something that is over in minutes, like a rocket's climb.
 */
export function formatDateAndSecond(jd: number): string {
  // To the whole second, rounding away the last digits a Julian date cannot hold.
  const second = Math.round(unixMsFromJulianDate(jd) / 1000) * 1000;
  return `${DATE_FORMAT.format(new Date(second))}, ${SECOND_FORMAT.format(new Date(second))}`;
}

/** The calendar year a Julian date falls in. */
export function yearOf(jd: number): number {
  return new Date(unixMsFromJulianDate(jd)).getUTCFullYear();
}

/** Fills `{name}` placeholders in a string from the UI strings. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in values ? String(values[name]) : whole,
  );
}
