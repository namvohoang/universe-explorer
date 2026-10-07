import { Color, Scene } from 'three';
import type { CelestialObject } from '../data/types';
import { bodyRadiusKm, scenePositions, type TrackedOffsets } from '../sim/layout';
import { createScale, type Scale } from '../sim/scale';
import { drawnOffset, shadowCones } from '../sim/shadowCone';
import { add, dot, length, normalize, scale as times, subtract, type Vec3 } from '../sim/vec3';
import { createShadowCones, type ShadowConesDrawing } from './shadowCones';
import { createSightLine, type SightLine } from './sightLine';
import { createSolarSystem, type SolarSystem } from './solarSystem';

const BACKGROUND = '#05070f';
/** The cones are drawn this many radii of the shadowed body beyond its middle. */
const BEYOND_RADII = 3;
/** A drawn umbra that has all but come to a point is still given this share of the penumbra's width. */
const LEAST_UMBRA_SHARE = 0.3;
const TRUE_SCALE = createScale('true');
/** A world's axis is drawn out to this many of its radii beyond each pole, in a pale line. */
const AXIS_RADII = 3.4;
const AXIS_COLOR = 0xffffff;

/**
 * A drawing of a few bodies in a scene of its own, at a scale that brings them close enough
 * and makes them big enough to see together. It is the same bodies, lit and turned the same
 * way and in the same directions from each other; only sizes and distances are not real.
 *
 * Where one body's shadow falls on another, the smaller of the two is also moved sideways:
 * at these sizes it would hardly be seen to move, so it is drawn as deep in the drawn shadow
 * as it really is in the real one, and crosses each edge when it really does.
 */
export interface Diagram {
  readonly scene: Scene;
  readonly system: SolarSystem;
  /** Moves everything to a date, and the drawn shadows with it. */
  setDate(jd: number): void;
  /** Puts a line of sight in the drawing. */
  add(sight: SightLine): void;
  dispose(): void;
}

export function createDiagram(
  catalogue: readonly CelestialObject[],
  scale: Scale,
  shadows: readonly { readonly casterId: string; readonly onId: string }[],
  tracked: TrackedOffsets,
  /** Worlds whose axis is drawn as a line through both poles. */
  axes: readonly string[] = [],
): Diagram {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const system = createSolarSystem(catalogue, scale);
  scene.add(system.group);
  const star = catalogue.find((object) => object.kind === 'star');
  const axisLines = axes.map((id) => ({ id, line: createSightLine(AXIS_COLOR) }));
  for (const { line } of axisLines) scene.add(line.line);
  const cones: ShadowConesDrawing[] = shadows.map(() => createShadowCones());
  for (const cone of cones) scene.add(cone.group);
  const realRadius = (id: string): number => {
    const object = catalogue.find((candidate) => candidate.id === id);
    return TRUE_SCALE.sizeToScene((object && bodyRadiusKm(object)) ?? 1);
  };
  /** A unit vector square to `axis`, as near `towards` as can be; `null` if they run the same way. */
  const squareTo = (axis: Vec3, towards: Vec3): Vec3 | null => {
    const across = subtract(towards, times(axis, dot(towards, axis)));
    return length(across) > 0 ? normalize(across) : null;
  };

  /** Draws the smaller body of a shadow's pair where it shows how deep in the shadow it is. */
  const showDepth = (jd: number, casterId: string, onId: string, starId: string): void => {
    const real = scenePositions(catalogue, jd, TRUE_SCALE, tracked);
    const realStar = real.get(starId);
    const realCaster = real.get(casterId);
    const realOn = real.get(onId);
    if (!realStar || !realCaster || !realOn) return;
    // How far the shadowed body really is from the middle line of the shadow, and which way.
    const realAxis = normalize(subtract(realCaster, realStar));
    const behind = dot(subtract(realOn, realCaster), realAxis);
    const off = subtract(subtract(realOn, realCaster), times(realAxis, behind));
    const realCones = shadowCones(
      realRadius(starId),
      realRadius(casterId),
      length(subtract(realCaster, realStar)),
    );
    const drawnStar = system.positionOf(starId);
    const drawnCaster = system.positionOf(casterId);
    const drawnOn = system.positionOf(onId);
    const axis = normalize(subtract(drawnCaster, drawnStar));
    const side = squareTo(axis, off);
    if (!side || !(behind > 0)) return;
    const apart = length(subtract(drawnOn, drawnCaster));
    const onGoesRound = catalogue.find((object) => object.id === onId)?.parentId === casterId;
    if (onGoesRound) {
      // A moon in its planet's shadow: the moon is moved, along its own ring.
      const drawnCones = shadowCones(
        system.radiusOf(starId),
        system.radiusOf(casterId),
        length(subtract(drawnCaster, drawnStar)),
      );
      const penumbra = drawnCones.penumbraRadius(apart);
      const umbra = Math.max(drawnCones.umbraRadius(apart), penumbra * LEAST_UMBRA_SHARE);
      const across = Math.min(
        apart * 0.95,
        drawnOffset(
          length(off),
          realCones.umbraRadius(behind),
          realCones.penumbraRadius(behind),
          umbra,
          penumbra,
        ),
      );
      const along = Math.sqrt(apart * apart - across * across);
      system.moveBody(onId, add(drawnCaster, add(times(axis, along), times(side, across))));
      return;
    }
    // A moon's shadow on its planet: the moon is moved, so that the middle line of its shadow
    // misses the planet's middle by as many of the planet's radii as it really does.
    const miss = (length(off) / realRadius(onId)) * system.radiusOf(onId);
    const lineAt = subtract(drawnOn, times(side, miss));
    system.moveBody(casterId, add(lineAt, times(normalize(subtract(drawnStar, lineAt)), apart)));
  };

  return {
    scene,
    system,
    setDate(jd) {
      system.setDate(jd);
      for (const { id, line } of axisLines) {
        line.set(
          system.groundPointOf(id, { x: 0, y: -AXIS_RADII, z: 0 }),
          system.groundPointOf(id, { x: 0, y: AXIS_RADII, z: 0 }),
        );
      }
      if (!star) return;
      for (const [index, shadow] of shadows.entries()) {
        showDepth(jd, shadow.casterId, shadow.onId, star.id);
        const caster = system.positionOf(shadow.casterId);
        const reach =
          length(subtract(system.positionOf(shadow.onId), caster)) +
          system.radiusOf(shadow.onId) * BEYOND_RADII;
        cones[index]?.update(
          system.positionOf(star.id),
          system.radiusOf(star.id),
          caster,
          system.radiusOf(shadow.casterId),
          reach,
        );
      }
    },
    add(sight) {
      scene.add(sight.line);
    },
    dispose() {
      for (const cone of cones) cone.dispose();
      for (const { line } of axisLines) line.dispose();
      system.dispose();
    },
  };
}
