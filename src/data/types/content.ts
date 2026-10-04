import type { Source, Sourced } from './source';

/** A sentence shown to a kid, with the words of the source that back it. */
export interface BackedText {
  /** Key of the sentence in the UI strings. */
  readonly key: string;
  /** `id` of an entry in the card's `sources`. */
  readonly sourceId: string;
  /** The passage of the source the sentence rests on, copied exactly. */
  readonly quote: string;
}

/** What an info card says about one object, or about the whole view. */
export interface CardContent {
  /** A catalogue object id, or the id of the whole-view card. */
  readonly id: string;
  readonly hello: BackedText;
  readonly facts: readonly BackedText[];
  /** How many moons it has; `null` where the question does not apply. */
  readonly moons: Sourced<number> | null;
  readonly sources: readonly Source[];
}
