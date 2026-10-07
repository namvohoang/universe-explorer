import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SRGBColorSpace,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
  type Material,
  type Object3D,
  type Texture,
} from 'three';

/**
 * What is drawn over NASA's model of the Sun so that it shows the things real pictures of the
 * Sun show (NASA's Solar Dynamics Observatory, in ultraviolet light):
 * - a fine grain all over that slowly churns;
 * - bright patches, the active regions, with loops of glowing gas arching up from them;
 * - a large dark patch, a coronal hole, and a few thin dark threads, the filaments;
 * - a brighter rim, and an uneven glow around the whole Sun.
 *
 * What these things are is real. Where they are is made up: the Sun's face changes from day to
 * day and no map of it exists. The model is labelled as a drawing and a real picture sits
 * beside it.
 */

/** Where the bright patches are: unit directions in the Sun's own frame (+y is north), and sizes. */
const ACTIVE_REGIONS: readonly (readonly [x: number, y: number, z: number, size: number])[] = [
  [0.82, 0.31, 0.48, 0.3],
  [-0.35, 0.36, 0.86, 0.24],
  [-0.9, -0.28, 0.33, 0.34],
  [0.3, -0.38, -0.87, 0.28],
  [0.55, -0.3, 0.78, 0.22],
  [-0.6, 0.33, -0.73, 0.3],
];
/**
 * The middles of the dark coronal holes and their sizes: one in the northern half, as in NASA's
 * picture, and one on the far side so that one is in view most of the time.
 */
const CORONAL_HOLES: readonly (readonly [x: number, y: number, z: number, size: number])[] = [
  [0.3, 0.6, 0.74, 0.8],
  [-0.55, -0.5, -0.67, 0.62],
];

const RIM_COLOR = '#ffd27a';
const LOOP_COLOR = '#ff9a3c';
/** How many loops stand on each bright patch, and how tall the smallest is, in patch sizes. */
const LOOPS_PER_REGION = 3;
const LOOP_HEIGHT = 0.13;
/** How far the uneven glow reaches, in Sun radii, and how many streamers it has. */
const GLOW_RADII = 3.2;
const STREAMERS = 46;
/** How fast the grain churns, in noise steps per second of running time. */
const CHURN = 0.06;

// The logdepthbuf chunks keep the Sun ordered correctly with the stage's logarithmic depth.
const VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  uniform mat3 toSunFrame;
  varying vec2 vUv;
  varying vec3 vDirection;
  varying vec3 vFacing;
  void main() {
    vUv = uv;
    // The model is a ball, so a point's normal is also its direction from the middle.
    vDirection = normalize(toSunFrame * normal);
    vFacing = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform sampler2D map;
  uniform float churn;
  uniform vec3 rim;
  uniform vec4 regions[${String(ACTIVE_REGIONS.length)}];
  uniform vec4 holes[${String(CORONAL_HOLES.length)}];
  varying vec2 vUv;
  varying vec3 vDirection;
  varying vec3 vFacing;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(cell), hash(cell + vec3(1, 0, 0)), f.x),
          mix(hash(cell + vec3(0, 1, 0)), hash(cell + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(cell + vec3(0, 0, 1)), hash(cell + vec3(1, 0, 1)), f.x),
          mix(hash(cell + vec3(0, 1, 1)), hash(cell + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float layers(vec3 p) {
    return 0.5 * noise(p) + 0.3 * noise(p * 2.1) + 0.2 * noise(p * 4.3);
  }

  // Thin bright wisps: the ridges of a few layers of noise, finer and fainter each time.
  float wisps(vec3 p) {
    float sum = 0.0;
    float weight = 0.5;
    for (int n = 0; n < 4; n += 1) {
      sum += weight * (1.0 - abs(2.0 * noise(p) - 1.0));
      p = p * 2.03 + 7.1;
      weight *= 0.5;
    }
    return sum;
  }

  void main() {
    #include <logdepthbuf_fragment>
    vec3 direction = normalize(vDirection);
    vec3 colour = texture2D(map, vUv).rgb;

    // A fine grain all over, slowly churning, with thin wisps as in the real pictures.
    vec3 drift = vec3(0.0, churn, churn * 0.6);
    float grain = layers(direction * 20.0 + drift);
    float fine = wisps(direction * 26.0 - drift);
    colour *= (0.6 + 0.6 * grain) * (0.55 + 0.75 * fine);

    // Bright patches with ragged edges, made of thin bright strands like the loops seen there.
    float ragged = layers(direction * 7.0 + vec3(churn * 0.3));
    float strands = smoothstep(0.5, 0.78, wisps(direction * 15.0 + drift));
    float bright = 0.0;
    for (int n = 0; n < ${String(ACTIVE_REGIONS.length)}; n += 1) {
      float away = distance(direction, regions[n].xyz) / regions[n].w;
      bright += 1.0 - smoothstep(0.1, 1.0, away + (ragged - 0.5) * 0.9);
    }
    bright = min(bright, 1.0);
    colour += vec3(1.0, 0.84, 0.5) * bright * (0.1 + 0.65 * strands);

    // A coronal hole: a big dark patch with a broken edge.
    float patchy = layers(direction * 4.0 + 3.7);
    float inHole = 0.0;
    for (int n = 0; n < ${String(CORONAL_HOLES.length)}; n += 1) {
      float away = distance(direction, holes[n].xyz) / holes[n].w + (patchy - 0.5) * 1.1;
      inHole = max(inHole, 1.0 - smoothstep(0.5, 1.0, away));
    }
    // Colours here are in linear light, where a patch must be much darker to look dark.
    colour = mix(colour, colour * vec3(0.1, 0.05, 0.03), 0.9 * inHole);

    // Filaments: a few short, thin dark threads that snake across the face.
    float thread = abs(noise(direction * 2.6 + 11.0) - 0.5);
    float pieces = smoothstep(0.6, 0.72, noise(direction * 3.3 + 5.0));
    float filament = (1.0 - smoothstep(0.004, 0.016, thread)) * pieces * (1.0 - inHole) * (1.0 - bright);
    colour = mix(colour, colour * vec3(0.16, 0.07, 0.04), 0.85 * filament);

    // The edge of the Sun glows, as it does in the real pictures.
    float towardsViewer = clamp(normalize(vFacing).z, 0.0, 1.0);
    colour += rim * pow(1.0 - towardsViewer, 3.0) * 0.6;

    gl_FragColor = vec4(colour, 1.0);
    #include <colorspace_fragment>
  }
`;

/** A small repeatable random stream, so the drawing is the same every time. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Loops of glowing gas standing on the bright patches; they show best at the Sun's edge. */
function createLoops(): { group: Group; dispose(): void } {
  const group = new Group();
  const material = new MeshBasicMaterial({
    color: LOOP_COLOR,
    blending: AdditiveBlending,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    side: DoubleSide,
  });
  const geometries: TorusGeometry[] = [];
  const random = seeded(7);
  const up = new Vector3(0, 1, 0);
  for (const [x, y, z, size] of ACTIVE_REGIONS) {
    const foot = new Vector3(x, y, z).normalize();
    // The loops of one patch stand nearly in one plane, one inside another, as real ones do.
    const turned = random() * Math.PI;
    const stand = new Quaternion().setFromUnitVectors(up, foot);
    for (let n = 0; n < LOOPS_PER_REGION; n += 1) {
      const height = LOOP_HEIGHT * size * (1 + (2 * (n + 1)) / LOOPS_PER_REGION);
      // Half a ring, standing on the surface with both feet down.
      const geometry = new TorusGeometry(height, height * 0.035, 6, 28, Math.PI);
      geometries.push(geometry);
      const loop = new Mesh(geometry, material);
      // The ring's own up (+y) is turned to point straight out of the Sun, then the loop is
      // spun about that line.
      const spin = new Quaternion().setFromAxisAngle(foot, turned + (random() - 0.5) * 0.3);
      loop.quaternion.copy(spin.multiply(stand));
      // Some arch up taller than they are wide.
      loop.scale.y = 1 + random() * 0.6;
      loop.position.copy(foot).multiplyScalar(0.995);
      group.add(loop);
    }
  }
  return {
    group,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * The glow around the Sun: bright against the edge, fading outwards, with faint streamers of
 * uneven length as in pictures of the corona.
 */
export function createSunGlow(): Sprite {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const middle = size / 2;
    const edge = middle / GLOW_RADII;
    const gradient = context.createRadialGradient(middle, middle, 0, middle, middle, middle);
    // The Sun itself covers the middle; the glow only shows around it.
    gradient.addColorStop(0, 'rgba(255, 214, 130, 0.9)');
    gradient.addColorStop(edge / middle, 'rgba(255, 220, 150, 0.75)');
    gradient.addColorStop((edge * 1.35) / middle, 'rgba(255, 190, 100, 0.26)');
    gradient.addColorStop((edge * 2) / middle, 'rgba(255, 170, 80, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 170, 80, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    context.globalCompositeOperation = 'lighter';
    const random = seeded(3);
    for (let n = 0; n < STREAMERS; n += 1) {
      const angle = random() * Math.PI * 2;
      const reach = edge * (1.18 + random() * 0.75);
      const width = 0.03 + random() * 0.09;
      const streamer = context.createRadialGradient(
        middle,
        middle,
        edge * 0.9,
        middle,
        middle,
        reach,
      );
      streamer.addColorStop(0, 'rgba(255, 205, 120, 0.1)');
      streamer.addColorStop(1, 'rgba(255, 205, 120, 0)');
      context.fillStyle = streamer;
      context.beginPath();
      context.moveTo(middle, middle);
      context.arc(middle, middle, reach, angle - width, angle + width);
      context.closePath();
      context.fill();
    }
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(
    new SpriteMaterial({ map, blending: AdditiveBlending, depthWrite: false, transparent: true }),
  );
  sprite.scale.setScalar(GLOW_RADII * 2);
  return sprite;
}

/** Directions made exactly one unit long, with their sizes, flattened for the shader. */
function onSphere(
  spots: readonly (readonly [x: number, y: number, z: number, size: number])[],
): number[] {
  return spots.flatMap(([x, y, z, size]) => [...new Vector3(x, y, z).normalize().toArray(), size]);
}

export interface SunSurface {
  /** The loops; goes in the frame the Sun's model turns in, where one unit is one Sun radius. */
  readonly group: Group;
  /** Redraws the model's own surface with the Sun's details over its picture. */
  dress(model: Object3D, frame: Object3D): void;
  /** Lets the grain churn for this many seconds of running time. */
  flow(seconds: number): void;
  dispose(): void;
}

export function createSunSurface(): SunSurface {
  const loops = createLoops();
  const uniforms = {
    map: { value: null as Texture | null },
    churn: { value: 0 },
    rim: { value: new Color(RIM_COLOR) },
    toSunFrame: { value: new Matrix3() },
    regions: { value: onSphere(ACTIVE_REGIONS) },
    holes: { value: onSphere(CORONAL_HOLES) },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
  const replaced: Material[] = [];

  return {
    group: loops.group,
    dress(model, frame) {
      frame.updateWorldMatrix(true, true);
      const toFrame = new Matrix4();
      model.traverse((part) => {
        if (!(part instanceof Mesh)) return;
        const old = [part.material].flat() as (Material & {
          emissiveMap?: Texture | null;
          map?: Texture | null;
        })[];
        const picture = old.map((one) => one.emissiveMap ?? one.map ?? null).find(Boolean);
        // Without the model's own picture there is nothing to draw the details over.
        if (!picture) return;
        uniforms.map.value = picture;
        // How the model's mesh is turned inside the frame that the loops stand in.
        toFrame.copy(frame.matrixWorld).invert().multiply(part.matrixWorld);
        uniforms.toSunFrame.value.setFromMatrix4(toFrame);
        replaced.push(...old);
        part.material = material;
      });
    },
    flow(seconds) {
      uniforms.churn.value += seconds * CHURN;
    },
    dispose() {
      loops.dispose();
      material.dispose();
      for (const old of replaced) old.dispose();
    },
  };
}
