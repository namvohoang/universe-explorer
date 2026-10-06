import type { CelestialObject } from '../../data/types';
import { isKnown } from '../../data/types';
import { KM_PER_AU } from '../../sim/constants';
import { bodyRadiusKm } from '../../sim/layout';
import { temperatureFromBV } from '../../sim/stars';
import { createBlackHole, createQuietBlackHole } from './blackHole';
import { createConstellation } from './constellation';
import { createCraftModel } from './craftModel';
import type { DeepModel } from './model';
import { createPictureCloud } from './pictureCloud';
import { createPlanetSystem } from './planetSystem';
import { createStarCluster } from './starCluster';
import { createStarSizes, type SizedStar } from './starSizes';

export type { DeepModel, DeepModelNote } from './model';
export { PLANET_ENLARGEMENT } from './planetSystem';

/** A nebula is a deep cloud; a galaxy is a thin disc with a fat middle that slowly turns. */
const NEBULA = { depth: 0.16, bulge: 1.2, spin: 0, lay: 'upright' } as const;
const GALAXY = { depth: 0.012, bulge: 9, spin: 0, lay: 'flat' } as const;
/** A galaxy seen from the side keeps its picture upright: laid flat it would look like a disc it is not. */
const EDGE_ON_GALAXY = { depth: 0.03, bulge: 2, spin: 0, lay: 'upright' } as const;
/**
 * A galaxy that is not a plain disc (a round one, a ring with galaxies beside it, or two caught
 * colliding) is a deep cloud of stars too.
 */
const SHAPELESS_GALAXY = { depth: 0.12, bulge: 2, spin: 0, lay: 'upright' } as const;

/**
 * A far star cluster whose stars are too distant to place one by one: a ball, as deep in the
 * middle as it is wide, thinning out towards the edge like the picture does.
 */
const BALL_CLUSTER = {
  depth: 0.1,
  bulge: 2.5,
  spin: 0,
  lay: 'upright',
  depthPerSpot: true,
} as const;

export interface DeepContext {
  /** The whole catalogue, for the Sun and Earth that other things are measured against. */
  readonly catalogue: readonly CelestialObject[];
  /** Where the object's real picture is served from, if it has one. */
  readonly pictureUrl: string | null;
  /** Where the object's own 3D model is served from, if it has one. */
  readonly modelUrl: string | null;
  /** The name to show for an object in a label. */
  readonly nameOf: (object: CelestialObject) => string;
}

/**
 * The 3D model for something beyond the solar system, or `null` when there is none and only
 * its picture can be shown.
 */
export function createDeepModel(object: CelestialObject, context: DeepContext): DeepModel | null {
  const { catalogue, pictureUrl, modelUrl, nameOf } = context;
  const sun = catalogue.find((o) => o.id === 'sun');
  const earth = catalogue.find((o) => o.id === 'earth');
  const sunRadiusKm = sun ? bodyRadiusKm(sun) : null;
  const earthRadiusKm = earth ? bodyRadiusKm(earth) : null;

  if (object.kind === 'spacecraft') {
    // A scan of the real craft is a record of it; an agency's model is a drawing in 3D.
    const scan = object.media.some((media) => media.role === 'model' && media.kind === 'composite');
    return modelUrl === null ? null : createCraftModel(modelUrl, scan);
  }
  if (object.kind === 'black-hole') {
    // A glowing disc is only drawn where light from one has not been ruled out.
    return object.emitsLight?.value === false ? createQuietBlackHole() : createBlackHole();
  }
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
  // A neutron star is a point too small to draw: its picture shows the glowing cloud around it.
  if (object.kind === 'neutron-star') return createPictureCloud(pictureUrl, NEBULA);
  if (object.kind === 'star-cluster') return createPictureCloud(pictureUrl, BALL_CLUSTER);
  if (object.kind === 'galaxy') {
    if (object.seenFromEarth === 'edge-on') return createPictureCloud(pictureUrl, EDGE_ON_GALAXY);
    // Only a spiral, or a lenticular with its disc and no arms, is thin enough to be laid flat and turned.
    const { structure } = object.shape;
    const disc =
      structure === 'spiral' || structure === 'barred-spiral' || structure === 'lenticular';
    return createPictureCloud(pictureUrl, disc ? GALAXY : SHAPELESS_GALAXY);
  }
  return null;
}
