import type { BackedText } from './content';
import type { Source, Sourced } from './source';

/** The rows the Watch screen sorts its stories into, in the order shown. */
export const STORY_GROUPS = ['sky-events', 'space-flights'] as const;
export type StoryGroup = (typeof STORY_GROUPS)[number];

/**
 * Where a story's movement comes from, which the screen always says:
 * `orbits` is worked out from the catalogue's own orbits; `tracked` is positions sampled from
 * JPL Horizons; `staged` has real event times but the movement between them is a drawing.
 */
export const STORY_PATHS = ['orbits', 'tracked', 'staged'] as const;
export type StoryPath = (typeof STORY_PATHS)[number];

/** One step of a story: when it starts, what the kid is told, and what the camera looks at. */
export interface Chapter {
  readonly id: string;
  /** The instant the chapter starts, as a Julian date. */
  readonly atJd: Sourced<number>;
  readonly text: BackedText;
  /** One of the story's `actorIds`. */
  readonly lookAtId: string;
  /**
   * When set, the camera is held on the line from this actor to the one looked at, so the kid
   * sees it as from there (the Moon as seen from Earth). Left out, the whole stage is shown.
   */
  readonly viewFromId?: string;
}

/** Something that happens, played on a real clock: a sky event or a space flight. */
export interface Story {
  readonly id: string;
  readonly group: StoryGroup;
  readonly path: StoryPath;
  /** Key of the story's name in the UI strings. */
  readonly titleKey: string;
  /** In the order they happen. */
  readonly chapters: readonly Chapter[];
  /** The instant the last chapter ends. */
  readonly endJd: Sourced<number>;
  /** Catalogue ids of everything drawn. The first is the middle of the stage. */
  readonly actorIds: readonly string[];
  readonly sources: readonly Source[];
}
