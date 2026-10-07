import { Color, Scene } from 'three';
import type { CelestialObject } from '../data/types';
import type { Scale } from '../sim/scale';
import { length, subtract } from '../sim/vec3';
import { createShadowCones, type ShadowConesDrawing } from './shadowCones';
import { createSolarSystem, type SolarSystem } from './solarSystem';

const BACKGROUND = '#05070f';
/** The cones are drawn this many radii of the shadowed body beyond its middle. */
const BEYOND_RADII = 3;

/**
 * A drawing of a few bodies in a scene of its own, at a scale that brings them close enough
 * and makes them big enough to see together. It is the same bodies, lit and turned the same
 * way and in the same directions from each other; only sizes and distances are not real.
 */
export interface Diagram {
  readonly scene: Scene;
  readonly system: SolarSystem;
  /** Moves everything to a date, and the drawn shadows with it. */
  setDate(jd: number): void;
  dispose(): void;
}

export function createDiagram(
  catalogue: readonly CelestialObject[],
  scale: Scale,
  shadows: readonly { readonly casterId: string; readonly onId: string }[],
): Diagram {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const system = createSolarSystem(catalogue, scale);
  scene.add(system.group);
  const star = catalogue.find((object) => object.kind === 'star');
  const cones: ShadowConesDrawing[] = shadows.map(() => createShadowCones());
  for (const cone of cones) scene.add(cone.group);
  return {
    scene,
    system,
    setDate(jd) {
      system.setDate(jd);
      if (!star) return;
      for (const [index, shadow] of shadows.entries()) {
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
    dispose() {
      for (const cone of cones) cone.dispose();
      system.dispose();
    },
  };
}
