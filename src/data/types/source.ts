/**
 * Where a value came from. Every astronomical number in the catalogue is wrapped in `Sourced`,
 * so a value with no source does not compile (CLAUDE.md: real numbers only).
 */

/** A calendar date written as YYYY-MM-DD. */
export type IsoDate = `${number}-${number}-${number}`;

/** A page that values were read from. Listed once per record and referred to by `id`. */
export interface Source {
  readonly id: string;
  readonly title: string;
  readonly url: `https://${string}`;
  readonly retrieved: IsoDate;
}

/** A value read from one of the record's sources. */
export interface Sourced<T> {
  readonly value: T;
  /** `id` of an entry in the record's `sources`. */
  readonly sourceId: string;
  /** Anything a reader needs to interpret the value, e.g. which of two published figures was used. */
  readonly note?: string;
}

/** A value nobody knows, or that does not apply. Never stand in a guess or a zero. */
export interface Unknown {
  readonly value: null;
  readonly reason: string;
}

/** A value that is either sourced or honestly unknown. */
export type Measured<T> = Sourced<T> | Unknown;

export function isKnown<T>(measured: Measured<T>): measured is Sourced<T> {
  return measured.value !== null;
}
