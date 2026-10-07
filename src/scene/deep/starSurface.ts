import { ShaderMaterial, type Color } from 'three';
import { SURFACE_NOISE } from '../surfaceNoise';

/**
 * How a star's face is drawn. Nobody has a map of another star's surface, so this is a
 * drawing, and the card says so. What sets one star's face apart from another's comes from its
 * own measurements:
 * - its colour is the colour its temperature gives it, a little redder in the darker parts,
 *   since cooler gas glows redder;
 * - every star's face is grained, because a star is a ball of hot gas that churns. The grain is
 *   fine on a star the size of the Sun and grows with the star: a giant gets a few huge
 *   brighter and darker patches. Giants are thought to have enormous cells of rising and
 *   sinking gas, and the few pictures there are (Antares, Betelgeuse) show bright patches;
 * - the grain is drawn stronger on a cool star than on a hot one;
 * - every star is a little darker towards its edge, as the Sun is.
 * Where each patch sits is made up.
 */

/** How much darker the edge of a star's disc is than its middle. */
const EDGE_DARKENING = 0.55;
/** How many grains fit across a star the size of the Sun, and across the biggest giants. */
const GRAINS = { sunLike: 30, giant: 3.2 } as const;
/** A star this many Suns wide, or wider, has the fewest and biggest patches. */
const GIANT_IN_SUNS = 300;
/** How strong the grain is on the coolest and on the hottest stars, and where those ends lie. */
const CONTRAST = { cool: 0.5, hot: 0.16, coolK: 3000, hotK: 10000 } as const;
/** How fast the grain churns on a Sun-sized star, in noise steps per second; giants churn slower. */
const CHURN = 0.05;

// The logdepthbuf chunks keep the star ordered correctly with the stage's logarithmic depth.
const VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vDirection;
  varying vec3 vFacing;
  void main() {
    // A point's normal on a ball is also its direction from the middle.
    vDirection = normalize(normal);
    vFacing = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform vec3 tint;
  uniform float grains;
  uniform float contrast;
  uniform float edge;
  uniform float churn;
  uniform float seed;
  varying vec3 vDirection;
  varying vec3 vFacing;

  ${SURFACE_NOISE}

  void main() {
    #include <logdepthbuf_fragment>
    // Turned off the grid the blotches are worked out on, so no straight edges show.
    vec3 direction = mat3(0.8, 0.36, -0.48, -0.6, 0.48, -0.64, 0.0, 0.8, 0.6) * normalize(vDirection);
    vec3 drift = vec3(0.0, churn, churn * 0.6);
    // Blotches the size of the star's grain, with finer wisps over them.
    float blotch = layers(direction * grains + seed + drift);
    float fine = wisps(direction * grains * 2.4 + seed * 1.7 - drift);
    float light = (blotch - 0.5) * 2.0 * contrast + (fine - 0.55) * contrast * 0.9;
    // Darker gas is cooler, and cooler gas glows redder.
    vec3 colour = tint * (1.0 + light);
    colour *= mix(vec3(1.0), vec3(1.08, 0.97, 0.86), clamp(-light * 1.6, 0.0, 1.0));
    float towardsViewer = clamp(normalize(vFacing).z, 0.0, 1.0);
    float limb = 1.0 - edge * (1.0 - sqrt(towardsViewer));
    gl_FragColor = vec4(colour * limb, 1.0);
    #include <colorspace_fragment>
  }
`;

const between = (value: number, from: number, to: number): number =>
  Math.min(1, Math.max(0, (value - from) / (to - from)));

export interface StarSurface {
  readonly material: ShaderMaterial;
  /** Lets the grain churn for this many seconds. */
  flow(seconds: number): void;
  dispose(): void;
}

/**
 * The face of a star in its own colour, grained to suit its size and temperature.
 * @param radiusInSuns how wide the star is next to the Sun
 * @param temperatureK the temperature its colour comes from
 * @param seed tells one star's made-up patches from another's
 */
export function createStarSurface(
  color: Color,
  radiusInSuns: number,
  temperatureK: number,
  seed: number,
): StarSurface {
  // Size is taken by its number of noughts: ten times wider is one step along.
  const size = between(Math.log10(Math.max(radiusInSuns, 1)), 0, Math.log10(GIANT_IN_SUNS));
  const grains = GRAINS.sunLike + (GRAINS.giant - GRAINS.sunLike) * size;
  const heat = between(temperatureK, CONTRAST.coolK, CONTRAST.hotK);
  const uniforms = {
    tint: { value: color },
    grains: { value: grains },
    contrast: { value: CONTRAST.cool + (CONTRAST.hot - CONTRAST.cool) * heat },
    edge: { value: EDGE_DARKENING },
    churn: { value: 0 },
    seed: { value: seed * 13.7 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
  // Big cells turn over slowly.
  const speed = CHURN * (1 - 0.7 * size);
  return {
    material,
    flow(seconds) {
      uniforms.churn.value += seconds * speed;
    },
    dispose() {
      material.dispose();
    },
  };
}
