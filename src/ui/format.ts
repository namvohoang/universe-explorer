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
