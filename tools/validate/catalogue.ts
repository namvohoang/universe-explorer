/**
 * Checks the catalogue beyond what the types can: every value points at a real source, every
 * source is used, ids resolve, and the numbers are physically sane. Pure: takes the records.
 */
import type { CelestialObject, Shape, Source } from '../../src/data/types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

interface ValueNode {
  path: string;
  sourceId?: unknown;
  reason?: unknown;
  value: unknown;
}

function isRecord(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

/** Finds every `Sourced` and `Unknown` value in a record, wherever it is nested. */
function valueNodes(node: unknown, path: string): ValueNode[] {
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => valueNodes(item, `${path}[${String(i)}]`));
  }
  if (!isRecord(node)) return [];
  if ('value' in node && ('sourceId' in node || 'reason' in node)) {
    return [{ path, sourceId: node.sourceId, reason: node.reason, value: node.value }];
  }
  return Object.entries(node).flatMap(([key, child]) =>
    key === 'sources' ? [] : valueNodes(child, path === '' ? key : `${path}.${key}`),
  );
}

function isRealDate(text: string): boolean {
  if (!ISO_DATE.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

/** Checks any record that lists its `sources` and wraps its values in `Sourced`. */
export function sourceErrors(object: {
  readonly id: string;
  readonly sources: readonly Source[];
}): string[] {
  const errors: string[] = [];
  const at = `${object.id}:`;
  const ids = new Set<string>();
  if (object.sources.length === 0) errors.push(`${at} has no sources`);
  for (const source of object.sources) {
    if (ids.has(source.id)) errors.push(`${at} source "${source.id}" is listed twice`);
    ids.add(source.id);
    if (source.title.trim() === '') errors.push(`${at} source "${source.id}" has no title`);
    if (!source.url.startsWith('https://')) {
      errors.push(`${at} source "${source.id}" must be an https URL`);
    }
    if (!isRealDate(source.retrieved)) {
      errors.push(`${at} source "${source.id}" needs a retrieval date as YYYY-MM-DD`);
    }
  }

  const used = new Set<string>();
  for (const node of valueNodes(object, '')) {
    if (node.value === null) {
      if (typeof node.reason !== 'string' || node.reason.trim() === '') {
        errors.push(`${at} ${node.path} is unknown but gives no reason`);
      }
      continue;
    }
    if (typeof node.sourceId !== 'string' || !ids.has(node.sourceId)) {
      errors.push(`${at} ${node.path} cites "${String(node.sourceId)}", not one of its sources`);
      continue;
    }
    used.add(node.sourceId);
    if (typeof node.value === 'number' && !Number.isFinite(node.value)) {
      errors.push(`${at} ${node.path} is not a finite number`);
    }
  }
  // A record whose every value is unknown still names the page that was read and found silent.
  if (used.size > 0) {
    for (const id of ids) {
      if (!used.has(id)) errors.push(`${at} source "${id}" is listed but no value cites it`);
    }
  }
  return errors;
}

function shapeErrors(id: string, shape: Shape | null): string[] {
  if (!shape) return [];
  const errors: string[] = [];
  const positive = (name: string, value: number): void => {
    if (!(value > 0)) errors.push(`${id}: ${name} must be greater than 0`);
  };
  switch (shape.type) {
    case 'spheroid':
      positive('equatorialRadiusKm', shape.equatorialRadiusKm.value);
      positive('polarRadiusKm', shape.polarRadiusKm.value);
      if (shape.polarRadiusKm.value > shape.equatorialRadiusKm.value) {
        errors.push(`${id}: polar radius is larger than equatorial radius`);
      }
      break;
    case 'triaxial':
    case 'model': {
      const [a, b, c] = shape.radiiKm.value;
      positive('radiiKm', c);
      if (!(a >= b && b >= c)) errors.push(`${id}: radiiKm must be longest first`);
      break;
    }
    case 'ring':
      positive('innerRadiusKm', shape.innerRadiusKm.value);
      if (shape.outerRadiusKm.value <= shape.innerRadiusKm.value) {
        errors.push(`${id}: ring outer radius must be larger than inner radius`);
      }
      break;
    case 'belt':
      positive('innerRadiusAu', shape.innerRadiusAu.value);
      if (shape.outerRadiusAu.value <= shape.innerRadiusAu.value) {
        errors.push(`${id}: belt outer radius must be larger than inner radius`);
      }
      break;
    case 'extended':
    case 'horizon':
      break;
    default:
      shape satisfies never;
  }
  if ('orientation' in shape) {
    const period = shape.orientation.rotationPeriodHours.value;
    if (period !== null && !(period > 0)) {
      errors.push(`${id}: rotationPeriodHours must be positive; direction goes in "rotation"`);
    }
  }
  return errors;
}

function ringBandErrors(object: CelestialObject): string[] {
  if (object.kind !== 'ring-system') return [];
  const errors: string[] = [];
  const { innerRadiusKm, outerRadiusKm } = object.shape;
  if (object.bands.length === 0) errors.push(`${object.id}: a ring system needs at least one band`);
  for (const band of object.bands) {
    const at = `${object.id}: band "${band.name}"`;
    const [inner, outer] =
      band.type === 'band'
        ? [band.innerRadiusKm.value, band.outerRadiusKm.value]
        : [band.radiusKm.value, band.radiusKm.value];
    if (band.type === 'band' && outer <= inner) errors.push(`${at} outer radius must exceed inner`);
    if (inner < innerRadiusKm.value || outer > outerRadiusKm.value) {
      errors.push(`${at} lies outside the system's own inner and outer radius`);
    }
    if (band.opticalDepth.value !== null) {
      const [min, max] = band.opticalDepth.value;
      if (!(min >= 0 && max >= min)) errors.push(`${at} optical depth must be a range from 0 up`);
    }
  }
  return errors;
}

function orbitErrors(object: CelestialObject): string[] {
  const { id, orbit } = object;
  if (!orbit) return [];
  const errors: string[] = [];
  if (object.parentId === null) errors.push(`${id}: has an orbit but no parent to orbit`);
  const e = orbit.eccentricity.value;
  if (!(e >= 0 && e < 1)) errors.push(`${id}: eccentricity must be in [0, 1) for a bound orbit`);
  const a = 'semiMajorAxisAu' in orbit ? orbit.semiMajorAxisAu.value : orbit.semiMajorAxisKm.value;
  if (!(a > 0)) errors.push(`${id}: semi-major axis must be greater than 0`);
  if (orbit.motion.type === 'precessing-ellipse' && !(orbit.motion.siderealPeriodDays.value > 0)) {
    errors.push(`${id}: siderealPeriodDays must be greater than 0`);
  }
  if (orbit.validity && orbit.validity.toYear.value <= orbit.validity.fromYear.value) {
    errors.push(`${id}: orbit validity must end after it starts`);
  }
  return errors;
}

function sizeAgainstParent(object: CelestialObject, parent: CelestialObject): string[] {
  if (object.shape?.type !== 'spheroid' || parent.shape?.type !== 'spheroid') return [];
  return object.shape.equatorialRadiusKm.value >= parent.shape.equatorialRadiusKm.value
    ? [`${object.id}: is not smaller than ${parent.id}, which it orbits`]
    : [];
}

export function checkCatalogue(catalogue: readonly CelestialObject[]): string[] {
  const errors: string[] = [];
  const byId = new Map<string, CelestialObject>();
  for (const object of catalogue) {
    if (!ID.test(object.id)) errors.push(`${object.id}: id must be lowercase words joined by "-"`);
    if (byId.has(object.id)) errors.push(`${object.id}: id is used more than once`);
    byId.set(object.id, object);
  }
  for (const object of catalogue) {
    if (object.name.trim() === '') errors.push(`${object.id}: has no name`);
    errors.push(...sourceErrors(object), ...shapeErrors(object.id, object.shape));
    errors.push(...orbitErrors(object));
    errors.push(...ringBandErrors(object));
    if (object.kind === 'belt' && object.members.value.length === 0) {
      errors.push(`${object.id}: a belt needs members to draw`);
    }
    if (object.parentId !== null) {
      const parent = byId.get(object.parentId);
      if (!parent) errors.push(`${object.id}: parent "${object.parentId}" is not in the catalogue`);
      else errors.push(...sizeAgainstParent(object, parent));
    }
  }
  return errors;
}
