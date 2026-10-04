import { CanvasTexture, NoColorSpace, RepeatWrapping, ShaderMaterial, type Color } from 'three';
import { seededRandom } from './model';

/**
 * How a star's face is drawn. Nobody has a map of another star's surface, so this is a
 * drawing, and the card says so:
 * - every star is a little darker towards its edge, as the Sun is;
 * - a giant star gets a few huge brighter and darker patches. Giants are thought to have
 *   enormous cells of rising and sinking gas, and the few pictures there are (Antares,
 *   Betelgeuse) show bright patches. Where the patches are is made up.
 */

/** How much darker the edge of a star's disc is than its middle. */
const EDGE_DARKENING = 0.55;
/** How far a giant's patches go from the star's own colour, brighter or darker. */
const PATCH_CONTRAST = 0.4;
const PATCHES = 70;
const MAP_WIDTH = 512;
const MAP_HEIGHT = 256;

// The logdepthbuf chunks keep the star ordered correctly with the stage's logarithmic depth.
const VERTEX = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vUv;
  varying vec3 vFacing;
  void main() {
    vUv = uv;
    vFacing = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const FRAGMENT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>
  uniform sampler2D patches;
  uniform vec3 tint;
  uniform float contrast;
  uniform float edge;
  varying vec2 vUv;
  varying vec3 vFacing;
  void main() {
    #include <logdepthbuf_fragment>
    // The map is mid-grey where the star is its own colour, lighter and darker in patches.
    float mottle = (texture2D(patches, vUv).r - 0.5) * 2.0 * contrast;
    float towardsViewer = clamp(normalize(vFacing).z, 0.0, 1.0);
    float limb = 1.0 - edge * (1.0 - sqrt(towardsViewer));
    gl_FragColor = vec4(tint * (1.0 + mottle) * limb, 1.0);
    #include <colorspace_fragment>
  }
`;

/** A map of soft patches round a globe: mid-grey with lighter and darker blobs. */
function patchMap(seed: number): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_WIDTH;
  canvas.height = MAP_HEIGHT;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgb(128,128,128)';
    context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    const random = seededRandom(seed);
    for (let n = 0; n < PATCHES; n += 1) {
      const x = random() * MAP_WIDTH;
      // Fewer patches near the poles, where a flat map is stretched.
      const y = (0.15 + random() * 0.7) * MAP_HEIGHT;
      const radius = (0.04 + random() * 0.08) * MAP_HEIGHT;
      const shade = random() < 0.5 ? 255 : 0;
      // Drawn three times across so a patch on the seam of the map joins up.
      for (const shift of [-MAP_WIDTH, 0, MAP_WIDTH]) {
        const blob = context.createRadialGradient(x + shift, y, 0, x + shift, y, radius * 2);
        blob.addColorStop(0, `rgba(${String(shade)},${String(shade)},${String(shade)},0.7)`);
        blob.addColorStop(1, `rgba(${String(shade)},${String(shade)},${String(shade)},0)`);
        context.fillStyle = blob;
        context.fillRect(x + shift - radius * 2, y - radius * 2, radius * 4, radius * 4);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  // The map holds amounts, not colours, so it is read as plain numbers.
  texture.colorSpace = NoColorSpace;
  return texture;
}

export interface StarSurface {
  readonly material: ShaderMaterial;
  dispose(): void;
}

/** The face of a star in its own colour; `patchy` for a giant, smooth for an ordinary star. */
export function createStarSurface(color: Color, patchy: boolean, seed: number): StarSurface {
  const patches = patchMap(seed);
  const material = new ShaderMaterial({
    uniforms: {
      patches: { value: patches },
      tint: { value: color },
      contrast: { value: patchy ? PATCH_CONTRAST : 0 },
      edge: { value: EDGE_DARKENING },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
  return {
    material,
    dispose() {
      patches.dispose();
      material.dispose();
    },
  };
}
