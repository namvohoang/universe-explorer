import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Material,
} from 'three';
import type { CelestialObject, SpheroidShape } from '../data/types';
import { eclipticToScene, northPoleEcliptic, poleOf } from '../sim/frames';
import { sceneRadii } from '../sim/layout';
import type { Scale } from '../sim/scale';
import { spinAngleRad } from '../sim/spin';

const SPHERE_SEGMENTS = { width: 64, height: 32 };
/** Plain surface colours until real maps arrive (PLAN.md task 2.3). */
const UNMAPPED_SURFACE = '#b9b4ab';
const UNMAPPED_STAR = '#fff1c9';

const SCENE_UP = new Vector3(0, 1, 0);

/** A round body: positioned by `group`, tilted to its real pole, flattened and spinning. */
export interface Body {
  readonly id: string;
  /** Add to the scene; set its position to move the body. */
  readonly group: Group;
  /** Drawn equatorial radius under the current scale. */
  radius(): number;
  setScale(scale: Scale): void;
  /** Turns the body to where it is at this date. */
  setDate(jd: number): void;
  dispose(): void;
}

function surfaceMaterial(object: CelestialObject): Material {
  // A star shines by itself; everything else is lit by it.
  return object.kind === 'star'
    ? new MeshBasicMaterial({ color: UNMAPPED_STAR })
    : new MeshStandardMaterial({ color: UNMAPPED_SURFACE, roughness: 0.95, metalness: 0 });
}

export function createBody(object: CelestialObject, shape: SpheroidShape, scale: Scale): Body {
  const group = new Group();
  group.name = object.id;

  // The tilt group's +y is the body's north pole. Where the catalogue has no pole, the body
  // stands upright on the ecliptic rather than leaning in a made-up direction.
  const tilt = new Group();
  const pole = poleOf(shape.orientation);
  if (pole) {
    const north = eclipticToScene(northPoleEcliptic(pole));
    tilt.quaternion.setFromUnitVectors(SCENE_UP, new Vector3(north.x, north.y, north.z));
  }
  group.add(tilt);

  const geometry = new SphereGeometry(1, SPHERE_SEGMENTS.width, SPHERE_SEGMENTS.height);
  const material = surfaceMaterial(object);
  // The flattening lives on a holder so the spinning mesh inside stays a unit sphere.
  const flattened = new Group();
  const mesh = new Mesh(geometry, material);
  flattened.add(mesh);
  tilt.add(flattened);

  let equatorial = 0;
  const setScale = (next: Scale): void => {
    const radii = sceneRadii(shape, next);
    equatorial = radii.equatorial;
    flattened.scale.set(radii.equatorial, radii.polar, radii.equatorial);
  };
  setScale(scale);

  return {
    id: object.id,
    group,
    radius: () => equatorial,
    setScale,
    setDate(jd) {
      mesh.rotation.y = spinAngleRad(shape.orientation, jd);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
