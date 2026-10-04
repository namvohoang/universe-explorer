import type { MediaRef } from './media';
import type { OrbitalElements } from './orbit';
import type {
  BeltOrbit,
  BeltShape,
  BodyShape,
  ExtendedShape,
  HorizonShape,
  RingBand,
  RingShape,
  SpheroidShape,
} from './shape';
import type { Measured, Source, Sourced } from './source';

/** Every kind of object a kid can meet. Add a kind rather than bending an existing one. */
export const OBJECT_KINDS = [
  'star',
  'planet',
  'dwarf-planet',
  'moon',
  'asteroid',
  'comet',
  'ring-system',
  'belt',
  'exoplanet',
  'nebula',
  'star-cluster',
  'galaxy',
  'black-hole',
] as const;
export type ObjectKind = (typeof OBJECT_KINDS)[number];

/** Where something outside the solar system is: direction on the sky (ICRF) and distance. */
export interface SkyPosition {
  readonly raDeg: Measured<number>;
  readonly decDeg: Measured<number>;
  readonly distanceLy: Measured<number>;
}

interface ObjectBase {
  /** Stable, lowercase, used in file names and string keys. */
  readonly id: string;
  /** The official (IAU) name. */
  readonly name: string;
  /** What it orbits or belongs to; `null` for the top of a system. */
  readonly parentId: string | null;
  /** Orbit around `parentId`; `null` when it has none we model. */
  readonly orbit: OrbitalElements | null;
  readonly media: readonly MediaRef[];
  readonly sources: readonly Source[];
}

/**
 * One star of a cluster as a space telescope measured it:
 * [right ascension, declination (degrees, ICRS), parallax (milliarcseconds), brightness
 * (Gaia G magnitude; smaller is brighter), colour (Gaia BP−RP; smaller is bluer)].
 */
export type ClusterStar = readonly [
  raDeg: number,
  decDeg: number,
  parallaxMas: number,
  gMagnitude: number,
  bpRp: number,
];

/** One planet of another star: [name, radius in Earths, orbit's semi-major axis (AU), period (days)]. */
export type SystemPlanet = readonly [
  name: string,
  radiusInEarths: number,
  semiMajorAxisAu: number,
  periodDays: number,
];

export interface Star extends ObjectBase {
  readonly kind: 'star';
  /** `null` for a star so far away that it is only ever seen as a point of light. */
  readonly shape: SpheroidShape | null;
  readonly massKg: Measured<number>;
  readonly effectiveTemperatureK: Measured<number>;
  readonly spectralType: Measured<string>;
  /** `null` for the Sun, which is the origin of the solar-system frame. */
  readonly sky: SkyPosition | null;
  /** How wide the star is next to the Sun, for a star with no `shape` of its own. */
  readonly radiusInSuns?: Measured<number>;
}

export interface Planet extends ObjectBase {
  readonly kind: 'planet';
  readonly shape: SpheroidShape;
  readonly massKg: Measured<number>;
}

export interface DwarfPlanet extends ObjectBase {
  readonly kind: 'dwarf-planet';
  readonly shape: BodyShape;
  readonly massKg: Measured<number>;
}

export interface Moon extends ObjectBase {
  readonly kind: 'moon';
  readonly parentId: string;
  readonly shape: BodyShape;
  readonly massKg: Measured<number>;
}

export interface Asteroid extends ObjectBase {
  readonly kind: 'asteroid';
  readonly shape: BodyShape;
  readonly massKg: Measured<number>;
}

export interface Comet extends ObjectBase {
  readonly kind: 'comet';
  /** Shape of the solid nucleus. The coma and tail are drawn from its distance to the Sun. */
  readonly shape: BodyShape;
}

export interface RingSystem extends ObjectBase {
  readonly kind: 'ring-system';
  readonly parentId: string;
  readonly orbit: null;
  readonly shape: RingShape;
  /** The rings that make up the system, from the inside out. `shape` spans all of them. */
  readonly bands: readonly RingBand[];
}

export interface Belt extends ObjectBase {
  readonly kind: 'belt';
  readonly parentId: string;
  readonly orbit: null;
  readonly shape: BeltShape;
  /** Real orbits of a sample of the belt's members; each is drawn as one dot. */
  readonly members: Sourced<readonly BeltOrbit[]>;
}

export interface Exoplanet extends ObjectBase {
  readonly kind: 'exoplanet';
  /** Most exoplanets have never been seen as more than a point; often only one radius is known. */
  readonly shape: null;
  readonly radiusKm: Measured<number>;
  readonly massKg: Measured<number>;
  readonly sky: SkyPosition;
  /** When the record stands for a whole family of planets: their star and each planet. */
  readonly system?: {
    readonly starRadiusInSuns: Sourced<number>;
    readonly starTemperatureK: Sourced<number>;
    readonly planets: Sourced<readonly SystemPlanet[]>;
  };
}

export interface Nebula extends ObjectBase {
  readonly kind: 'nebula';
  readonly orbit: null;
  readonly shape: ExtendedShape;
  readonly sky: SkyPosition;
}

export interface StarCluster extends ObjectBase {
  readonly kind: 'star-cluster';
  readonly orbit: null;
  readonly shape: ExtendedShape;
  readonly sky: SkyPosition;
  /** Measured stars of the cluster, each drawn where it is. */
  readonly stars?: Sourced<readonly ClusterStar[]>;
}

export interface Galaxy extends ObjectBase {
  readonly kind: 'galaxy';
  readonly orbit: null;
  readonly shape: ExtendedShape;
  /** `null` for the Milky Way, which we are inside. */
  readonly sky: SkyPosition | null;
}

export interface BlackHole extends ObjectBase {
  readonly kind: 'black-hole';
  readonly shape: HorizonShape;
  readonly sky: SkyPosition;
}

export type CelestialObject =
  | Star
  | Planet
  | DwarfPlanet
  | Moon
  | Asteroid
  | Comet
  | RingSystem
  | Belt
  | Exoplanet
  | Nebula
  | StarCluster
  | Galaxy
  | BlackHole;

/** The object type for one kind, e.g. `ObjectOfKind<'moon'>` is `Moon`. */
export type ObjectOfKind<K extends ObjectKind> = Extract<CelestialObject, { kind: K }>;
