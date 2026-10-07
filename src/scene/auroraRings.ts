import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from 'three';
import type { Vec3 } from '../sim/vec3';

/** The green of oxygen glowing high in the air, the commonest colour of an aurora. */
const GLOW_COLOR = 0x5dff8f;
/** How strongly the band is drawn at its middle. A drawing choice. */
const GLOW_OPACITY = 0.75;
const AROUND_SEGMENTS = 180;
const DEG = Math.PI / 180;

/** Where and how big the two bands are, in the body's own frame (one unit is its radius). */
export interface AuroraShape {
  /** Unit vector from the body's centre through its north geomagnetic pole. */
  readonly northPole: Vec3;
  /** The band's nearest and farthest edges from each pole, in degrees. */
  readonly fromPoleDeg: readonly [number, number];
  /** How far out the glow is drawn, in radii of the body. */
  readonly radius: number;
}

/** A band of glow that fades to nothing at both edges, as a texture one pixel wide. */
function fadeTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const fade = context.createLinearGradient(0, 0, 0, canvas.height);
    fade.addColorStop(0, 'rgba(255,255,255,0)');
    fade.addColorStop(0.5, 'rgba(255,255,255,1)');
    fade.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = fade;
    context.fillRect(0, 0, 1, canvas.height);
  }
  return new CanvasTexture(canvas);
}

/** A band round the +y axis of a unit sphere, between two angles from that axis. */
function bandGeometry(nearDeg: number, farDeg: number, radius: number): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let step = 0; step <= AROUND_SEGMENTS; step++) {
    const around = (step / AROUND_SEGMENTS) * 2 * Math.PI;
    for (const [edge, fromPole] of [nearDeg, farDeg].entries()) {
      const angle = fromPole * DEG;
      positions.push(
        radius * Math.sin(angle) * Math.cos(around),
        radius * Math.cos(angle),
        radius * Math.sin(angle) * Math.sin(around),
      );
      uvs.push(step / AROUND_SEGMENTS, edge);
    }
    if (step < AROUND_SEGMENTS) {
      const base = step * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  return geometry;
}

/** The two auroral bands of a world, to be added to its turning frame. */
export interface AuroraRings {
  readonly group: Group;
  dispose(): void;
}

export function createAuroraRings(shape: AuroraShape): AuroraRings {
  const [near, far] = shape.fromPoleDeg;
  const geometry = bandGeometry(near, far, shape.radius);
  const texture = fadeTexture();
  const material = new MeshBasicMaterial({
    color: GLOW_COLOR,
    map: texture,
    transparent: true,
    opacity: GLOW_OPACITY,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false,
  });
  const group = new Group();
  const up = new Vector3(0, 1, 0);
  const pole = new Vector3(shape.northPole.x, shape.northPole.y, shape.northPole.z).normalize();
  // One band round the north geomagnetic pole, and one round the point opposite it.
  for (const towards of [pole, pole.clone().negate()]) {
    const band = new Mesh(geometry, material);
    band.quaternion.copy(new Quaternion().setFromUnitVectors(up, towards));
    group.add(band);
  }
  return {
    group,
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}
