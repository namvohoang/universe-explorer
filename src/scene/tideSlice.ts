import {
  AmbientLight,
  ArrowHelper,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
} from 'three';
import { TIDE_CLOSE_UP, tideCloseUpSeaRadii } from '../sim/scale';
import { equatorPoint } from '../sim/tides';
import { normalize, type Vec3 } from '../sim/vec3';

/**
 * A 3D close-up of how the tides work, seen from above Earth's north pole and a little to the
 * side:
 * 1. Earth turning inside its sea, the sea swollen towards the Moon and away from it. The shape
 *    of the sea is the one `src/sim/tides.ts` works out from where the Moon and the Sun really
 *    are, so the swellings grow at full Moon and shrink at a quarter Moon by themselves.
 * 2. A post on a shore at the equator, turning with Earth, with a ring where the water stands
 *    on it: up and down twice in each turn.
 * 3. Asked for with its button: arrows round Earth for the pull that raises the tide, out
 *    towards the Moon and away from it, in at the sides.
 *
 * What is real: the directions of the Moon and the Sun, how fast Earth turns, the size of the
 * Moon next to Earth, and the shape and the relative size of the tide. What is a drawing: the
 * swelling, made enormously bigger (a real tide is far too small to see against a whole
 * world), the Moon drawn much closer than it is, and Earth's pole drawn straight up.
 */
const BACKGROUND = '#05070f';
const LAND_UNTIL_LOADED = 0x2a5d8a;
const SEA_COLOR = 0x3aa0ff;
const SEA_GLOW = 0x0b2a55;
const SEA_EDGE = 0x9fdcff;
const SUN_COLOR = 0xffc53d;
const MOON_COLOR = 0xf4eedc;
const PULL_COLOR = 0xbfe6ff;

/** Earth's radius in scene units: everything else is drawn against it. */
const EARTH = 1;
const MOON_DRAWN_AWAY = TIDE_CLOSE_UP.moonAwayRadii;
/** The arrow towards the Sun runs between these distances from Earth's middle. */
const SUN_ARROW_FROM = 1.65;
const SUN_ARROW_LENGTH = 0.9;
/** The post on the shore stands this far out from the ground. */
const POST_HEIGHT = 0.85;
const PULL_ARROWS = 16;
const PULL_ARROW_LENGTH = 0.75;
/** Small ripples on the sea, so it looks like water: in Earth radii, and radians a second. */
const RIPPLE = 0.006;
const RIPPLE_SPEED = 1.6;

/** Where the Moon and the Sun are, how high the sea stands, and how far Earth has turned. */
export interface TideSliceState {
  /** The sea's height each way from Earth's middle, as `tideHeights` gives it. */
  readonly height: (towards: Vec3) => number;
  /** The pull that raises the tide at each point of the ground, as `tidePulls` gives it. */
  readonly pull: (towards: Vec3) => Vec3;
  /** Which way the Moon and the Sun lie from Earth's middle, in scene axes. */
  readonly moon: Vec3;
  readonly sun: Vec3;
  /** How far Earth has turned about its pole, as `spinAngleRad` gives it. */
  readonly turnRad: number;
}

export interface TideSliceOptions {
  /** Where the app serves Earth's and the Moon's surface maps from. */
  readonly earthMapUrl: string | null;
  readonly moonMapUrl: string | null;
  /** The Moon's radius over Earth's, and Earth's polar radius over its equatorial one. */
  readonly moonRadiusRatio: number;
  readonly earthPoleRatio: number;
}

export interface TideSlice {
  readonly scene: Scene;
  readonly target: { readonly x: number; readonly y: number; readonly z: number };
  readonly distance: number;
  readonly direction: { readonly x: number; readonly y: number; readonly z: number };
  /** Shapes the sea and places the Moon, the Sun and Earth's turn for a moment of the story. */
  set(state: TideSliceState): void;
  /** Moves the ripples on the sea. */
  flow(seconds: number): void;
  /** Shows or hides the arrows of the pull. */
  toggleView(): void;
  /** Whether the arrows are on show. */
  viewToggled(): boolean;
  dispose(): void;
}

const toVector = (v: Vec3): Vector3 => new Vector3(v.x, v.y, v.z);

/** Red and white bands, like a tide post on a pier. */
function createPostTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    for (let band = 0; band < 8; band++) {
      ctx.fillStyle = band % 2 === 0 ? '#f4f4f4' : '#e0453a';
      ctx.fillRect(0, band * 8, 8, 8);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createTideSlice(options: TideSliceOptions): TideSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  const loadMap = (url: string | null, material: MeshStandardMaterial): void => {
    if (!url) return;
    const texture: Texture = new TextureLoader().load(url, () => {
      material.map = texture;
      material.color.set('#ffffff');
      material.needsUpdate = true;
    });
    texture.colorSpace = SRGBColorSpace;
    keep(texture);
  };

  // Sunlight from where the Sun is, and a little light everywhere so the night side shows.
  scene.add(new AmbientLight(0xffffff, 0.12));
  const sunlight = new DirectionalLight(0xffffff, 3);
  scene.add(sunlight);
  scene.add(sunlight.target);

  // Earth, turning about its pole: up.
  const earth = new Group();
  scene.add(earth);
  const groundMaterial = keep(
    new MeshStandardMaterial({ color: LAND_UNTIL_LOADED, roughness: 0.9, metalness: 0 }),
  );
  loadMap(options.earthMapUrl, groundMaterial);
  const ground = new Mesh(keep(new SphereGeometry(EARTH, 64, 48)), groundMaterial);
  ground.scale.y = options.earthPoleRatio;
  earth.add(ground);

  // The tide post on a shore at the equator, turning with Earth.
  const postMaterial = keep(new MeshStandardMaterial({ map: keep(createPostTexture()) }));
  const post = new Mesh(keep(new CylinderGeometry(0.035, 0.035, POST_HEIGHT, 12)), postMaterial);
  post.rotation.z = -Math.PI / 2;
  post.position.set(EARTH + POST_HEIGHT / 2, 0, 0);
  earth.add(post);
  const flag = new Mesh(
    keep(new SphereGeometry(0.07, 16, 12)),
    keep(new MeshBasicMaterial({ color: 0xffd23f })),
  );
  flag.position.set(EARTH + POST_HEIGHT, 0, 0);
  earth.add(flag);

  // The sea: a shell over the ground, shaped by the tide.
  const seaGeometry = keep(new SphereGeometry(1, 96, 64));
  const seaPositions = seaGeometry.getAttribute('position') as BufferAttribute;
  const round = Float32Array.from(seaPositions.array);
  /** How far out each point of the shell stands before ripples, set by `set`. */
  const settled = new Float32Array(seaPositions.count).fill(tideCloseUpSeaRadii(0));
  const sea = new Mesh(
    seaGeometry,
    keep(
      new MeshStandardMaterial({
        color: SEA_COLOR,
        emissive: SEA_GLOW,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    ),
  );
  sea.renderOrder = 2;
  scene.add(sea);

  // The sea's edge round the equator, so its egg shape reads from above.
  const EDGE_POINTS = 128;
  const edgeGeometry = keep(new BufferGeometry());
  const edgePositions = new BufferAttribute(new Float32Array(EDGE_POINTS * 3), 3);
  edgeGeometry.setAttribute('position', edgePositions);
  const edge = new LineLoop(
    edgeGeometry,
    keep(new LineBasicMaterial({ color: SEA_EDGE, transparent: true, opacity: 0.8 })),
  );
  edge.renderOrder = 3;
  scene.add(edge);

  // Where the water stands on the post: a ring round it.
  const waterMark = new Mesh(
    keep(new TorusGeometry(0.09, 0.022, 10, 28)),
    keep(new MeshBasicMaterial({ color: 0x7ff3ff })),
  );
  waterMark.renderOrder = 4;
  scene.add(waterMark);

  // The Moon, at its real size next to Earth, drawn much closer than it is, and its path.
  const moonMaterial = keep(new MeshStandardMaterial({ color: 0xbfbfbf, roughness: 1 }));
  loadMap(options.moonMapUrl, moonMaterial);
  const moon = new Mesh(
    keep(new SphereGeometry(EARTH * options.moonRadiusRatio, 48, 32)),
    moonMaterial,
  );
  scene.add(moon);
  const pathGeometry = keep(new BufferGeometry());
  pathGeometry.setAttribute(
    'position',
    new BufferAttribute(
      Float32Array.from({ length: EDGE_POINTS * 3 }, (_, i) => {
        const angle = (Math.floor(i / 3) / EDGE_POINTS) * 2 * Math.PI;
        return [Math.cos(angle), 0, Math.sin(angle)][i % 3] ?? 0;
      }).map((v) => v * MOON_DRAWN_AWAY),
      3,
    ),
  );
  scene.add(
    new LineLoop(
      pathGeometry,
      keep(new LineBasicMaterial({ color: MOON_COLOR, transparent: true, opacity: 0.25 })),
    ),
  );

  // An arrow towards the Sun, which is far out of the picture.
  const sunArrow = new ArrowHelper(
    new Vector3(1, 0, 0),
    new Vector3(),
    SUN_ARROW_LENGTH,
    SUN_COLOR,
    0.22,
    0.12,
  );
  scene.add(sunArrow);

  // The arrows of the pull, round the equator, shown with the button.
  const pulls = new Group();
  pulls.visible = false;
  scene.add(pulls);
  const pullArrows = Array.from({ length: PULL_ARROWS }, () => {
    const arrow = new ArrowHelper(new Vector3(1, 0, 0), new Vector3(), 0.3, PULL_COLOR);
    arrow.renderOrder = 5;
    pulls.add(arrow);
    return arrow;
  });

  let state: TideSliceState | null = null;
  let time = 0;

  /** Lays the sea's points where the tide puts them, with ripples on top. */
  const shapeSea = (): void => {
    for (let index = 0; index < seaPositions.count; index++) {
      const x = round[index * 3] ?? 0;
      const y = round[index * 3 + 1] ?? 0;
      const z = round[index * 3 + 2] ?? 0;
      const ripple =
        RIPPLE * Math.sin(9 * x + 7 * z + RIPPLE_SPEED * time) * Math.cos(8 * y - time);
      const out = (settled[index] ?? EARTH) + ripple;
      seaPositions.setXYZ(index, x * out, y * out, z * out);
    }
    seaPositions.needsUpdate = true;
    seaGeometry.computeVertexNormals();
  };

  const seaRadius = (height: (towards: Vec3) => number, towards: Vec3): number =>
    EARTH * tideCloseUpSeaRadii(height(towards));

  return {
    scene,
    target: { x: 0, y: 0, z: 0 },
    distance: 8.6,
    direction: { x: 0.25, y: 0.7, z: 1 },

    set(next) {
      state = next;
      for (let index = 0; index < seaPositions.count; index++) {
        const towards = {
          x: round[index * 3] ?? 0,
          y: round[index * 3 + 1] ?? 0,
          z: round[index * 3 + 2] ?? 0,
        };
        settled[index] = seaRadius(next.height, towards);
      }
      shapeSea();
      for (let index = 0; index < EDGE_POINTS; index++) {
        const towards = equatorPoint((index / EDGE_POINTS) * 2 * Math.PI);
        const out = seaRadius(next.height, towards) + 0.004;
        edgePositions.setXYZ(index, towards.x * out, 0, towards.z * out);
      }
      edgePositions.needsUpdate = true;

      earth.rotation.y = next.turnRad;
      const shore = equatorPoint(next.turnRad);
      waterMark.position.copy(toVector(shore).multiplyScalar(seaRadius(next.height, shore)));
      waterMark.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), toVector(shore));

      // The Moon is drawn on its path, in the plane of Earth's path: its real path tilts out
      // of that by a few degrees, too little to matter here. The tide uses where it really is.
      const moonWay = toVector(normalize({ x: next.moon.x, y: 0, z: next.moon.z }));
      moon.position.copy(moonWay.clone().multiplyScalar(MOON_DRAWN_AWAY));
      const sunWay = toVector(normalize(next.sun));
      sunlight.position.copy(sunWay.clone().multiplyScalar(20));
      sunArrow.position.copy(sunWay.clone().multiplyScalar(SUN_ARROW_FROM));
      sunArrow.setDirection(sunWay);

      for (const [index, arrow] of pullArrows.entries()) {
        const towards = equatorPoint((index / PULL_ARROWS) * 2 * Math.PI);
        const pull = toVector(next.pull(towards));
        const strength = pull.length();
        const base = toVector(towards).multiplyScalar(seaRadius(next.height, towards) + 0.05);
        // An arrow pointing in starts further out, so its tip, not its tail, meets the sea.
        const length = Math.max(0.08, PULL_ARROW_LENGTH * strength);
        const inward = pull.dot(toVector(towards)) < 0;
        arrow.position.copy(inward ? base.add(toVector(towards).multiplyScalar(length)) : base);
        arrow.setDirection(pull.normalize());
        arrow.setLength(length, Math.min(0.2, length * 0.45), 0.12);
      }
    },

    flow(seconds) {
      if (seconds === 0 || !state) return;
      time += seconds;
      shapeSea();
    },

    viewToggled: () => pulls.visible,

    toggleView() {
      pulls.visible = !pulls.visible;
    },

    dispose() {
      sunArrow.dispose();
      for (const arrow of pullArrows) arrow.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
