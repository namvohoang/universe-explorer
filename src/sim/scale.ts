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

export interface Scale {
  readonly mode: ScaleMode;
  /** Whether one body's size next to another's is the real ratio. */
  readonly sizes: 'true' | 'compressed';
  /** Whether distances are the real ratio to each other and to sizes. */
  readonly distances: 'true' | 'compressed';
  /** Key of the on-screen sentence that tells the kid what is and is not to scale. */
  readonly labelKey: 'scaleLabelTrue' | 'scaleLabelTrueSizes' | 'scaleLabelEasy';
  /** Scene radius for a real radius. */
  sizeToScene(radiusKm: number): number;
  /**
   * Scene units per km for a whole orbit. Multiplying every point of the orbit by one factor
   * keeps the ellipse's real shape; only its size on screen changes.
   */
  orbitFactor(semiMajorAxisKm: number, parentRadiusKm: number): number;
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
 * Compressed distance from a parent, measured in the parent's drawn radius:
 * `gap + reach · (a / parent radius)^exponent`. It grows with `a`, so the order of orbits is
 * always kept, and `gap` above 1 keeps every orbit outside its parent.
 */
interface DistanceCompression {
  readonly gap: number;
  readonly reach: number;
  readonly exponent: number;
}

const TRUE_SIZES_DISTANCES: DistanceCompression = { gap: 1, reach: 0.155, exponent: 0.513 };
/**
 * Easy view squeezes distances as far as real ellipses allow. Orbits keep their true shape, so
 * Mercury's stretched orbit still has to clear Venus's and Earth's Moon has to clear Mars; that
 * sets how tight the inner planets can sit. These values were found by search as the most
 * compact layout in which every gap in the catalogue is at least half the body's drawn radius
 * (scale.test.ts checks there is no overlap).
 */
const EASY_DISTANCES: DistanceCompression = { gap: 1.1, reach: 0.07, exponent: 0.68 };

function requirePositive(name: string, value: number): void {
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a positive number, got ${String(value)}`);
  }
}

function compressedOrbitFactor(
  compression: DistanceCompression,
  parentSceneRadius: number,
  semiMajorAxisKm: number,
  parentRadiusKm: number,
): number {
  const { gap, reach, exponent } = compression;
  const inParentRadii = gap + reach * (semiMajorAxisKm / parentRadiusKm) ** exponent;
  return (parentSceneRadius * inParentRadii) / semiMajorAxisKm;
}

function trueSizesRadius(radiusKm: number): number {
  return radiusKm / TRUE_SIZES_KM_PER_SCENE_UNIT;
}

function easyRadius(radiusKm: number): number {
  return (radiusKm / EASY_SIZE_REFERENCE_KM) ** EASY_SIZE_EXPONENT;
}

const SCALES: Readonly<Record<ScaleMode, Scale>> = {
  true: {
    mode: 'true',
    sizes: 'true',
    distances: 'true',
    labelKey: 'scaleLabelTrue',
    sizeToScene: (radiusKm) => radiusKm * TRUE_SCENE_UNITS_PER_KM,
    orbitFactor: () => TRUE_SCENE_UNITS_PER_KM,
  },
  'true-sizes': {
    mode: 'true-sizes',
    sizes: 'true',
    distances: 'compressed',
    labelKey: 'scaleLabelTrueSizes',
    sizeToScene: trueSizesRadius,
    orbitFactor: (semiMajorAxisKm, parentRadiusKm) =>
      compressedOrbitFactor(
        TRUE_SIZES_DISTANCES,
        trueSizesRadius(parentRadiusKm),
        semiMajorAxisKm,
        parentRadiusKm,
      ),
  },
  easy: {
    mode: 'easy',
    sizes: 'compressed',
    distances: 'compressed',
    labelKey: 'scaleLabelEasy',
    sizeToScene: easyRadius,
    orbitFactor: (semiMajorAxisKm, parentRadiusKm) =>
      compressedOrbitFactor(
        EASY_DISTANCES,
        easyRadius(parentRadiusKm),
        semiMajorAxisKm,
        parentRadiusKm,
      ),
  },
};

export function createScale(mode: ScaleMode): Scale {
  const scale = SCALES[mode];
  return {
    ...scale,
    sizeToScene(radiusKm) {
      requirePositive('radiusKm', radiusKm);
      return scale.sizeToScene(radiusKm);
    },
    orbitFactor(semiMajorAxisKm, parentRadiusKm) {
      requirePositive('semiMajorAxisKm', semiMajorAxisKm);
      requirePositive('parentRadiusKm', parentRadiusKm);
      return scale.orbitFactor(semiMajorAxisKm, parentRadiusKm);
    },
  };
}
