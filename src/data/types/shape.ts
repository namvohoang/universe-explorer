import type { Measured, Sourced } from './source';

/**
 * How a body spins and which way its axis points. Part of the shape a kid sees.
 *
 * Two conventions meet here, as they do in the sources:
 * - `poleRaDeg`/`poleDecDeg` give the IAU north pole (the pole on the north side of the solar
 *   system's invariable plane), and `rotation` says which way the body turns about that pole.
 *   Rendering uses these.
 * - `axialTiltDeg` is the obliquity as published, measured to the right-hand spin axis, so it is
 *   above 90° for a retrograde body. It already includes the spin direction: never combine it
 *   with `rotation`, or the two cancel.
 */
export interface Orientation {
  /** Angle between the spin axis and the pole of the body's orbit (see the note above). */
  readonly axialTiltDeg: Measured<number>;
  /** Direction of the IAU north pole on the sky (ICRF right ascension and declination). */
  readonly poleRaDeg: Measured<number>;
  readonly poleDecDeg: Measured<number>;
  /** Sidereal rotation period, always positive. Direction is given by `rotation`. */
  readonly rotationPeriodHours: Measured<number>;
  /**
   * Which way it turns about its north pole. `synchronous` means it turns exactly once per
   * orbit, keeping the same face (and its longest axis) towards what it goes around.
   */
  readonly rotation: 'prograde' | 'retrograde' | 'synchronous';
}

/** A round body, flattened at the poles by its spin. */
export interface SpheroidShape {
  readonly type: 'spheroid';
  readonly equatorialRadiusKm: Sourced<number>;
  readonly polarRadiusKm: Sourced<number>;
  readonly orientation: Orientation;
}

/** An irregular body with no published shape model, described by three axis lengths. */
export interface TriaxialShape {
  readonly type: 'triaxial';
  /**
   * Radii along the three principal axes, longest first. For a moon that keeps one face to
   * its planet these are: towards the planet, along the orbit, and pole to pole.
   */
  readonly radiiKm: Sourced<readonly [number, number, number]>;
  readonly orientation: Orientation;
}

/** An irregular body drawn from a published 3D shape model. */
export interface ModelShape {
  readonly type: 'model';
  /** The model file, credited in CREDITS.md like any other media. */
  readonly modelFile: `public/media/${string}`;
  /** Radii along the three principal axes, longest first, to scale the model. */
  readonly radiiKm: Sourced<readonly [number, number, number]>;
  readonly orientation: Orientation;
}

/** A flat ring in its parent's equatorial plane. */
export interface RingShape {
  readonly type: 'ring';
  /** Distances from the parent's centre. */
  readonly innerRadiusKm: Sourced<number>;
  readonly outerRadiusKm: Sourced<number>;
}

/** How much light a ring blocks, as the range of optical depth the source gives. */
export type OpticalDepthRange = readonly [min: number, max: number];

/** One part of a ring system. */
export type RingBand =
  | {
      /** A broad ring with two edges. */
      readonly type: 'band';
      readonly name: string;
      readonly innerRadiusKm: Sourced<number>;
      readonly outerRadiusKm: Sourced<number>;
      readonly opticalDepth: Measured<OpticalDepthRange>;
    }
  | {
      /** A ring too narrow to have drawable edges at any scale: a line at one radius. */
      readonly type: 'ringlet';
      readonly name: string;
      readonly radiusKm: Sourced<number>;
      readonly opticalDepth: Measured<OpticalDepthRange>;
    };

/** A band of many small bodies around a star. It has no surface and no sharp edge. */
export interface BeltShape {
  readonly type: 'belt';
  readonly innerRadiusAu: Sourced<number>;
  readonly outerRadiusAu: Sourced<number>;
}

/**
 * The orbit of one member of a belt, around the belt's parent, in the ecliptic of J2000:
 * [semi-major axis (AU), eccentricity, inclination, longitude of ascending node, argument of
 * perihelion, mean anomaly (all degrees), mean motion (degrees per day), epoch (Julian date)].
 */
export type BeltOrbit = readonly [
  semiMajorAxisAu: number,
  eccentricity: number,
  inclinationDeg: number,
  nodeDeg: number,
  periapsisDeg: number,
  meanAnomalyDeg: number,
  meanMotionDegPerDay: number,
  epochJd: number,
];

export const EXTENDED_STRUCTURES = [
  'cloud',
  'shell',
  'cluster',
  'spiral',
  'barred-spiral',
  'elliptical',
  'ring',
  'irregular',
] as const;
export type ExtendedStructure = (typeof EXTENDED_STRUCTURES)[number];

/** Something far too big and diffuse to have a surface: a nebula, a star cluster, a galaxy. */
export interface ExtendedShape {
  readonly type: 'extended';
  readonly structure: ExtendedStructure;
  readonly diameterLy: Measured<number>;
  /** For flattened systems such as a galaxy's disc. */
  readonly thicknessLy?: Measured<number>;
}

/** A black hole. The size of its event horizon is derived from its mass in `src/sim`. */
export interface HorizonShape {
  readonly type: 'horizon';
  readonly massSolarMasses: Measured<number>;
}

export type Shape =
  SpheroidShape | TriaxialShape | ModelShape | RingShape | BeltShape | ExtendedShape | HorizonShape;

export type ShapeType = Shape['type'];

/** Shapes a solid body can have. */
export type BodyShape = SpheroidShape | TriaxialShape | ModelShape;
