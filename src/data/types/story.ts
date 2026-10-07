import type { BackedText } from './content';
import type { MediaRef } from './media';
import type { Source, Sourced } from './source';

/** The rows the Watch screen sorts its stories into, in the order shown. */
export const STORY_GROUPS = ['sky-events', 'space-flights'] as const;
export type StoryGroup = (typeof STORY_GROUPS)[number];

/**
 * Where a story's movement comes from, which the screen always says:
 * `orbits` is worked out from the catalogue's own orbits, or from JPL's positions of the
 * bodies themselves; `tracked` is positions sampled from
 * JPL Horizons; `staged` has real event times but the movement between them is a drawing.
 */
export const STORY_PATHS = ['orbits', 'tracked', 'staged'] as const;
export type StoryPath = (typeof STORY_PATHS)[number];

/** One step of a story: when it starts, what the kid is told, and what the camera looks at. */
export interface Chapter {
  readonly id: string;
  /** The instant the chapter starts, as a Julian date. */
  readonly atJd: Sourced<number>;
  /**
   * When set, the chapter stops here and the story skips on to the start of the next one: for
   * showing a day in spring and then a day in summer without racing through the months between.
   */
  readonly untilJd?: Sourced<number>;
  readonly text: BackedText;
  /** One of the story's `actorIds`, or one of its craft. */
  readonly lookAtId: string;
  /**
   * When set, the camera stands at this actor itself and looks at the other through a narrow
   * field, like a telescope: how big a thing looks from there is then how big it is drawn.
   */
  readonly standAtId?: string;
  /**
   * With `standAtId`: stands on that body's ground at this place, not at its middle, and so
   * turns round with it. Longitude in degrees east and latitude in degrees north, both
   * measured from the body's centre. What is seen from one place on the ground and not from
   * another (the Sun wholly hidden in an eclipse) needs it.
   */
  readonly standOn?: Sourced<readonly [lonDegEast: number, latDeg: number]>;
  /**
   * With `standOn`: looks from the ground at this place over the same body (longitude east,
   * latitude north, height in km), with the ground level across the screen and a wide field,
   * as the sky is seen by somebody standing there. With `closeUp` as well, the close-up is
   * drawn as the second picture, beside the look from the ground.
   */
  readonly lookUpAt?: Sourced<readonly [lonDegEast: number, latDeg: number, altitudeKm: number]>;
  /** Stands close to what is looked at, in place of showing the whole stage. */
  readonly closeUp?: boolean;
  /** With `closeUp`: stands over this pole of the body, on its night side, in place of its sunlit side. */
  readonly over?: 'north' | 'south';
  /**
   * When set, the camera is held on the line from this actor to the one looked at, so the kid
   * sees it as from there (the Moon as seen from Earth). Left out, the whole stage is shown.
   */
  readonly viewFromId?: string;
}

/**
 * Where something was at one instant: [Julian date (TDB), x, y, z (km), vx, vy, vz (km/s)],
 * from the centre of the body it is tracked round, in the ecliptic frame of J2000.
 */
export type PathSample = readonly [
  jd: number,
  xKm: number,
  yKm: number,
  zKm: number,
  vxKmPerS: number,
  vyKmPerS: number,
  vzKmPerS: number,
];

/** A path as it was really flown or really moved, sampled closely enough to draw between. */
export interface SampledPath {
  /** Catalogue id of the body the positions are measured from. */
  readonly centreId: string;
  /** Earliest first. */
  readonly samples: Sourced<readonly PathSample[]>;
}

/** A place something was at one instant: [Julian date (UTC), x, y, z (km)], as for `PathSample`. */
export type PathPoint = readonly [jd: number, xKm: number, yKm: number, zKm: number];

/**
 * A path known only at a few instants, each a real place at a real time from an agency's
 * table. The app draws a smooth curve through them; what lies between is a drawing.
 */
export interface StagedPath {
  readonly centreId: string;
  /** Earliest first. */
  readonly points: Sourced<readonly PathPoint[]>;
}

/**
 * A place over a body's ground at one instant: [Julian date (UTC), longitude (degrees east),
 * latitude (degrees north), height above the ground (km), speed (km/s)].
 */
export type GroundPoint = readonly [
  jd: number,
  lonDegEast: number,
  latDegNorth: number,
  altitudeKm: number,
  speedKmPerS: number,
];

/**
 * A path round a body, known at a few instants as places over its ground, each from an
 * agency's table. Between two of them the craft may go right round the body, more than once;
 * the app draws it going round at a steady rate, which is a drawing.
 */
export interface GroundPath {
  readonly centreId: string;
  /** Which way round the craft goes, as the table's heading angles show. */
  readonly heading: Sourced<'east' | 'west'>;
  /** Earliest first. */
  readonly points: Sourced<readonly GroundPoint[]>;
}

/**
 * The path of a craft that is catching another one up, where only the instant they join is
 * known. It is drawn on the other craft's own path, behind it by a gap that closes steadily
 * to nothing at that instant. The gap is a drawing; the story must say so with `noteKey`.
 */
export interface ChasePath {
  readonly centreId: string;
  /** The `id` of another craft of the same story, one with a sampled path. */
  readonly followsId: string;
  /** The instant the two join, as a Julian date. */
  readonly joinsAtJd: Sourced<number>;
}

/**
 * Which way a body was turned at one instant: the direction (a unit vector in the ecliptic
 * frame of J2000) of the point at latitude 0, longitude 0 on it. The catalogue knows how fast
 * a body spins but not which side faced where; a rocket leaving the ground needs the ground
 * in the right place.
 */
export interface BodyTurn {
  readonly atJd: Sourced<number>;
  readonly primeMeridian: Sourced<readonly [x: number, y: number, z: number]>;
}

/** One body's shadow falling on another, drawn for a story about an eclipse. */
export interface StoryShadow {
  /** Catalogue id of the body that stands in the Sun's light. */
  readonly casterId: string;
  /** Catalogue id of the body the shadow falls on. */
  readonly onId: string;
  /**
   * Set when the caster has air that bends a little red light into its shadow, as Earth's
   * does: the body in the shadow then glows dim red rather than going black.
   */
  readonly throughAir?: boolean;
}

/**
 * The two rings round a world's magnetic poles where auroras are most often seen. The rings
 * are drawn as glowing bands; how bright they are, and that they are even all the way round,
 * is a drawing, and the story must say so with `noteKey`.
 */
export interface StoryAurora {
  /** Catalogue id of the world. */
  readonly onId: string;
  /** Where its north geomagnetic pole is: [longitude (degrees east), latitude (degrees north, from the centre)]. */
  readonly northPole: Sourced<readonly [lonDegEast: number, latDegNorth: number]>;
  /** How far from each geomagnetic pole the band lies: [nearest, farthest], in degrees. */
  readonly fromPoleDeg: Sourced<readonly [nearest: number, farthest: number]>;
  /** How high the glow is: [lowest, highest], in km above the ground. */
  readonly heightKm: Sourced<readonly [lowest: number, highest: number]>;
}

/** A spacecraft that flies in a story. It is drawn as a named point: at true scale it is too small to see. */
export interface StoryCraft {
  readonly id: string;
  /** Key of its name in the UI strings. */
  readonly nameKey: string;
  readonly path: SampledPath | StagedPath | GroundPath | ChasePath;
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
  /** The spacecraft that fly in it, each on its tracked path. */
  readonly craft?: readonly StoryCraft[];
  /**
   * Bodies that, for this story, are put where JPL Horizons has them in place of where the
   * catalogue's orbit puts them, keyed by catalogue id: a spacecraft that skims a moon needs
   * the moon to the kilometre.
   */
  readonly tracked?: Readonly<Record<string, SampledPath>>;
  /**
   * Dust drawn along the path of this catalogue object (a comet), spread into a wide trail.
   * Where each speck is put is a drawing; the story must say so with `noteKey`.
   */
  readonly dustAlongId?: string;
  /** Key, in the UI strings, of a sentence shown with the story about what in it is a drawing. */
  readonly noteKey?: string;
  /**
   * The track one body makes across the sky of another, drawn as a line far behind it: for a
   * planet seen from Earth. With it, a chapter that stands at `fromId` looks at the middle of
   * the track, not at the body, so the body is seen to move along it.
   */
  readonly skyTrack?: { readonly ofId: string; readonly fromId: string };
  /** Auroral rings drawn round a world's magnetic poles. */
  readonly aurora?: StoryAurora;
  /** Shadows drawn from one body onto another. */
  readonly shadows?: readonly StoryShadow[];
  /** Bodies turned, for this story, to face the way they really did, keyed by catalogue id. */
  readonly turned?: Readonly<Record<string, BodyTurn>>;
  /**
   * Draws the story's whole picture as a diagram: the same bodies in the same directions,
   * with sizes and distances not real, so that all of them can be seen at once (and the
   * screen says so). `in-line` keeps the star on one side and what it lights on the other,
   * for things that happen along that line; `round-the-star` shows the orbits whole.
   */
  readonly diagram?: 'in-line' | 'round-the-star';
  /**
   * Seen from the side, near the level of the planets' paths, in place of from above, so
   * that the way a world's axis leans shows. A `round-the-star` diagram is then looked at
   * square to that lean.
   */
  readonly diagramSeen?: 'side';
  /**
   * Without a diagram: what the whole picture, at true scale, is fitted to. `orbits` puts the
   * star in the middle with every actor's path round it; `star-and-first` keeps the star and
   * the first actor both in view as they near and part. Left out, it is the first actor and
   * what is near it.
   */
  readonly whole?: 'orbits' | 'star-and-first';
  /**
   * Real photos of what the story tells, taken from the ground on Earth, kept small in a
   * corner of the look from Earth for a tap to make big. `captionKey` says plainly what,
   * where and when each photo is of.
   */
  readonly fromEarth?: readonly { readonly media: MediaRef; readonly captionKey: string }[];
  /**
   * Real seconds each chapter takes to play, where the usual pace is too quick to follow:
   * years of a planet's path in one chapter, say. A choice of pace, not a measurement.
   */
  readonly chapterSeconds?: number;
  /** Names the season in each half of this actor, worked out from how it leans to its star. */
  readonly seasonsOf?: string;
  readonly sources: readonly Source[];
}
