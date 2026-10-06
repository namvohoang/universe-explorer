import { isSatellite, isShowpiece, type CelestialObject } from '../data/types';
import { isDeepSky } from './cardModel';

export type Scene = 'solar' | 'deep' | 'craft';

/** The groups the places are sorted into, in the order their tabs are shown. */
export const GROUPS = {
  solar: ['planets', 'dwarf-planets', 'space-rocks'],
  deep: ['stars', 'star-pictures', 'galaxies', 'space-wonders'],
  craft: ['spaceships'],
} as const satisfies Record<Scene, readonly string[]>;

export type Group = (typeof GROUPS)[Scene][number];

export function sceneOfGroup(group: Group): Scene {
  if ((GROUPS.solar as readonly Group[]).includes(group)) return 'solar';
  return group === 'spaceships' ? 'craft' : 'deep';
}

/**
 * The group a place is listed in, by what kind of thing it is. `null` for something listed
 * only at the body it goes round (a moon, a satellite) and for what is not a place at all (rings).
 */
export function groupOf(object: CelestialObject): Group | null {
  switch (object.kind) {
    case 'star':
      // Our own star heads the planets; the others are far away in Deep Space.
      return isDeepSky(object) ? 'stars' : 'planets';
    case 'neutron-star':
      // What is left of a star is listed with the stars.
      return 'stars';
    case 'planet':
      return 'planets';
    case 'dwarf-planet':
      return 'dwarf-planets';
    case 'asteroid':
    case 'comet':
    case 'belt':
      return 'space-rocks';
    case 'constellation':
    case 'star-cluster':
      return 'star-pictures';
    case 'galaxy':
      return 'galaxies';
    case 'nebula':
    case 'black-hole':
    case 'exoplanet':
      return 'space-wonders';
    case 'spacecraft':
      // One shown only as a model is a place of its own; one in orbit is listed at its planet.
      return isShowpiece(object) ? 'spaceships' : null;
    case 'moon':
    case 'ring-system':
      return null;
  }
}

/** The body a moon or satellite goes round, where it is listed. */
export function hostIdOf(object: CelestialObject): string | null {
  return isSatellite(object) && !isShowpiece(object) ? object.parentId : null;
}

/** The places of a group, in the catalogue's order. */
export function membersOf(
  group: Group,
  catalogue: readonly CelestialObject[],
): readonly CelestialObject[] {
  return catalogue.filter((object) => groupOf(object) === group);
}

/** The moons and satellites going round a body, in the catalogue's order. */
export function satellitesOf(
  hostId: string,
  catalogue: readonly CelestialObject[],
): readonly CelestialObject[] {
  return catalogue.filter((object) => hostIdOf(object) === hostId);
}

export interface PlaceRow {
  readonly scene: Scene;
  /** The group whose tab is chosen (at a body, the group to go back to). */
  readonly group: Group;
  /** Set when the row lists what goes round one body in place of a whole group. */
  readonly host: CelestialObject | null;
  /** True when everything round the host is a moon, so the row can say "its moons". */
  readonly onlyMoons: boolean;
  /** The places on offer; with a host, the host comes first. */
  readonly places: readonly CelestialObject[];
}

/**
 * What the place row offers. It follows the place in focus: a body with moons or satellites
 * (or one of them) lists that family; anything else lists its group. `browse` is a group the
 * kid picked by its tab, shown whatever is in focus.
 */
export function placeRowFor(
  focusId: string | null,
  browse: Group | null,
  catalogue: readonly CelestialObject[],
): PlaceRow {
  const groupRow = (group: Group): PlaceRow => ({
    scene: sceneOfGroup(group),
    group,
    host: null,
    onlyMoons: false,
    places: membersOf(group, catalogue),
  });
  if (browse !== null) return groupRow(browse);
  const focus = catalogue.find((object) => object.id === focusId);
  if (!focus) return groupRow('planets');
  const hostId = hostIdOf(focus) ?? focus.id;
  const host = catalogue.find((object) => object.id === hostId);
  const family = satellitesOf(hostId, catalogue);
  const hostGroup = host ? groupOf(host) : null;
  if (host && hostGroup !== null && family.length > 0) {
    return {
      scene: sceneOfGroup(hostGroup),
      group: hostGroup,
      host,
      onlyMoons: family.every((object) => object.kind === 'moon'),
      places: [host, ...family],
    };
  }
  return groupRow(groupOf(focus) ?? 'planets');
}

/** The place after (step 1) or before (step -1) this one in the row, or `null` at an end. */
export function neighbour(
  row: PlaceRow,
  focusId: string | null,
  step: 1 | -1,
): CelestialObject | null {
  const at = row.places.findIndex((object) => object.id === focusId);
  if (at < 0) return step === 1 ? (row.places[0] ?? null) : null;
  return row.places[at + step] ?? null;
}
