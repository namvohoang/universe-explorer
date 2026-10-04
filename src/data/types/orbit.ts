import type { Sourced } from './source';

/** The plane and direction the orbit's angles are measured in. Sources differ; always record it. */
export type OrbitFrame =
  | { readonly type: 'ecliptic-j2000' }
  | { readonly type: 'parent-equator' }
  | {
      /** The plane a moon's orbit precesses around, given by its pole on the sky (ICRF). */
      readonly type: 'laplace-plane';
      readonly poleRaDeg: Sourced<number>;
      readonly poleDecDeg: Sourced<number>;
    };

/** Size of the orbit. Sources give AU for orbits around the Sun and km for moons. */
export type SemiMajorAxis =
  { readonly semiMajorAxisAu: Sourced<number> } | { readonly semiMajorAxisKm: Sourced<number> };

/**
 * Where perihelion is and where the body is at the epoch. Sources publish one of two
 * equivalent pairs; store what the source gives rather than converting by hand.
 */
export type OrbitPhase =
  | {
      readonly form: 'longitudes';
      readonly longitudeOfPerihelionDeg: Sourced<number>;
      readonly meanLongitudeDeg: Sourced<number>;
    }
  | {
      readonly form: 'anomalies';
      readonly argumentOfPeriapsisDeg: Sourced<number>;
      readonly meanAnomalyDeg: Sourced<number>;
    };

/** How the elements change with time. */
export type OrbitMotion =
  | {
      /** Linear rates per Julian century, as in the JPL approximate planetary elements. */
      readonly type: 'rates-per-century';
      readonly semiMajorAxisAuPerCentury: Sourced<number>;
      readonly eccentricityPerCentury: Sourced<number>;
      readonly inclinationDegPerCentury: Sourced<number>;
      readonly meanLongitudeDegPerCentury: Sourced<number>;
      readonly longitudeOfPerihelionDegPerCentury: Sourced<number>;
      readonly longitudeOfAscendingNodeDegPerCentury: Sourced<number>;
    }
  | {
      /**
       * A fixed-shape ellipse that the body goes round once per sidereal period, while the
       * ellipse itself turns slowly in its plane (apsides) and about the frame's pole (node).
       */
      readonly type: 'precessing-ellipse';
      readonly siderealPeriodDays: Sourced<number>;
      readonly apsidalPrecession?: Precession;
      readonly nodalPrecession?: Precession;
    };

/**
 * A slow turning of an orbit. JPL's satellite table gives how long one turn takes but not which
 * way it goes, and the way differs from moon to moon. `direction` is therefore not read from a
 * page: it is the one that makes the orbit agree best with JPL Horizons (tests/horizons.test.ts).
 * For a nearly round, untilted orbit the choice barely shows. `forward` is the way the body
 * itself goes round.
 */
export interface Precession {
  readonly periodYears: Sourced<number>;
  readonly direction: 'forward' | 'backward';
}

/** The years a source says its elements are good for. Outside them the app must clamp or warn. */
export interface OrbitValidity {
  readonly fromYear: Sourced<number>;
  readonly toYear: Sourced<number>;
}

interface OrbitalElementsBase {
  readonly frame: OrbitFrame;
  /** The instant the elements refer to, as a Julian date. */
  readonly epochJd: Sourced<number>;
  readonly eccentricity: Sourced<number>;
  readonly inclinationDeg: Sourced<number>;
  readonly longitudeOfAscendingNodeDeg: Sourced<number>;
  readonly phase: OrbitPhase;
  readonly motion: OrbitMotion;
  /** `null` when the source states no limit. */
  readonly validity: OrbitValidity | null;
}

/** A real orbit: an eccentric, inclined ellipse around `parentId`, never a flat circle. */
export type OrbitalElements = OrbitalElementsBase & SemiMajorAxis;
