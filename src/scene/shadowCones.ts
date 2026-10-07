import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { shadowCones } from '../sim/shadowCone';
import type { Vec3 } from '../sim/vec3';

/** The pale edge is a faint haze; the dark middle is painted back to near the dark of space. */
const PENUMBRA_COLOR = 0x9fb4d8;
const PENUMBRA_OPACITY = 0.08;
const UMBRA_COLOR = 0x05070f;
const UMBRA_OPACITY = 0.7;
/** The edges of both shadows are thin lines, as in a diagram in a book. */
const EDGE_COLOR = 0xffc53d;
const EDGE_OPACITY = 0.55;

/**
 * The shadow one ball casts, drawn in a diagram as it is in a book: the two cones cut through
 * their middle, as flat shapes lying level behind the ball. The balls stand half above the
 * sheet, so it never hides them.
 */
export interface ShadowConesDrawing {
  readonly group: Group;
  /**
   * Draws the shadows behind a ball at `caster`, lit from `light`, out to `reach` beyond the
   * ball's middle. All in scene units.
   */
  update(light: Vec3, lightRadius: number, caster: Vec3, casterRadius: number, reach: number): void;
  dispose(): void;
}

/** A flat four-cornered sheet whose corners are set later. */
function createSheet(color: number, opacity: number, order: number) {
  const positions = new BufferAttribute(new Float32Array(4 * 3), 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positions);
  geometry.setIndex([0, 1, 2, 1, 3, 2]);
  const material = new MeshBasicMaterial({
    color,
    opacity,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = order;
  // The sheet is long and thin and changes every frame; it is always drawn.
  mesh.frustumCulled = false;
  // Its two long edges, drawn from the same corners.
  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', positions);
  edgeGeometry.setIndex([0, 2, 1, 3]);
  const edgeMaterial = new LineBasicMaterial({
    color: EDGE_COLOR,
    opacity: EDGE_OPACITY,
    transparent: true,
    depthWrite: false,
  });
  const edges = new LineSegments(edgeGeometry, edgeMaterial);
  edges.renderOrder = order + 2;
  edges.frustumCulled = false;
  return {
    mesh,
    edges,
    /** From `from` along the line with this half-width, to `to` with that one. */
    shape(
      origin: Vector3,
      along: Vector3,
      across: Vector3,
      from: number,
      fromRadius: number,
      to: number,
      toRadius: number,
    ): void {
      const corners = [
        [from, fromRadius],
        [from, -fromRadius],
        [to, toRadius],
        [to, -toRadius],
      ] as const;
      for (const [corner, [far, wide]] of corners.entries()) {
        positions.setXYZ(
          corner,
          origin.x + along.x * far + across.x * wide,
          origin.y + along.y * far + across.y * wide,
          origin.z + along.z * far + across.z * wide,
        );
      }
      positions.needsUpdate = true;
    },
    dispose(): void {
      geometry.dispose();
      material.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
    },
  };
}

const UP = new Vector3(0, 1, 0);

export function createShadowCones(): ShadowConesDrawing {
  const group = new Group();
  const penumbra = createSheet(PENUMBRA_COLOR, PENUMBRA_OPACITY, 1);
  const umbra = createSheet(UMBRA_COLOR, UMBRA_OPACITY, 2);
  group.add(penumbra.mesh, umbra.mesh, penumbra.edges, umbra.edges);
  const origin = new Vector3();
  const along = new Vector3();
  const across = new Vector3();
  return {
    group,
    update(light, lightRadius, caster, casterRadius, reach) {
      origin.set(caster.x, caster.y, caster.z);
      along.set(caster.x - light.x, caster.y - light.y, caster.z - light.z);
      const apart = along.length();
      // The sheet lies level: across the line of the shadow, and across "up".
      across.crossVectors(along, UP);
      group.visible =
        lightRadius > casterRadius && apart > lightRadius + casterRadius && across.lengthSq() > 0;
      if (!group.visible) return;
      along.divideScalar(apart);
      across.normalize();
      const cones = shadowCones(lightRadius, casterRadius, apart);
      const umbraTo = Math.min(reach, cones.umbraTo);
      penumbra.shape(
        origin,
        along,
        across,
        cones.penumbraFrom,
        cones.penumbraRadius(cones.penumbraFrom),
        reach,
        cones.penumbraRadius(reach),
      );
      umbra.shape(
        origin,
        along,
        across,
        cones.umbraFrom,
        cones.umbraRadius(cones.umbraFrom),
        umbraTo,
        cones.umbraRadius(umbraTo),
      );
    },
    dispose() {
      penumbra.dispose();
      umbra.dispose();
    },
  };
}
