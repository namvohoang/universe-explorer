import type { CelestialObject } from '../data/types';
import { semiMajorAxisKm } from './elements';
import { bodyRadiusKm } from './layout';

/** One body in a line-up: its real measure, and that measure as a share of the largest shown. */
export interface Compared {
  readonly id: string;
  /** Radius in km for a size line-up; distance from the parent in km for a distance line. */
  readonly km: number;
  /** `km` divided by the largest `km` in the line-up: 1 for the largest, true ratio for the rest. */
  readonly share: number;
}

function withShares(items: readonly { id: string; km: number }[]): Compared[] {
  const largest = Math.max(...items.map((item) => item.km));
  return items.map((item) => ({ ...item, share: item.km / largest }));
}

/** Bodies side by side at their true relative size, in the order given. */
export function sizeLineup(objects: readonly CelestialObject[]): Compared[] {
  return withShares(
    objects.flatMap((object) => {
      const radius = bodyRadiusKm(object);
      return radius === null ? [] : [{ id: object.id, km: radius }];
    }),
  );
}

/** Bodies along a line at their true relative distance from what they orbit, nearest first. */
export function distanceLine(objects: readonly CelestialObject[]): Compared[] {
  return withShares(
    objects
      .flatMap((object) =>
        object.orbit ? [{ id: object.id, km: semiMajorAxisKm(object.orbit) }] : [],
      )
      .sort((a, b) => a.km - b.km),
  );
}
