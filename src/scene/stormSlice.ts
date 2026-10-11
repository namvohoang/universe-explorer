import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three';
import type { Vec3 } from '../sim/vec3';

const BACKGROUND = '#05070f';
const SEA_COLOR = 0x1c5fa6;
const CLOUD_COLOR = 0xf4f6fb;
const BAND_COLOR = 0xd3dae8;
/** Warm, wet air on its way in and up; cool, dry air sinking. */
const WARM_COLOR = 0xffb347;
const COOL_COLOR = 0x6fd3ff;
/**
 * Everything below is a drawing: how tall the cloud is against how wide (one unit is how far
 * out gales reach), how thick each layer is, where the two bands of rain stand, how many dots
 * of air there are and how fast they go. Only the widths of the eye and of the wall are real.
 */
const CLOUD_TOP = 0.5;
const CLOUD_BASE = 0.03;
const SEA_REACH = 1.15;
const RAIN_BANDS: readonly (readonly [inner: number, outer: number, top: number])[] = [
  [0.5, 0.62, 0.36],
  [0.8, 0.92, 0.28],
];
const AROUND_SEGMENTS = 48;
const DOTS_ON_A_PATH = 22;
const DOT_PIXELS = 6;
const DOT_LAPS_PER_SECOND = 0.07;
/** The dots are drawn a hair in front of the cut, so they are not lost in it. */
const IN_FRONT = 0.012;

/** A storm cut in half, in a scene of its own, to be drawn beside the look at the real one. */
export interface StormSlice {
  readonly scene: Scene;
  /** Where to look, and from how far and which way, to see the whole cut. */
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Moves the dots of air on by so many seconds. */
  flow(seconds: number): void;
  dispose(): void;
}

/**
 * `eye` and `wall` are how far from the middle the clear eye ends and the wall of cloud round
 * it ends, as shares of how far out gales reach.
 */
export function createStormSlice(eye: number, wall: number): StormSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sunlight = new DirectionalLight(0xffffff, 1.8);
  sunlight.position.set(0.4, 1, 1);
  scene.add(sunlight);

  const group = new Group();
  scene.add(group);
  const made: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(thing: T): T => {
    made.push(thing);
    return thing;
  };

  const sea = new Mesh(
    keep(new CircleGeometry(SEA_REACH, AROUND_SEGMENTS)),
    keep(new MeshLambertMaterial({ color: SEA_COLOR })),
  );
  sea.rotation.x = -Math.PI / 2;
  group.add(sea);

  /** A ring of cloud with this outline (distance from the middle, height), its back half only, with the cut closed. */
  const ring = (outline: readonly (readonly [number, number])[], color: number): void => {
    const material = keep(new MeshLambertMaterial({ color, side: DoubleSide }));
    const round = keep(
      new LatheGeometry(
        [...outline, outline[0] ?? [0, 0]].map(([r, y]) => new Vector2(r, y)),
        AROUND_SEGMENTS,
        Math.PI / 2,
        Math.PI,
      ),
    );
    group.add(new Mesh(round, material));
    for (const side of [1, -1]) {
      const face = new Shape(outline.map(([r, y]) => new Vector2(side * r, y)));
      group.add(new Mesh(keep(new ShapeGeometry(face)), material));
    }
  };
  // The wall round the eye: it leans out as it rises, so the eye is wider at the top.
  ring(
    [
      [eye, CLOUD_BASE],
      [eye * 1.2, CLOUD_TOP * 0.6],
      [Math.min(eye * 1.8, wall * 0.8), CLOUD_TOP],
      [wall, CLOUD_TOP],
      [wall, CLOUD_BASE],
    ],
    CLOUD_COLOR,
  );
  // The thin sheet of cloud that spreads out from the top of the wall.
  ring(
    [
      [wall, CLOUD_TOP * 0.84],
      [1, CLOUD_TOP * 0.88],
      [1, CLOUD_TOP * 0.94],
      [wall, CLOUD_TOP],
    ],
    CLOUD_COLOR,
  );
  for (const [inner, outer, top] of RAIN_BANDS) {
    if (inner <= wall) continue;
    ring(
      [
        [inner, CLOUD_BASE],
        [inner, top],
        [outer, top],
        [outer, CLOUD_BASE],
      ],
      BAND_COLOR,
    );
  }

  // Dots of air, each going round one path for ever: in over the sea, up the wall and out over
  // the top on both sides, and slowly down the eye.
  const rising = (wall + eye) / 2;
  const paths: {
    readonly corners: readonly (readonly [number, number])[];
    readonly cool: boolean;
  }[] = [
    ...[1, -1].map((side) => ({
      corners: [
        [side * SEA_REACH * 0.96, CLOUD_BASE * 0.6],
        [side * rising, CLOUD_BASE * 0.6],
        [side * rising, CLOUD_TOP * 0.97],
        [side * SEA_REACH * 0.96, CLOUD_TOP * 0.97],
      ] as const,
      cool: false,
    })),
    {
      corners: [
        [0, CLOUD_TOP * 0.95],
        [0, CLOUD_BASE * 2],
      ],
      cool: true,
    },
  ];
  const along = (
    corners: readonly (readonly [number, number])[],
    share: number,
  ): [number, number] => {
    const lengths = corners.slice(1).map(([r, y], index) => {
      const [fromR, fromY] = corners[index] ?? [r, y];
      return Math.hypot(r - fromR, y - fromY);
    });
    let left = share * lengths.reduce((sum, length) => sum + length, 0);
    for (const [index, length] of lengths.entries()) {
      const [fromR, fromY] = corners[index] ?? [0, 0];
      const [toR, toY] = corners[index + 1] ?? [fromR, fromY];
      if (left <= length || index === lengths.length - 1) {
        const through = length > 0 ? Math.min(1, left / length) : 0;
        return [fromR + (toR - fromR) * through, fromY + (toY - fromY) * through];
      }
      left -= length;
    }
    return [corners[0]?.[0] ?? 0, corners[0]?.[1] ?? 0];
  };
  const dots = paths.map(({ corners, cool }) => {
    const positions = new BufferAttribute(new Float32Array(DOTS_ON_A_PATH * 3), 3);
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute('position', positions);
    const material = keep(
      new PointsMaterial({
        color: cool ? COOL_COLOR : WARM_COLOR,
        size: DOT_PIXELS,
        sizeAttenuation: false,
        depthTest: false,
      }),
    );
    const points = new Points(geometry, material);
    points.renderOrder = 1;
    group.add(points);
    return { corners, positions };
  });
  let lap = 0;
  const place = (): void => {
    for (const { corners, positions } of dots) {
      for (let dot = 0; dot < DOTS_ON_A_PATH; dot++) {
        const [r, y] = along(corners, (lap + dot / DOTS_ON_A_PATH) % 1);
        positions.setXYZ(dot, r, y, IN_FRONT);
      }
      positions.needsUpdate = true;
    }
  };
  place();

  return {
    scene,
    target: { x: 0, y: CLOUD_TOP * 0.45, z: 0 },
    distance: 2.6,
    direction: { x: 0, y: 0.32, z: 1 },
    flow(seconds) {
      lap = (lap + seconds * DOT_LAPS_PER_SECOND) % 1;
      place();
    },
    dispose() {
      for (const thing of made) thing.dispose();
    },
  };
}
