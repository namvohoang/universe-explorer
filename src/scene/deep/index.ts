import type { CelestialObject } from '../../data/types';
import { createBlackHole } from './blackHole';
import type { DeepModel } from './model';
import { createPictureCloud } from './pictureCloud';

export type { DeepModel, DeepModelBasis } from './model';

/** A nebula is a deep cloud; a galaxy is a thin disc with a fat middle that slowly turns. */
const NEBULA = { depth: 0.16, bulge: 1.2, spin: 0, lay: 'upright' } as const;
const GALAXY = { depth: 0.012, bulge: 9, spin: 0.02, lay: 'flat' } as const;

/**
 * The 3D model for something beyond the solar system, or `null` when there is none and only
 * its picture can be shown.
 *
 * @param pictureUrl where its real picture is served from, if it has one
 */
export function createDeepModel(
  object: CelestialObject,
  pictureUrl: string | null,
): DeepModel | null {
  if (object.kind === 'black-hole') return createBlackHole();
  if (pictureUrl === null) return null;
  if (object.kind === 'nebula') return createPictureCloud(pictureUrl, NEBULA);
  if (object.kind === 'galaxy') return createPictureCloud(pictureUrl, GALAXY);
  return null;
}
