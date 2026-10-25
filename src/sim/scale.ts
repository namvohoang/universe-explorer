import { KM_PER_AU } from './constants';

/**
 * The only place real sizes and distances are turned into scene units (CLAUDE.md: true
 * ratios). Space is mostly empty: at true scale the planets are specks. The other modes trade
 * truth for visibility, and each says so through `labelKey`, which the UI must always show.
 *
 * Every constant below is a drawing choice, not astronomy.
 */

export const SCALE_MODES = ['true', 'true-sizes', 'easy'] as const;
export type ScaleMode = (typeof SCALE_MODES)[number];

/** A story's drawing: `diagram`, or `moon-path`, the same with a moon's path kept its true shape. */
export type DrawingMode = 'diagram' | 'moon-path';

export interface Scale {
  /** One of the modes a viewer picks, or one of the drawings, which only a story uses. */
  readonly mode: ScaleMode | DrawingMode;
  /** Whether one body's size next to another's is the real ratio. */
  readonly sizes: 'true' | 'compressed';
  /** Whether distances are the real ratio to each other and to sizes. */
  readonly distances: 'true' | 'compressed';
  /** Key of the on-screen sentence that tells the kid what is and is not to scale. */
  readonly labelKey:
    'scaleLabelTrue' | 'scaleLabelTrueSizes' | 'scaleLabelEasy' | 'scaleLabelDiagram';
  /** Scene radius for a real radius. */
  sizeToScene(radiusKm: number): number;
  /**
   * Scene distance from a parent's centre for a real distance from it. Applied to each
   * position on its own, so directions are always true and nothing can end up inside its
   * parent. In a compressing mode a stretched orbit therefore looks rounder than it is.
   */
  distanceToScene(distanceKm: number, parentRadiusKm: number): number;
}

/** True scale: 1 AU is this many scene units, for sizes and distances alike. */
const TRUE_SCENE_UNITS_PER_AU = 1000;
const TRUE_SCENE_UNITS_PER_KM = TRUE_SCENE_UNITS_PER_AU / KM_PER_AU;

/** True sizes: every radius is divided by this, so an Earth-sized body is about one unit. */
const TRUE_SIZES_KM_PER_SCENE_UNIT = 5000;

/** Easy view: radius grows with the square root of the real radius, so giants do not swamp the rest. */
const EASY_SIZE_REFERENCE_KM = 5000;
const EASY_SIZE_EXPONENT = 0.5;

/**
 * Compressed distance from a parent, measured in the parent's drawn radius. Out to `near` radii
 * the distance is the real one, so close moons keep their true place beside the planet and its
 * rings. Beyond that it grows as a power below 1: far orbits are pulled in, but a farther orbit
 * is always drawn farther, so the order of orbits is kept.
 */
interface DistanceCompression {
  readonly near: number;
  readonly exponent: number;
}

/**
 * Found by search as the most compact layout in which nothing in the catalogue overlaps: every
 * gap is at least half the drawn radius of the body beside it (scale.test.ts checks there is no
 * overlap). Each planet's moons have to clear the next planet's, which is what sets how tightly
 * the planets can sit.
 */
const TRUE_SIZES_DISTANCES: DistanceCompression = { near: 2.5, exponent: 0.2 };
const EASY_DISTANCES: DistanceCompression = { near: 2.5, exponent: 0.36 };

/**
 * Diagram: a drawing like one in a book, with the Sun, a planet and its moon all big enough to
 * see in one small picture. Sizes are pulled much closer together than in the easy view (the
 * Sun is drawn under three times as wide as Earth) and distances much further in. Directions
 * stay true, so things line up when they really do.
 */
const DIAGRAM_SIZE_REFERENCE_KM = 5000;
const DIAGRAM_SIZE_EXPONENT = 0.2;
const DIAGRAM_DISTANCES: DistanceCompression = { near: 1.5, exponent: 0.2 };

/**
 * Moon path: the diagram, but for a story about how near and how far a moon gets. Raised to a
 * power, a path a tenth longer one way is drawn a fiftieth longer, and looks a perfect circle.
 * So out to this many of the parent's radii, a little past where Earth's Moon gets, every
 * distance is shrunk by the same factor: a moon's path keeps its true shape, with its planet
 * as far off the middle as it really is. Beyond, distances are the diagram's, and the two meet
 * there. Only for a moon that keeps well out from its planet: one near it would be drawn inside.
 */
const MOON_PATH_REACH_RADII = 64;

function moonPathDistance(distanceKm: number, parentRadiusKm: number): number {
  const reachKm = MOON_PATH_REACH_RADII * parentRadiusKm;
  const drawn = (km: number): number =>
    compressedDistance(DIAGRAM_DISTANCES, diagramRadius(parentRadiusKm), km, parentRadiusKm);
  return distanceKm >= reachKm ? drawn(distanceKm) : (drawn(reachKm) * distanceKm) / reachKm;
}

function diagramRadius(radiusKm: number): number {
  return (radiusKm / DIAGRAM_SIZE_REFERENCE_KM) ** DIAGRAM_SIZE_EXPONENT;
}

function requirePositive(name: string, value: number): void {
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a positive number, got ${String(value)}`);
  }
}

function compressedDistance(
  compression: DistanceCompression,
  parentSceneRadius: number,
  distanceKm: number,
  parentRadiusKm: number,
): number {
  const { near, exponent } = compression;
  const real = distanceKm / parentRadiusKm;
  return parentSceneRadius * (real <= near ? real : near * (real / near) ** exponent);
}

function trueSizesRadius(radiusKm: number): number {
  return radiusKm / TRUE_SIZES_KM_PER_SCENE_UNIT;
}

function easyRadius(radiusKm: number): number {
  return (radiusKm / EASY_SIZE_REFERENCE_KM) ** EASY_SIZE_EXPONENT;
}

const SCALES: Readonly<Record<ScaleMode | DrawingMode, Scale>> = {
  'moon-path': {
    mode: 'moon-path',
    sizes: 'compressed',
    distances: 'compressed',
    labelKey: 'scaleLabelDiagram',
    sizeToScene: diagramRadius,
    distanceToScene: moonPathDistance,
  },
  diagram: {
    mode: 'diagram',
    sizes: 'compressed',
    distances: 'compressed',
    labelKey: 'scaleLabelDiagram',
    sizeToScene: diagramRadius,
    distanceToScene: (distanceKm, parentRadiusKm) =>
      compressedDistance(
        DIAGRAM_DISTANCES,
        diagramRadius(parentRadiusKm),
        distanceKm,
        parentRadiusKm,
      ),
  },
  true: {
    mode: 'true',
    sizes: 'true',
    distances: 'true',
    labelKey: 'scaleLabelTrue',
    sizeToScene: (radiusKm) => radiusKm * TRUE_SCENE_UNITS_PER_KM,
    distanceToScene: (distanceKm) => distanceKm * TRUE_SCENE_UNITS_PER_KM,
  },
  'true-sizes': {
    mode: 'true-sizes',
    sizes: 'true',
    distances: 'compressed',
    labelKey: 'scaleLabelTrueSizes',
    sizeToScene: trueSizesRadius,
    distanceToScene: (distanceKm, parentRadiusKm) =>
      compressedDistance(
        TRUE_SIZES_DISTANCES,
        trueSizesRadius(parentRadiusKm),
        distanceKm,
        parentRadiusKm,
      ),
  },
  easy: {
    mode: 'easy',
    sizes: 'compressed',
    distances: 'compressed',
    labelKey: 'scaleLabelEasy',
    sizeToScene: easyRadius,
    distanceToScene: (distanceKm, parentRadiusKm) =>
      compressedDistance(EASY_DISTANCES, easyRadius(parentRadiusKm), distanceKm, parentRadiusKm),
  },
};

export function createScale<Mode extends ScaleMode | DrawingMode>(
  mode: Mode,
): Scale & { readonly mode: Mode } {
  const scale = SCALES[mode];
  return {
    ...scale,
    mode,
    sizeToScene(radiusKm) {
      requirePositive('radiusKm', radiusKm);
      return scale.sizeToScene(radiusKm);
    },
    distanceToScene(distanceKm, parentRadiusKm) {
      requirePositive('distanceKm', distanceKm);
      requirePositive('parentRadiusKm', parentRadiusKm);
      return scale.distanceToScene(distanceKm, parentRadiusKm);
    },
  };
}

/**
 * The tides close-up: a drawing of one shore, with no real size of its own. How high the water
 * stands follows the tide the app works out, but no real height is drawn. The Sun and the Moon
 * are drawn bigger in its sky, both by the same factor, so they keep their real sizes next to
 * each other: about the same. The screen says both are drawn.
 */
export const TIDE_SHORE = {
  /** How high the water stands on the drawing where the tide is level, in drawing units. */
  levelAtZero: 0.05,
  /** How much higher it stands for a tide of 1 (the Moon's own high tide alone). */
  levelPerTide: 0.9,
  /** How much bigger the Sun and the Moon are drawn in the sky than they really look. */
  skyMagnification: 16,
} as const;

/**
 * How high the close-up draws the water at its shore, in drawing units, for a tide of
 * `height` (as `tideHeights` gives it).
 */
export function tideShoreLevel(height: number): number {
  return TIDE_SHORE.levelAtZero + TIDE_SHORE.levelPerTide * height;
}

/**
 * Real land up close: one unit is one kilometre across, and heights are drawn `times` as tall
 * as they are, by one factor for every height in the block, so their order and their ratios
 * stay true (a peak twice as high as another is still drawn twice as high). The screen says
 * how many times taller they are drawn.
 */
export function landHeightKm(metres: number, times: number): number {
  if (!(times > 0)) throw new RangeError('Heights are drawn some number of times as tall');
  return (metres / 1000) * times;
}

/** How many times taller than they are the land stories draw their heights. */
export const LAND_HEIGHTS_DRAWN_TIMES = 2;
