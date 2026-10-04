import { unixMsFromJulianDate } from '../sim/time';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A Julian date as a calendar day, e.g. "4 October 2026". */
export function formatDate(jd: number): string {
  return DATE_FORMAT.format(new Date(unixMsFromJulianDate(jd)));
}

const HOUR_FORMAT = new Intl.DateTimeFormat('en-GB', {
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
