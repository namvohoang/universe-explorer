import type { Measured, Sourced } from './source';

/** How a body spins and which way its axis points. Part of the shape a kid sees. */
export interface Orientation {
  /** Angle between the spin axis and the pole of the body's orbit. */
  readonly axialTiltDeg: Measured<number>;
  /** Direction of the north pole on the sky (ICRF right ascension and declination). */
  readonly poleRaDeg: Measured<number>;
  readonly poleDecDeg: Measured<number>;
  /** Sidereal rotation period, always positive. Direction is given by `rotation`. */
  readonly rotationPeriodHours: Measured<number>;
  readonly rotation: 'prograde' | 'retrograde';
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
  /** Full lengths along the three principal axes, longest first. */
  readonly dimensionsKm: Sourced<readonly [number, number, number]>;
  readonly orientation: Orientation;
}

/** An irregular body drawn from a published 3D shape model. */
export interface ModelShape {
  readonly type: 'model';
  /** The model file, credited in CREDITS.md like any other media. */
  readonly modelFile: `public/media/${string}`;
  /** Full lengths along the three principal axes, longest first, to scale the model. */
  readonly dimensionsKm: Sourced<readonly [number, number, number]>;
  readonly orientation: Orientation;
}

/** A flat ring in its parent's equatorial plane. */
export interface RingShape {
  readonly type: 'ring';
  /** Distances from the parent's centre. */
  readonly innerRadiusKm: Sourced<number>;
  readonly outerRadiusKm: Sourced<number>;
}

/** A band of many small bodies around a star. It has no surface and no sharp edge. */
export interface BeltShape {
  readonly type: 'belt';
  readonly innerRadiusAu: Sourced<number>;
  readonly outerRadiusAu: Sourced<number>;
}

export const EXTENDED_STRUCTURES = [
  'cloud',
  'shell',
  'cluster',
  'spiral',
  'barred-spiral',
  'elliptical',
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
