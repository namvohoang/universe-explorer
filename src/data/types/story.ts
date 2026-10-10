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
  /**
   * Plays the chapter's first `storySeconds` slowly, over `overSeconds` real seconds, before
   * the rest takes the usual time: for something quick that is worth watching, such as a
   * rocket leaving the ground or letting a stage go. A choice of pace, not a measurement.
   */
  readonly slowStart?: { readonly storySeconds: number; readonly overSeconds: number };
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
  /**
   * Set when the table gives some places only in part (heights, but no track over the
   * ground): how the rest was drawn, citing what the drawing leans on. The story must say
   * the path is a drawing with `noteKey`.
   */
  readonly drawn?: Sourced<string>;
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
  /**
   * Catalogue id of the craft whose 3D model is drawn, at its true size, in a close look at
   * this one. Which way the model points is a drawing: nose first along the drawn path.
   * A close look at such a craft is shown beside the look from far off, where it is a point.
   */
  readonly modelOfId?: string;
  /**
   * Set when the craft stands on the ground at the first place of its staged path until the
   * path starts: the curve then leaves that place from rest, and the ground there is drawn
   * finely enough to stand beside the craft.
   */
  readonly fromGround?: true;
  /**
   * With `modelOfId`: the parts the craft lets go of as it flies, earliest first. From `atJd`
   * on, the model is drawn without everything below `belowShare` of its length, measured from
   * its tail (0) to its nose (1). The part let go is not drawn falling away.
   */
  readonly sheds?: readonly {
    readonly atJd: Sourced<number>;
    readonly belowShare: Sourced<number>;
    /**
     * Set when the part is left standing on the ground where the craft stood (the legs of a
     * lander that lifts off): it is drawn staying there, for a craft on a `GroundPath`.
     */
    readonly stays?: true;
  }[];
  /**
   * With `modelOfId`: parts it lets go of that are not a stage under the rest, earliest
   * first. `part` names a part of the model's own file (boosters strapped to its sides);
   * `aboveShare` lets go of everything above that share of its length (a tower on its nose
   * that pulls itself off). From `atJd` on the part is not drawn; for a few seconds it is
   * drawn falling behind, or, from the nose, pulling away ahead, which is a drawing.
   */
  readonly letsGo?: readonly (
    | { readonly atJd: Sourced<number>; readonly part: string }
    | { readonly atJd: Sourced<number>; readonly aboveShare: Sourced<number> }
  )[];
  /**
   * With `modelOfId`: when its engines burn, earliest first, with a flame drawn behind the
   * model for as long. The instants are real; the flame's size and colour are a drawing
   * (`bright` for the long yellow flame of a kerosene engine or the blaze of solid boosters,
   * `faint` for the pale, nearly unseen one of a hydrogen engine), and the story must say so
   * with `noteKey`.
   */
  readonly burns?: readonly {
    readonly fromJd: Sourced<number>;
    readonly untilJd: Sourced<number>;
    readonly flame: 'bright' | 'faint';
  }[];
  /**
   * With `fromGround`: the instant the craft starts to lean over. Until then it is drawn
   * standing straight up, as it climbs straight up from its pad.
   */
  readonly uprightUntilJd?: Sourced<number>;
  /**
   * With `modelOfId`: the direction the craft's nose points in the model's own file, when
   * that is not along its +y (a museum's scan of a craft as it stands on show). Measured on
   * the model.
   */
  readonly modelNose?: Sourced<readonly [x: number, y: number, z: number]>;
  /**
   * With `modelOfId`, when the model holds more than this craft (two craft joined): the
   * stretch of the model's length, tail to nose, that is this craft, as shares from 0 to 1.
   * Only that stretch is drawn. Measured on the model.
   */
  readonly modelStretch?: Sourced<readonly [from: number, to: number]>;
  /**
   * With `modelOfId`: how long the longest side of the whole model is drawn, in km, when
   * the catalogue has no size for it. It must rest on a real measurement of the craft.
   */
  readonly modelLongKm?: Sourced<number>;
  /**
   * With `modelOfId`, for a craft on a `GroundPath` that flies joined to another of the
   * story's craft, nose to its top: from `apartFromJd` until `togetherAtJd` the two are
   * apart. While their paths are still at one place the model is drawn standing off from
   * the other's top, nose towards it, by a gap that opens and closes steadily; the gap and
   * the way the two face each other are a drawing.
   */
  readonly joins?: {
    readonly craftId: string;
    readonly apartFromJd: Sourced<number>;
    readonly togetherAtJd: Sourced<number>;
  };
  /**
   * With `groundedAtJd`: somebody who steps out onto the ground beside the craft, drawn as
   * a 3D figure `tallKm` tall from `fromJd` until `untilJd`. Where the figure stands and
   * how it is posed are a drawing; the story must say so with `noteKey`.
   */
  readonly walker?: {
    readonly media: MediaRef;
    readonly tallKm: Sourced<number>;
    readonly fromJd: Sourced<number>;
    readonly untilJd: Sourced<number>;
    /**
     * When they plant a flag, which is drawn from then on, with the footprints that lead
     * to it. The instant is real; what the flag and the prints look like is a drawing.
     */
    readonly flagFromJd?: Sourced<number>;
    /** Others who step out too, each drawn as the same figure in a place of their own. */
    readonly others?: readonly {
      readonly fromJd: Sourced<number>;
      readonly untilJd: Sourced<number>;
    }[];
  };
  /**
   * With `modelOfId`, for a craft on a `GroundPath`: an instant at which it stands on the
   * ground. The ground round that place is drawn finely enough to stand beside the craft,
   * and dust is drawn blown about while the craft's engine burns just above it.
   */
  readonly groundedAtJd?: Sourced<number>;
  /**
   * With `modelOfId`, for a craft on a `GroundPath` with one engine under it: the stretches
   * in which it is drawn leaning, earliest first. `braking`, it flies engine first, lying
   * back and coming upright as it lands; `climbing`, it rises and leans the way it goes.
   * Outside them it is drawn upright. The instants are real; how far it leans is a drawing.
   */
  readonly leans?: readonly {
    readonly fromJd: Sourced<number>;
    readonly untilJd: Sourced<number>;
    readonly kind: 'braking' | 'climbing';
  }[];
  /**
   * With `fromGround`: draws a launch tower beside the craft where it stands, a little
   * taller than the craft. Its shape and size are a drawing from photos, not measurements;
   * the story must say so with `noteKey`.
   */
  readonly tower?: true;
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
   * Keeps a moon's path its true shape in the diagram, with its planet as far off the middle
   * as it really is, for a story about how near and how far the moon gets.
   */
  readonly diagramPaths?: 'true-shape';
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
  /**
   * The air of a world, for a close look at a craft climbing through it from the ground: by
   * day the sky behind the craft is drawn blue, fading to the black of space as the air
   * thins. `scaleHeightKm` is the height over which the air thins to about a third. How blue
   * the sky is drawn is a drawing; the story must say so with `noteKey`.
   */
  readonly air?: {
    readonly ofId: string;
    readonly scaleHeightKm: Sourced<number>;
    /** Draws fair-weather clouds in that sky, low down. Where they are is a drawing. */
    readonly clouds?: true;
  };
  /** Names the season in each half of this actor, worked out from how it leans to its star. */
  readonly seasonsOf?: string;
  readonly sources: readonly Source[];
}
