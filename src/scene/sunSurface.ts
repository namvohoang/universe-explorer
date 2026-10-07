import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Material,
  type Object3D,
  type Texture,
} from 'three';

/**
 * What is drawn over NASA's model of the Sun so that it shows the things real pictures of the
 * Sun show (NASA's Solar Dynamics Observatory, in ultraviolet light):
 * - a fine grain all over that slowly churns;
 * - bright patches, the active regions, with prominences over them: arches and plumes of
 *   glowing gas, and one funnel that seems to twist like a tornado. NASA's page "Tornadoes On
 *   The Sun?" says scientists do not agree whether such gas really turns or only looks as if
 *   it does;
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
/** How many arches of gas stand on a bright patch, and what each is made of. A drawing choice. */
const ARCHES_PER_REGION = 2;
const SPECKS_PER_ARCH = 1100;
const STRANDS = 6;
/** How wide the haze round a strand is and how big one speck is, in Sun radii. */
const THICKNESS = 0.0035;
const SPECK_SIZE = 0.026;
const PROMINENCE_OPACITY = 0.5;
/** How far below the surface an arch's feet start, so no gap shows: a share of the radius. */
const FEET_AT = 0.985;
/** Which bright patches have a plume and a twister in place of arches. */
const PLUME_AT = 2;
const TWISTER_AT = 5;
/**
 * The twister's funnel: how wide its neck is and how much it flares, in patch widths; how many
 * times a band of gas winds round it and how many bands there are; how fast it seems to turn,
 * in radians per arch length of flow; and how many times an arch's specks it has. A drawing choice.
 */
const TWISTER = { neck: 0.14, flare: 0.75, turns: 1.5, bands: 3, spin: 9, specks: 3 } as const;
/** How fast gas streams along an arch: arch lengths per second of running time. */
const PROMINENCE_FLOW = 0.03;
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

/** A soft round dot: what each speck of glowing gas is drawn with. */
function softDot(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const half = size / 2;
    const gradient = context.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  return map;
}

/** A number from a bell curve around nought, mostly within one either way. */
function bell(random: () => number): number {
  return (random() + random() + random() + random() - 2) * 1.2;
}

/** One speck of gas: which arch it belongs to and how it differs from the arch's middle line. */
interface Speck {
  readonly arch: number;
  /** Where along the arch it starts, 0 at one foot and 1 at the other (or the top of a plume). */
  readonly start: number;
  /** Which strand of the arch it rides: a little wider or narrower, taller or lower. */
  readonly wide: number;
  readonly tall: number;
  /** Its own sideways drift off the strand, three ways. */
  readonly drift: readonly [number, number, number];
  readonly speed: number;
}

/** An arch of gas over a bright patch, or a plume flung out of one. */
interface Arch {
  readonly foot: Vector3;
  /** The direction from one foot to the other, along the ground. */
  readonly along: Vector3;
  /** The direction the arch leans over in, along the ground. */
  readonly aside: Vector3;
  readonly width: number;
  readonly height: number;
  readonly lean: number;
  /**
   * An arch stands on two feet. A plume rises from one spot and does not come back down. A
   * twister is a funnel of gas that seems to turn like a tornado.
   */
  readonly shape: 'arch' | 'plume' | 'twister';
}

/**
 * Prominences: arches, plumes and a twisting funnel of glowing gas over the bright patches. They are soft
 * clouds of specks, thick and bright at the feet and thin and redder at the top, as in NASA's
 * pictures; they show best at the Sun's edge. Their shapes are made up.
 */
function createProminences(): {
  group: Group;
  setRadius(radius: number): void;
  flow(seconds: number): void;
  dispose(): void;
} {
  const group = new Group();
  const random = seeded(7);
  const arches: Arch[] = [];
  const specks: Speck[] = [];
  const pole = new Vector3(0, 1, 0);
  ACTIVE_REGIONS.forEach(([x, y, z, size], region) => {
    const foot = new Vector3(x, y, z).normalize();
    // Two directions along the ground at the foot, square to each other.
    const east = new Vector3().crossVectors(pole, foot).normalize();
    const north = new Vector3().crossVectors(foot, east);
    const turned = random() * Math.PI;
    const along = east
      .clone()
      .multiplyScalar(Math.cos(turned))
      .addScaledVector(north, Math.sin(turned));
    const aside = new Vector3().crossVectors(foot, along);
    // One patch flings out a plume, one has a twister, and the others hold up arches.
    const shape = region === PLUME_AT ? 'plume' : region === TWISTER_AT ? 'twister' : 'arch';
    const single = shape !== 'arch';
    for (let n = 0; n < (single ? 1 : ARCHES_PER_REGION); n += 1) {
      const arch = arches.length;
      arches.push({
        foot,
        along,
        aside,
        width: size * (single ? 0.35 : 0.55 + 0.5 * random()),
        height:
          size * (shape === 'plume' ? 1.3 : shape === 'twister' ? 0.75 : 0.45 + 0.55 * random()),
        lean: size * (random() - 0.5) * 0.5,
        shape,
      });
      const specksHere = SPECKS_PER_ARCH * (shape === 'twister' ? TWISTER.specks : 1);
      for (let s = 0; s < specksHere; s += 1) {
        // A handful of strands, one inside another, each with a haze of specks around it.
        const strand = Math.floor(random() * STRANDS) / STRANDS;
        specks.push({
          arch,
          start: random(),
          wide: 0.55 + 0.45 * strand,
          tall: 0.5 + 0.5 * strand,
          drift: [bell(random), bell(random), bell(random)],
          speed: 0.6 + 0.8 * random(),
        });
      }
    }
  });

  const count = specks.length;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 4);
  const geometry = new BufferGeometry();
  const positionAttribute = new BufferAttribute(positions, 3);
  const colorAttribute = new BufferAttribute(colors, 4);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', colorAttribute);

  let flowed = 0;
  const at = new Vector3();
  const lay = (): void => {
    specks.forEach((speck, n) => {
      const arch = arches[speck.arch];
      if (!arch) return;
      const along = (speck.start + flowed * speck.speed) % 1;
      // How high up the arch this is, 0 at the ground and 1 at the top.
      let up: number;
      // The feet stand a little under the surface, so no gap shows beneath them.
      at.copy(arch.foot).multiplyScalar(FEET_AT);
      if (arch.shape === 'twister') {
        up = along;
        // A funnel, narrow at the ground and wider higher up. Each strand winds round it, and
        // the gas climbs the strands, so the whole funnel seems to turn.
        const band = Math.round(((speck.wide - 0.55) / 0.45) * STRANDS) % TWISTER.bands;
        const around =
          (band / TWISTER.bands) * 2 * Math.PI +
          up * TWISTER.turns * 2 * Math.PI +
          flowed * TWISTER.spin;
        const reach = arch.width * (TWISTER.neck + TWISTER.flare * up ** 1.5);
        at.addScaledVector(arch.foot, up * arch.height);
        at.addScaledVector(arch.along, Math.cos(around) * reach);
        at.addScaledVector(arch.aside, Math.sin(around) * reach + arch.lean * up * up);
      } else if (arch.shape === 'plume') {
        up = along;
        // It rises, fans out and bends over to one side as it goes.
        at.addScaledVector(arch.foot, up * arch.height * speck.tall);
        at.addScaledVector(arch.along, (speck.wide - 0.78) * arch.width * (0.4 + 2 * up));
        at.addScaledVector(arch.aside, up * up * arch.height * 0.45 + arch.lean * up);
      } else {
        const angle = Math.PI * along;
        up = Math.sin(angle);
        at.addScaledVector(arch.along, -Math.cos(angle) * 0.5 * arch.width * speck.wide);
        at.addScaledVector(arch.foot, up * arch.height * speck.tall);
        at.addScaledVector(arch.aside, up * arch.lean);
      }
      // Tight at the feet, wispier higher up.
      const haze = THICKNESS * (0.5 + 1.6 * up) * (arch.shape === 'twister' ? 2.4 : 1);
      at.addScaledVector(arch.along, speck.drift[0] * haze);
      at.addScaledVector(arch.aside, speck.drift[1] * haze);
      at.addScaledVector(arch.foot, speck.drift[2] * haze * 0.6);
      positions[n * 3] = at.x;
      positions[n * 3 + 1] = at.y;
      positions[n * 3 + 2] = at.z;
      // Yellow-white and thick near the ground, orange-red and thin at the top.
      colors[n * 4] = 1;
      colors[n * 4 + 1] = 0.5 - 0.3 * up;
      colors[n * 4 + 2] = 0.12 - 0.09 * up;
      colors[n * 4 + 3] =
        arch.shape === 'arch' ? 0.9 - 0.4 * up : (1 - up) ** (arch.shape === 'twister' ? 0.7 : 1.2);
    });
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  };
  lay();

  const dot = softDot();
  const material = new PointsMaterial({
    map: dot,
    vertexColors: true,
    transparent: true,
    opacity: PROMINENCE_OPACITY,
    depthWrite: false,
    // The gas glows, so its light adds up: brightest where the strands are thickest.
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);
  return {
    group,
    setRadius(radius) {
      // A speck's size is given in scene units, so it follows how big the Sun is drawn.
      material.size = SPECK_SIZE * radius;
    },
    flow(seconds) {
      flowed += seconds * PROMINENCE_FLOW;
      lay();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      dot.dispose();
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
  /** The prominences; goes in the frame the Sun's model turns in, where one unit is one Sun radius. */
  readonly group: Group;
  /** Redraws the model's own surface with the Sun's details over its picture. */
  dress(model: Object3D, frame: Object3D): void;
  /** Tells it how big the Sun is drawn, in scene units. */
  setRadius(radius: number): void;
  /** Lets the grain churn for this many seconds of running time. */
  flow(seconds: number): void;
  dispose(): void;
}

export function createSunSurface(): SunSurface {
  const prominences = createProminences();
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
    group: prominences.group,
    setRadius(radius) {
      prominences.setRadius(radius);
    },
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
      prominences.flow(seconds);
    },
    dispose() {
      prominences.dispose();
      material.dispose();
      for (const old of replaced) old.dispose();
    },
  };
}
