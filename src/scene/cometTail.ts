import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  Matrix4,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import {
  COMA_RADIUS_KM,
  TAIL_LENGTH_AU,
  behindDirection,
  dustGrain,
  tailDirections,
  tailStrength,
} from '../sim/comet';
import { KM_PER_AU } from '../sim/constants';
import type { Vec3 } from '../sim/vec3';

/**
 * Drawing choices. The gas tail is thin, straight and bluish, in a few streamers; the dust tail
 * is wide, cream and curved. Each is a cloud of soft points, as a real tail has no edge.
 */
const GAS = {
  rgb: [0.42, 0.66, 1],
  points: 2600,
  /** Half-width at the comet and at the far end, as shares of the tail's length. */
  width: [0.004, 0.03],
  /** Drawn size of one point, as a share of the tail's length. */
  pointSize: 0.014,
  opacity: 0.2,
  streamers: 7,
  /** How far a streamer leans from straight, as a share of the length at the far end. */
  lean: 0.035,
} as const;
const DUST = {
  rgb: [1, 0.9, 0.72],
  points: 4200,
  width: [0.006, 0.05],
  pointSize: 0.024,
  opacity: 0.14,
  /** The dust tail is drawn this share of the gas tail's length. */
  length: 0.8,
  /** How readily the slowest and the quickest grains fall behind (see `dustGrain`). */
  lag: [0.12, 0.75],
} as const;
/**
 * Jets of gas and dust burst from the sunlit side of the nucleus. ESA says of Giotto at Halley:
 * "At least three bright jets could be seen spewing out material from the warmer sunlit side"
 * (sci.esa.int/web/giotto/-/31878-halley, read 2026-10-06). Where they stand and how far they
 * reach are a drawing.
 */
const JETS = {
  rgb: [0.93, 0.96, 1],
  points: 2600,
  width: [0.008, 0.09],
  pointSize: 0.035,
  opacity: 0.3,
  count: 3,
  /** How far a jet leans from straight at the Sun, as a share of its length at the far end. */
  lean: 0.55,
  /** How far the jets reach, in lengths of the nucleus. */
  reach: 5,
  /** Where along that reach a jet starts: at the ground, not at the middle of the nucleus. */
  from: 0.06,
} as const;
const COMA_COLOR = '214, 236, 255';
/** From this many glow radii away the comet is seen at full strength; closer, it thins out. */
export const VIEW_FROM_RADII = 4;
/** How much of the glow is left when the camera is right at the nucleus. */
const INSIDE_HAZE = 0.06;
/** Below this, two directions are too nearly in line to find one square to both. */
const SQUARE_ENOUGH = 1e-6;

/** The same made-up numbers every time, so the tails do not change between visits. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** A number from a bell curve around nought, mostly within one either way. */
function bell(random: () => number): number {
  return (random() + random() + random() + random() - 2) * 1.2;
}

function softDot(inner: string): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, `rgba(${inner}, 0.95)`);
    gradient.addColorStop(0.25, `rgba(${inner}, 0.4)`);
    gradient.addColorStop(1, `rgba(${inner}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}

interface TailCloud {
  readonly points: Points<BufferGeometry, PointsMaterial>;
  readonly style: { readonly pointSize: number; readonly opacity: number };
}

/**
 * A tail as points in its own frame: x away from the Sun, y the way dust falls behind, z across,
 * each from 0 to about 1 (one is the tail's length). `place` says where a point `along` the tail
 * sits before it is spread sideways.
 */
function createCloud(
  style: {
    readonly rgb: readonly [number, number, number];
    readonly points: number;
    readonly width: readonly [number, number];
    readonly pointSize: number;
    readonly opacity: number;
  },
  dot: CanvasTexture,
  seed: number,
  place: (along: number, random: () => number) => { away: number; behind: number; across: number },
): TailCloud {
  const random = seededRandom(seed);
  const positions = new Float32Array(style.points * 3);
  const colors = new Float32Array(style.points * 4);
  for (let n = 0; n < style.points; n += 1) {
    // More points near the comet, where a tail is thickest, thinning out towards the end.
    const along = random() ** 1.35;
    const spot = place(along, random);
    const spread = style.width[0] + (style.width[1] - style.width[0]) * along;
    positions[n * 3] = spot.away;
    positions[n * 3 + 1] = spot.behind + bell(random) * spread;
    positions[n * 3 + 2] = spot.across + bell(random) * spread;
    // Thickest at the comet, fading to nothing at the far end.
    colors[n * 4] = style.rgb[0];
    colors[n * 4 + 1] = style.rgb[1];
    colors[n * 4 + 2] = style.rgb[2];
    colors[n * 4 + 3] = (1 - along) ** 1.5;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 4));
  const material = new PointsMaterial({
    map: dot,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    // Ordinary blending, not adding light to light: where points pile up, near the comet or
    // seen end-on, the tail thickens to its own colour instead of burning out to white.
    sizeAttenuation: true,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  // Its frame is set outright each time the comet moves.
  points.matrixAutoUpdate = false;
  return { points, style };
}

function createComa(map: CanvasTexture): Sprite {
  return new Sprite(
    new SpriteMaterial({ map, blending: AdditiveBlending, depthWrite: false, transparent: true }),
  );
}

/**
 * What makes a comet look like one near the Sun: a glowing coma round the nucleus, a gas tail
 * blown straight away from the Sun, and a dust tail that curves back along the comet's path.
 */
export interface CometTail {
  readonly group: Group;
  /**
   * @param comet where the comet is, in scene units
   * @param sun where the Sun is, in scene units
   * @param heading which way the comet is moving, in scene units (any length)
   * @param distanceAu the comet's real distance from the Sun
   * @param nucleusRadius how big the nucleus is drawn, in scene units
   */
  update(comet: Vec3, sun: Vec3, heading: Vec3, distanceAu: number, nucleusRadius: number): void;
  /** Drawn radius of the glow right now, in scene units; 0 when the comet is bare. */
  glowRadius(): number;
  /** Dims the glow and tails as the camera comes inside them, so the nucleus can be seen. */
  setViewer(camera: Vec3): void;
  dispose(): void;
}

export function createCometTail(): CometTail {
  const group = new Group();
  const dot = softDot('255, 255, 255');
  const glow = softDot(COMA_COLOR);
  // The gas streams out in a few thin streamers that lean a little apart.
  const streamers = seededRandom(7);
  const leans = Array.from({ length: GAS.streamers }, () => ({
    behind: bell(streamers) * GAS.lean,
    across: bell(streamers) * GAS.lean,
  }));
  const gas = createCloud(GAS, dot, 11, (along, random) => {
    const lean = leans[Math.floor(random() * leans.length)] ?? { behind: 0, across: 0 };
    return { away: along, behind: lean.behind * along, across: lean.across * along };
  });
  const dust = createCloud(DUST, dot, 23, (along, random) => {
    const lag = DUST.lag[0] + (DUST.lag[1] - DUST.lag[0]) * random();
    return { ...dustGrain(along, lag), across: 0 };
  });
  // The jets use the same frame turned round: their "away" is towards the Sun.
  const jetLeans = Array.from({ length: JETS.count }, () => ({
    behind: bell(streamers) * JETS.lean,
    across: bell(streamers) * JETS.lean,
  }));
  const jets = createCloud(JETS, dot, 37, (along, random) => {
    const lean = jetLeans[Math.floor(random() * jetLeans.length)] ?? { behind: 0, across: 0 };
    const out = JETS.from + along * (1 - JETS.from);
    return { away: out, behind: lean.behind * out, across: lean.across * out };
  });
  const coma = createComa(glow);
  group.add(dust.points, gas.points, coma, jets.points);
  const clouds = [gas, dust];
  const towardsSun = new Vector3();

  const away = new Vector3();
  const behind = new Vector3();
  const across = new Vector3();
  const frame = new Matrix4();
  let comaRadius = 0;
  let strengthNow = 0;
  const centre = { x: 0, y: 0, z: 0 };

  const place = (cloud: TailCloud, length: number, strength: number): void => {
    frame.makeBasis(away, behind, across).scale(new Vector3(length, length, length));
    cloud.points.matrix.copy(frame);
    cloud.points.material.size = length * cloud.style.pointSize;
    cloud.points.material.opacity = cloud.style.opacity * strength;
  };

  return {
    group,
    update(comet, sun, heading, distanceAu, nucleusRadius) {
      const strength = tailStrength(distanceAu);
      group.visible = strength > 0;
      strengthNow = strength;
      comaRadius = 0;
      if (strength === 0) return;
      const sceneDistance = Math.hypot(comet.x - sun.x, comet.y - sun.y, comet.z - sun.z);
      if (sceneDistance === 0) return;
      // The same stretch the scale gives the comet's distance is given to its glow and tails.
      const unitsPerAu = sceneDistance / distanceAu;
      const length = strength * TAIL_LENGTH_AU * unitsPerAu;
      const { gas: outwards } = tailDirections(comet, sun, heading);
      away.set(outwards.x, outwards.y, outwards.z);
      const back = behindDirection(comet, sun, heading);
      if (back) behind.set(back.x, back.y, back.z);
      else {
        // With no heading the dust has no side to fall to: any direction square to the tail will do.
        behind.set(0, 1, 0).cross(away);
        if (behind.lengthSq() < SQUARE_ENOUGH) behind.set(1, 0, 0).cross(away);
      }
      behind.normalize();
      across.crossVectors(away, behind);
      group.position.set(comet.x, comet.y, comet.z);
      place(gas, length, strength);
      place(dust, length * DUST.length, strength);
      // The jets are seen from close by, inside the glow, so they are not dimmed with it.
      const reach = 2 * nucleusRadius * JETS.reach;
      frame
        .makeBasis(towardsSun.copy(away).negate(), behind, across)
        .scale(new Vector3(reach, reach, reach));
      jets.points.matrix.copy(frame);
      jets.points.material.size = reach * JETS.pointSize;
      jets.points.material.opacity = JETS.opacity * strength;
      comaRadius = strength * (COMA_RADIUS_KM / KM_PER_AU) * unitsPerAu;
      coma.scale.setScalar(2 * comaRadius);
      coma.material.opacity = strength;
      centre.x = comet.x;
      centre.y = comet.y;
      centre.z = comet.z;
    },
    glowRadius: () => comaRadius,
    setViewer(camera) {
      if (comaRadius === 0) return;
      const distance = Math.hypot(camera.x - centre.x, camera.y - centre.y, camera.z - centre.z);
      // Outside the glow everything is at full strength; deep inside it is only a faint haze.
      const outside = Math.min(1, distance / (comaRadius * VIEW_FROM_RADII));
      const dim = INSIDE_HAZE + (1 - INSIDE_HAZE) * outside * outside;
      coma.material.opacity = strengthNow * dim;
      for (const cloud of clouds) {
        cloud.points.material.opacity = cloud.style.opacity * strengthNow * dim;
      }
    },
    dispose() {
      for (const cloud of [...clouds, jets]) {
        cloud.points.geometry.dispose();
        cloud.points.material.dispose();
      }
      dot.dispose();
      glow.dispose();
      coma.material.dispose();
    },
  };
}
