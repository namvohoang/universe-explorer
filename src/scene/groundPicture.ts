import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Mesh,
  MeshLambertMaterial,
  SRGBColorSpace,
  TextureLoader,
} from 'three';

/**
 * How far above the ground a picture is laid, in radii of the world: enough to stay clear of
 * the map under it. A drawing choice.
 */
const PICTURE_LIFT = 0.002;
/** How finely the patch follows the round of the world. */
const SEGMENTS = 32;
/** The share of the picture's width over which each edge fades into the map round it. */
const EDGE_FADE = 0.08;
const FADE_PIXELS = 128;
const DEG = Math.PI / 180;
const ANISOTROPY = 8;

/** The part of a world a picture shows: its edges in degrees east and degrees north. */
export interface PictureBox {
  readonly westDeg: number;
  readonly southDeg: number;
  readonly eastDeg: number;
  readonly northDeg: number;
}

/** A square that is solid in the middle and fades to nothing at its edges. */
function edgeFade(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = FADE_PIXELS;
  canvas.height = FADE_PIXELS;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, FADE_PIXELS, FADE_PIXELS);
    // One fade across and one down, multiplied: a corner is as faint as both its edges make it.
    context.globalCompositeOperation = 'multiply';
    for (const across of [true, false]) {
      const fade = across
        ? context.createLinearGradient(0, 0, FADE_PIXELS, 0)
        : context.createLinearGradient(0, 0, 0, FADE_PIXELS);
      fade.addColorStop(0, '#000');
      fade.addColorStop(EDGE_FADE, '#fff');
      fade.addColorStop(1 - EDGE_FADE, '#fff');
      fade.addColorStop(1, '#000');
      context.fillStyle = fade;
      context.fillRect(0, 0, FADE_PIXELS, FADE_PIXELS);
    }
  }
  return new CanvasTexture(canvas);
}

/**
 * A picture of part of a world, taken from above and laid out evenly in longitude and
 * latitude, put back on the world where it belongs. To be added to the world's turning frame,
 * where one unit is its radius, +y its north pole and longitude 0 along +x. It is lit by the
 * star like the ground under it, and its edges fade into the map.
 */
export interface GroundPicture {
  readonly mesh: Mesh;
  /** Shows the picture or puts it away. Nothing is drawn until the picture itself has come. */
  show(now: boolean): void;
  dispose(): void;
}

export function createGroundPicture(box: PictureBox, url: string): GroundPicture {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= SEGMENTS; row++) {
    const up = row / SEGMENTS;
    const lat = (box.southDeg + (box.northDeg - box.southDeg) * up) * DEG;
    for (let column = 0; column <= SEGMENTS; column++) {
      const across = column / SEGMENTS;
      const lon = (box.westDeg + (box.eastDeg - box.westDeg) * across) * DEG;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = -Math.cos(lat) * Math.sin(lon);
      positions.push(x * (1 + PICTURE_LIFT), y * (1 + PICTURE_LIFT), z * (1 + PICTURE_LIFT));
      normals.push(x, y, z);
      uvs.push(across, up);
      if (row < SEGMENTS && column < SEGMENTS) {
        const at = row * (SEGMENTS + 1) + column;
        const above = at + SEGMENTS + 1;
        indices.push(at, at + 1, above, at + 1, above + 1, above);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  const fade = edgeFade();
  const material = new MeshLambertMaterial({
    alphaMap: fade,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new Mesh(geometry, material);
  // Nothing is drawn until the picture has come.
  mesh.visible = false;
  let wanted = false;
  const map = new TextureLoader().load(url, () => {
    material.map = map;
    material.needsUpdate = true;
    mesh.visible = wanted;
  });
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = ANISOTROPY;
  return {
    mesh,
    show(now) {
      wanted = now;
      mesh.visible = now && material.map !== null;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      fade.dispose();
      map.dispose();
    },
  };
}
