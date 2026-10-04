import type { CelestialObject } from '../../data/types';
import { isKnown } from '../../data/types';
import { KM_PER_AU } from '../../sim/constants';
import { bodyRadiusKm } from '../../sim/layout';
import { temperatureFromBV } from '../../sim/stars';
import { createBlackHole } from './blackHole';
import { createConstellation } from './constellation';
import type { DeepModel } from './model';
import { createPictureCloud } from './pictureCloud';
import { createPlanetSystem } from './planetSystem';
import { createStarCluster } from './starCluster';
import { createStarSizes, type SizedStar } from './starSizes';

export type { DeepModel, DeepModelNote } from './model';
export { PLANET_ENLARGEMENT } from './planetSystem';

/** A nebula is a deep cloud; a galaxy is a thin disc with a fat middle that slowly turns. */
const NEBULA = { depth: 0.16, bulge: 1.2, spin: 0, lay: 'upright' } as const;
const GALAXY = { depth: 0.012, bulge: 9, spin: 0.02, lay: 'flat' } as const;
/** A galaxy seen from the side keeps its picture upright: laid flat it would look like a disc it is not. */
const EDGE_ON_GALAXY = { depth: 0.03, bulge: 2, spin: 0, lay: 'upright' } as const;

export interface DeepContext {
  /** The whole catalogue, for the Sun and Earth that other things are measured against. */
  readonly catalogue: readonly CelestialObject[];
  /** Where the object's real picture is served from, if it has one. */
  readonly pictureUrl: string | null;
  /** The name to show for an object in a label. */
  readonly nameOf: (object: CelestialObject) => string;
}

/**
 * The 3D model for something beyond the solar system, or `null` when there is none and only
 * its picture can be shown.
 */
export function createDeepModel(object: CelestialObject, context: DeepContext): DeepModel | null {
  const { catalogue, pictureUrl, nameOf } = context;
  const sun = catalogue.find((o) => o.id === 'sun');
  const earth = catalogue.find((o) => o.id === 'earth');
  const sunRadiusKm = sun ? bodyRadiusKm(sun) : null;
  const earthRadiusKm = earth ? bodyRadiusKm(earth) : null;

  if (object.kind === 'black-hole') return createBlackHole();
  if (object.kind === 'constellation') {
    return createConstellation(object.stars.value, object.lines, sun ? nameOf(sun) : '');
  }
  if (object.kind === 'star-cluster' && object.stars) return createStarCluster(object.stars.value);

  if (object.kind === 'exoplanet' && object.system && sunRadiusKm && earthRadiusKm) {
    return createPlanetSystem({
      starRadiusInSuns: object.system.starRadiusInSuns.value,
      starTemperatureK: object.system.starTemperatureK.value,
      planets: object.system.planets.value,
      sunRadiusKm,
      earthRadiusKm,
      kmPerAu: KM_PER_AU,
    });
  }

  if (object.kind === 'star' && sun?.kind === 'star') {
    const { radiusInSuns, effectiveTemperatureK, colourBV } = object;
    // Its colour comes from its temperature, or failing that from its measured colour.
    const temperatureK = isKnown(effectiveTemperatureK)
      ? effectiveTemperatureK.value
      : colourBV
        ? temperatureFromBV(colourBV.value)
        : null;
    if (radiusInSuns && isKnown(radiusInSuns) && temperatureK !== null) {
      const stars: SizedStar[] = [
        {
          name: nameOf(object),
          radiusInSuns: radiusInSuns.value,
          temperatureK,
        },
      ];
      // The Sun stands beside it as the yardstick.
      if (isKnown(sun.effectiveTemperatureK)) {
        stars.unshift({
          name: nameOf(sun),
          radiusInSuns: 1,
          temperatureK: sun.effectiveTemperatureK.value,
        });
      }
      return createStarSizes(stars);
    }
  }

  if (pictureUrl === null) return null;
  if (object.kind === 'nebula') return createPictureCloud(pictureUrl, NEBULA);
  if (object.kind === 'galaxy') {
    return createPictureCloud(
      pictureUrl,
      object.seenFromEarth === 'edge-on' ? EDGE_ON_GALAXY : GALAXY,
    );
  }
  return null;
}
