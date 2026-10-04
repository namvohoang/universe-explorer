import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  EXTENDED_STRUCTURES,
  MEDIA_KINDS,
  OBJECT_KINDS,
  isKnown,
  type CelestialObject,
  type Measured,
  type MediaRef,
  type Moon,
  type ObjectKind,
  type ObjectOfKind,
  type OrbitalElements,
  type Planet,
  type Shape,
  type ShapeType,
  type Sourced,
  type SpheroidShape,
} from './index';

// Values here are placeholders for type tests only, not astronomy.
const sourced = <T>(value: T): Sourced<T> => ({ value, sourceId: 'test' });

// These two switches fail to compile if a kind or a shape is added without being handled.
function kindOf(object: CelestialObject): ObjectKind {
  switch (object.kind) {
    case 'star':
    case 'planet':
    case 'dwarf-planet':
    case 'moon':
    case 'asteroid':
    case 'comet':
    case 'spacecraft':
    case 'ring-system':
    case 'belt':
    case 'exoplanet':
    case 'nebula':
    case 'star-cluster':
    case 'galaxy':
    case 'black-hole':
    case 'constellation':
      return object.kind;
    default:
      return object satisfies never;
  }
}

function shapeTypeOf(shape: Shape): ShapeType {
  switch (shape.type) {
    case 'spheroid':
    case 'triaxial':
    case 'model':
    case 'ring':
    case 'belt':
    case 'extended':
    case 'horizon':
      return shape.type;
    default:
      return shape satisfies never;
  }
}

describe('catalogue types', () => {
  it('lists each kind once', () => {
    expect(new Set(OBJECT_KINDS).size).toBe(OBJECT_KINDS.length);
    expect(new Set(MEDIA_KINDS).size).toBe(MEDIA_KINDS.length);
    expect(new Set(EXTENDED_STRUCTURES).size).toBe(EXTENDED_STRUCTURES.length);
  });

  it('has an object type for every kind', () => {
    expectTypeOf<CelestialObject['kind']>().toEqualTypeOf<ObjectKind>();
    expectTypeOf<ObjectOfKind<'moon'>>().toEqualTypeOf<Moon>();
    expectTypeOf<ObjectOfKind<'planet'>>().toEqualTypeOf<Planet>();
    expect(kindOf).toBeTypeOf('function');
    expect(shapeTypeOf).toBeTypeOf('function');
  });

  it('narrows a shape on its type', () => {
    const innerRadiusOf = (shape: Shape): Sourced<number> | null =>
      shape.type === 'ring' ? shape.innerRadiusKm : null;
    const ring: Shape = { type: 'ring', innerRadiusKm: sourced(1), outerRadiusKm: sourced(2) };
    expect(shapeTypeOf(ring)).toBe('ring');
    expect(innerRadiusOf(ring)).toEqual(sourced(1));
  });

  it('tells a sourced value from an unknown one', () => {
    const known: Measured<number> = sourced(1);
    const unknown: Measured<number> = { value: null, reason: 'never measured' };
    expect(isKnown(known)).toBe(true);
    expect(isKnown(unknown)).toBe(false);
    if (isKnown(known)) expectTypeOf(known.value).toBeNumber();
  });

  it('rejects unsourced and incomplete values at compile time', () => {
    // @ts-expect-error a bare number is not a sourced value
    const bare: Sourced<number> = 1;
    // @ts-expect-error a value needs a sourceId
    const noSource: Sourced<number> = { value: 1 };
    // @ts-expect-error an unknown value needs a reason
    const noReason: Measured<number> = { value: null };
    // @ts-expect-error a spheroid needs both radii
    const oneRadius: Pick<SpheroidShape, 'type' | 'equatorialRadiusKm' | 'polarRadiusKm'> = {
      type: 'spheroid',
      equatorialRadiusKm: sourced(1),
    };
    // @ts-expect-error a moon always has a parent
    const orphan: Pick<Moon, 'parentId'> = { parentId: null };
    // @ts-expect-error a media file must live under public/media/
    const stray: MediaRef['file'] = 'x.png';
    expect([bare, noSource, noReason, oneRadius, orphan, stray]).toHaveLength(6);
  });

  it('requires an orbit to give its size in AU or km', () => {
    const base = {
      frame: { type: 'ecliptic-j2000' },
      epochJd: sourced(0),
      eccentricity: sourced(0),
      inclinationDeg: sourced(0),
      longitudeOfAscendingNodeDeg: sourced(0),
      phase: { form: 'anomalies', argumentOfPeriapsisDeg: sourced(0), meanAnomalyDeg: sourced(0) },
      motion: { type: 'precessing-ellipse', siderealPeriodDays: sourced(1) },
      validity: null,
    } as const;
    const inAu: OrbitalElements = { ...base, semiMajorAxisAu: sourced(1) };
    const inKm: OrbitalElements = { ...base, semiMajorAxisKm: sourced(1) };
    // @ts-expect-error an orbit with no semi-major axis is not an orbit
    const noSize: OrbitalElements = base;
    expect('semiMajorAxisAu' in inAu).toBe(true);
    expect('semiMajorAxisKm' in inKm).toBe(true);
    expect(noSize).toBe(base);
  });
});
