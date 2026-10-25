import {
  AmbientLight,
  ArrowHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  TorusGeometry,
  Vector3,
} from 'three';
import { TIDE_SHORE, tideShoreLevel } from '../sim/scale';
import type { InSky } from '../sim/tides';

/**
 * A close-up of the tides at one shore on the equator, seen from the side, looking north:
 * 1. A beach sloping up out of the sea, cut open at the front, with a tide post standing in
 *    the water. The water stands as high as the tide the app works out for that shore, so it
 *    creeps up the sand and back down twice a day, further at full and new Moon.
 * 2. The sky over the shore, with the Sun and the Moon where they really are in it, east on
 *    the right. When one is below the ground it is drawn faintly through it, on the far side of
 *    Earth, where the second high tide comes from. The sky is day or night by the Sun.
 * 3. Asked for with its button: an arrow of the pull that raises the tide at the shore.
 *
 * What is real: where the Sun and the Moon are in the sky, the Moon's phase, their sizes next
 * to each other, and when the water is high or low and how much higher at one time than at
 * another. What is a drawing: the shore, the height of the water (no real height is drawn),
 * the Sun and the Moon drawn bigger, and the sky drawn flat, with how far north they are left
 * out.
 */
const BACKGROUND = '#05070f';
const NIGHT_SKY = new Color('#0b1430');
const DUSK_SKY = new Color('#e98a5a');
const DAY_SKY = new Color('#78bfee');
const SAND = 0xe3c88f;
const WET_SAND = 0xb59a66;
const ROCK = 0x7a5a42;
/** The cut faces the viewer, away from the Sun: a little glow keeps it from going black. */
const ROCK_GLOW = 0x2e2018;
const SEA = 0x2f86c9;
const SEA_FRONT = 0x1d5f9a;
const FOAM = 0xe8fbff;
const SUN_COLOR = 0xffd34d;
const PATH_COLOR = 0xf4eedc;
const PULL_COLOR = 0xffffff;

/** The shore, in drawing units: x east, y up, z towards the viewer. */
const LEFT = -8;
const RIGHT = 8;
const BACK = -2.5;
const FRONT = 0.5;
/**
 * The sea floor and the beach, left to right: flat out at sea, a long gentle beach the water
 * runs up and down, and a steeper bank at the back that even the highest tide stays below.
 */
const SEA_FLOOR_Y = -1;
const GROUND: readonly (readonly [number, number])[] = [
  [LEFT, SEA_FLOOR_Y],
  [-5.5, SEA_FLOOR_Y],
  [3, 0.6],
  [RIGHT, 1.6],
];
/** The cut through the ground goes down to the bottom of the sky's circle, and a bit more. */
const SKY_RADIUS = 4.6;
const SKY_Z = BACK - 0.1;
const GROUND_BOTTOM = -SKY_RADIUS - 0.6;
const POST_X = -4.2;
const POST_Z = -0.4;
const POST_HEIGHT = 2.3;
/** Small ripples on the water, so it looks like water: drawing units, and radians a second. */
const RIPPLE = 0.025;
const RIPPLE_SPEED = 1.4;
const PULL_ARROW_LENGTH = 2.6;
/** A body below the ground is drawn this faintly, through it. */
const UNDERFOOT_OPACITY = 0.35;

/** Where the Sun and the Moon are in the shore's sky, and how high the tide stands there. */
export interface TideSliceState {
  /** The tide at the shore, as `tideHeights` gives it. */
  readonly height: number;
  /** The pull that raises the tide at the shore, as `tidePulls` gives it, in the shore's sky. */
  readonly pull: InSky;
  /** Which way the Moon and the Sun lie from the shore: unit vectors in its sky. */
  readonly moon: InSky;
  readonly sun: InSky;
  /** How big the Moon and the Sun look: the angle from their middles to their edges. */
  readonly moonAngularRadiusRad: number;
  readonly sunAngularRadiusRad: number;
  /** The angle at the Moon between the Sun and Earth: 0 at full Moon, π at new Moon. */
  readonly moonPhaseRad: number;
}

export interface TideSliceOptions {
  /** Where the app serves the Moon's surface map from. */
  readonly moonMapUrl: string | null;
}

export interface TideSlice {
  readonly scene: Scene;
  readonly target: { readonly x: number; readonly y: number; readonly z: number };
  readonly distance: number;
  readonly direction: { readonly x: number; readonly y: number; readonly z: number };
  /** Raises the water and places the Sun and the Moon for a moment of the story. */
  set(state: TideSliceState): void;
  /** Moves the ripples on the water. */
  flow(seconds: number): void;
  /** Shows or hides the arrow of the pull. */
  toggleView(): void;
  /** Whether the arrow is on show. */
  viewToggled(): boolean;
  dispose(): void;
}

/** How high the sea floor and the beach stand at `x`. */
const groundY = (x: number): number => {
  for (let index = 1; index < GROUND.length; index++) {
    const [x0, y0] = GROUND[index - 1] ?? [LEFT, SEA_FLOOR_Y];
    const [x1, y1] = GROUND[index] ?? [RIGHT, SEA_FLOOR_Y];
    if (x <= x1) return y0 + ((y1 - y0) * (Math.max(x, x0) - x0)) / (x1 - x0);
  }
  return GROUND[GROUND.length - 1]?.[1] ?? SEA_FLOOR_Y;
};

/** Where the water at `level` meets the beach, kept on the drawing. */
const shoreX = (level: number): number => {
  for (let index = 1; index < GROUND.length; index++) {
    const [x0, y0] = GROUND[index - 1] ?? [LEFT, SEA_FLOOR_Y];
    const [x1, y1] = GROUND[index] ?? [RIGHT, SEA_FLOOR_Y];
    if (y1 > y0 && level <= y1) return x0 + ((x1 - x0) * Math.max(0, level - y0)) / (y1 - y0);
  }
  return RIGHT;
};

/** Where something in the sky is drawn: on a circle over the shore, east on the right. */
const onSkyCircle = (way: InSky): Vector3 => {
  const angle = Math.atan2(way.up, way.east);
  return new Vector3(SKY_RADIUS * Math.cos(angle), SKY_RADIUS * Math.sin(angle), SKY_Z);
};

/** Red and white bands, like a tide post on a pier. */
function createPostTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    for (let band = 0; band < 10; band++) {
      ctx.fillStyle = band % 2 === 0 ? '#f4f4f4' : '#e0453a';
      ctx.fillRect(0, band * 8, 8, 8);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

interface MoonUniforms {
  readonly [name: string]: { value: unknown };
  readonly map: { value: Texture | null };
  readonly hasMap: { value: number };
  readonly phase: { value: number };
  readonly sunAt: { value: Vector3 };
  readonly opacity: { value: number };
}

/**
 * The Moon lit for the phase it really shows, whichever way the drawing is seen from: the lit
 * side faces the Sun as drawn on the screen, and the share of it that is lit is the real one.
 */
function createMoonMaterial(uniforms: MoonUniforms): ShaderMaterial {
  return new ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec2 vToSun;
      uniform vec3 sunAt;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 middle = viewMatrix * vec4(modelMatrix[3].xyz, 1.0);
        vec4 sun = viewMatrix * vec4(sunAt, 1.0);
        vToSun = sun.xy - middle.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <logdepthbuf_pars_fragment>
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec2 vToSun;
      uniform sampler2D map;
      uniform float hasMap;
      uniform float phase;
      uniform float opacity;
      void main() {
        #include <logdepthbuf_fragment>
        vec2 across = length(vToSun) > 1e-4 ? normalize(vToSun) : vec2(1.0, 0.0);
        vec3 light = vec3(sin(phase) * across, cos(phase));
        float lit = clamp(dot(normalize(vNormal), light), 0.0, 1.0);
        vec3 ground = hasMap > 0.5 ? texture2D(map, vUv).rgb : vec3(0.75);
        gl_FragColor = vec4(ground * (0.06 + 1.1 * lit), opacity);
        #include <colorspace_fragment>
      }
    `,
  });
}

export function createTideSlice(options: TideSliceOptions): TideSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // Sunlight from where the Sun is, and a little light always so the night shore shows.
  const ambient = new AmbientLight(0xb8c8ff, 0.5);
  scene.add(ambient);
  const sunlight = new DirectionalLight(0xffffff, 0);
  scene.add(sunlight);
  scene.add(sunlight.target);

  // The sky over the shore, as a panel at the back: day or night by the Sun.
  const skyTop = SKY_RADIUS + 0.9;
  const skyMaterial = keep(new MeshBasicMaterial({ color: NIGHT_SKY.clone() }));
  const skyPanel = new Mesh(
    keep(new PlaneGeometry(RIGHT - LEFT, skyTop - SEA_FLOOR_Y)),
    skyMaterial,
  );
  skyPanel.position.set((LEFT + RIGHT) / 2, (skyTop + SEA_FLOOR_Y) / 2, SKY_Z - 0.05);
  scene.add(skyPanel);

  // The ground cut open: rock below, a sand beach on top rising out of the sea.
  const profile = new Shape();
  profile.moveTo(LEFT, GROUND_BOTTOM);
  for (const [x, y] of GROUND) profile.lineTo(x, y);
  profile.lineTo(RIGHT, GROUND_BOTTOM);
  profile.closePath();
  const ground = new Mesh(
    keep(new ExtrudeGeometry(profile, { depth: FRONT - BACK, bevelEnabled: false })),
    [
      keep(new MeshStandardMaterial({ color: ROCK, emissive: ROCK_GLOW, roughness: 1 })),
      keep(new MeshStandardMaterial({ color: SAND, roughness: 1 })),
    ],
  );
  ground.position.z = BACK;
  scene.add(ground);
  // A thin skin of sand on the beach and sea floor, so the top reads as sand and the cut as rock.
  const skin = new Shape();
  skin.moveTo(LEFT, SEA_FLOOR_Y - 0.25);
  for (const [x, y] of GROUND) skin.lineTo(x, y);
  for (const [x, y] of [...GROUND].reverse().slice(0, -1)) skin.lineTo(x, y - 0.25);
  skin.closePath();
  const sandCut = new Mesh(
    keep(new ShapeGeometry(skin)),
    keep(new MeshStandardMaterial({ color: WET_SAND, roughness: 1 })),
  );
  sandCut.position.z = FRONT + 0.002;
  scene.add(sandCut);

  // The water: its top, rippled, and its front where the drawing cuts it open.
  const TOP_STEPS_X = 48;
  const TOP_STEPS_Z = 12;
  const topGeometry = keep(new PlaneGeometry(1, FRONT - BACK, TOP_STEPS_X, TOP_STEPS_Z));
  topGeometry.rotateX(-Math.PI / 2);
  topGeometry.translate(0.5, 0, (FRONT + BACK) / 2);
  const topPositions = topGeometry.getAttribute('position') as BufferAttribute;
  const flatTop = Float32Array.from(topPositions.array);
  const top = new Mesh(
    topGeometry,
    keep(
      new MeshStandardMaterial({
        color: SEA,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      }),
    ),
  );
  top.renderOrder = 2;
  scene.add(top);
  const frontMaterial = keep(
    new MeshBasicMaterial({ color: SEA_FRONT, transparent: true, opacity: 0.75 }),
  );
  let front: Mesh | null = null;
  // Foam where the water meets the sand.
  const foam = new Mesh(
    keep(new BoxGeometry(0.12, 0.03, FRONT - BACK)),
    keep(new MeshBasicMaterial({ color: FOAM, transparent: true, opacity: 0.85 })),
  );
  foam.position.z = (FRONT + BACK) / 2;
  foam.renderOrder = 3;
  scene.add(foam);

  // The tide post, standing on the sea floor, and a ring where the water stands on it.
  const post = new Mesh(
    keep(new CylinderGeometry(0.1, 0.1, POST_HEIGHT, 16)),
    keep(new MeshStandardMaterial({ map: keep(createPostTexture()), roughness: 0.6 })),
  );
  post.position.set(POST_X, groundY(POST_X) + POST_HEIGHT / 2, POST_Z);
  scene.add(post);
  const waterMark = new Mesh(
    keep(new TorusGeometry(0.2, 0.045, 10, 28)),
    keep(new MeshBasicMaterial({ color: 0x7ff3ff })),
  );
  waterMark.rotation.x = Math.PI / 2;
  waterMark.position.set(POST_X, 0, POST_Z);
  waterMark.renderOrder = 4;
  scene.add(waterMark);

  // The path the Sun and the Moon take round the sky in a day, drawn flat.
  const PATH_POINTS = 128;
  const pathGeometry = keep(new BufferGeometry());
  pathGeometry.setAttribute(
    'position',
    new BufferAttribute(
      Float32Array.from({ length: PATH_POINTS * 3 }, (_, i) => {
        const angle = (Math.floor(i / 3) / PATH_POINTS) * 2 * Math.PI;
        return [SKY_RADIUS * Math.cos(angle), SKY_RADIUS * Math.sin(angle), SKY_Z][i % 3] ?? 0;
      }),
      3,
    ),
  );
  const path = new LineLoop(
    pathGeometry,
    keep(new LineBasicMaterial({ color: PATH_COLOR, transparent: true, opacity: 0.22 })),
  );
  path.renderOrder = 1;
  scene.add(path);

  // The Sun and the Moon, at their real sizes next to each other, both drawn bigger.
  const sunMaterial = keep(new MeshBasicMaterial({ color: SUN_COLOR, transparent: true }));
  const sun = new Mesh(keep(new SphereGeometry(1, 32, 16)), sunMaterial);
  scene.add(sun);
  const moonUniforms: MoonUniforms = {
    map: { value: null },
    hasMap: { value: 0 },
    phase: { value: 0 },
    sunAt: { value: new Vector3() },
    opacity: { value: 1 },
  };
  const moonMaterial = keep(createMoonMaterial(moonUniforms));
  if (options.moonMapUrl) {
    const texture: Texture = new TextureLoader().load(options.moonMapUrl, () => {
      moonUniforms.map.value = texture;
      moonUniforms.hasMap.value = 1;
    });
    texture.colorSpace = SRGBColorSpace;
    keep(texture);
  }
  const moon = new Mesh(keep(new SphereGeometry(1, 48, 32)), moonMaterial);
  scene.add(moon);

  /** Draws a body in the sky, or faintly through the ground when it is below it. */
  const placeInSky = (
    body: Mesh,
    material: { opacity: number; depthTest: boolean },
    way: InSky,
    angularRadiusRad: number,
  ): void => {
    body.position.copy(onSkyCircle(way));
    const radius = SKY_RADIUS * angularRadiusRad * TIDE_SHORE.skyMagnification;
    body.scale.setScalar(radius);
    // Below the ground, or low enough to be hidden by the beach.
    const below = body.position.y - radius < groundY(body.position.x);
    material.opacity = below ? UNDERFOOT_OPACITY : 1;
    material.depthTest = !below;
    body.renderOrder = below ? 6 : 0;
  };

  // The arrow of the pull at the shore, shown with the button.
  const pullArrow = new ArrowHelper(new Vector3(1, 0, 0), new Vector3(), 1, PULL_COLOR, 0.3, 0.2);
  pullArrow.visible = false;
  pullArrow.renderOrder = 5;
  scene.add(pullArrow);

  let level = tideShoreLevel(0);
  let time = 0;

  /** Lays the water's top from the left edge to the beach, with ripples on it. */
  const shapeWater = (): void => {
    const reach = shoreX(level) - LEFT;
    for (let index = 0; index < topPositions.count; index++) {
      const along = flatTop[index * 3] ?? 0;
      const z = flatTop[index * 3 + 2] ?? 0;
      const x = LEFT + along * reach;
      // The ripples die away where the water is shallow at the shore.
      const calm = Math.min(1, (shoreX(level) - x) / 1.5);
      const ripple =
        RIPPLE * calm * Math.sin(2.6 * x + 1.7 * z - RIPPLE_SPEED * time) * Math.cos(1.9 * z);
      topPositions.setXYZ(index, x, level + ripple, z);
    }
    topPositions.needsUpdate = true;
    topGeometry.computeVertexNormals();
  };

  /** The water's front, between the ground and the water's top, where the drawing cuts it. */
  const shapeFront = (): void => {
    if (front) {
      scene.remove(front);
      front.geometry.dispose();
    }
    const edge = shoreX(level);
    const outline = new Shape();
    outline.moveTo(LEFT, level);
    outline.lineTo(edge, level);
    for (const [x, y] of [...GROUND].reverse()) if (x < edge) outline.lineTo(x, y);
    outline.closePath();
    front = new Mesh(new ShapeGeometry(outline), frontMaterial);
    front.position.z = FRONT + 0.004;
    front.renderOrder = 2;
    scene.add(front);
  };

  return {
    scene,
    target: { x: 0, y: 0.2, z: 0 },
    distance: 11.5,
    direction: { x: 0, y: 0.35, z: 1 },

    set(next) {
      level = tideShoreLevel(next.height);
      shapeWater();
      shapeFront();
      foam.position.x = shoreX(level);
      foam.position.y = level + 0.01;
      waterMark.position.y = level;

      placeInSky(sun, sunMaterial, next.sun, next.sunAngularRadiusRad);
      placeInSky(moon, moonMaterial, next.moon, next.moonAngularRadiusRad);
      moonUniforms.opacity.value = moonMaterial.opacity;
      moonUniforms.phase.value = next.moonPhaseRad;
      moonUniforms.sunAt.value.copy(sun.position);

      // Day, dusk and night by how high the Sun stands, and its light from where it is.
      const day = Math.min(1, Math.max(0, (next.sun.up + 0.1) / 0.35));
      const dusk = Math.max(0, 1 - Math.abs(next.sun.up - 0.02) / 0.15);
      skyMaterial.color.lerpColors(NIGHT_SKY, DAY_SKY, day).lerp(DUSK_SKY, dusk * 0.5);
      sunlight.intensity = 2.6 * day;
      ambient.intensity = 0.45 + 0.35 * day;
      sunlight.position.set(next.sun.east, Math.max(0.05, next.sun.up), -next.sun.north);

      // The pull, as it is at the shore: along the ground and up, seen from the side.
      const pull = new Vector3(next.pull.east, next.pull.up, 0);
      const strength = pull.length();
      const length = Math.max(0.4, PULL_ARROW_LENGTH * strength);
      pullArrow.position.set(POST_X + 1.6, level + 0.2, POST_Z);
      if (strength > 0) pullArrow.setDirection(pull.normalize());
      pullArrow.setLength(length, Math.min(0.45, length * 0.4), 0.3);
    },

    flow(seconds) {
      if (seconds === 0) return;
      time += seconds;
      shapeWater();
    },

    viewToggled: () => pullArrow.visible,

    toggleView() {
      pullArrow.visible = !pullArrow.visible;
    },

    dispose() {
      pullArrow.dispose();
      front?.geometry.dispose();
      for (const item of disposables) item.dispose();
    },
  };
}
