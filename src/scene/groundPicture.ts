import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
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
/** At most this many degrees for one piece of a wide picture. */
const DEG_PER_SEGMENT = 2;
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

/**
 * A patch of a unit sphere between the edges of `box`, standing `lift` radii off it, with a
 * picture's left edge at the west and its top at the north.
 */
export function patchGeometry(
  box: PictureBox,
  lift: number,
  /** How many flat pieces across and up: enough that none sags under the ground between its corners. */
  segments = SEGMENTS,
): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= segments; row++) {
    const up = row / segments;
    const lat = (box.southDeg + (box.northDeg - box.southDeg) * up) * DEG;
    for (let column = 0; column <= segments; column++) {
      const across = column / segments;
      const lon = (box.westDeg + (box.eastDeg - box.westDeg) * across) * DEG;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = -Math.cos(lat) * Math.sin(lon);
      positions.push(x * (1 + lift), y * (1 + lift), z * (1 + lift));
      normals.push(x, y, z);
      uvs.push(across, up);
      if (row < segments && column < segments) {
        const at = row * (segments + 1) + column;
        const above = at + segments + 1;
        indices.push(at, at + 1, above, at + 1, above + 1, above);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  return geometry;
}

/** How far the ring round a place reaches from it, in degrees of latitude: a drawing choice. */
const MARK_REACH_DEG = 0.7;
const MARK_PIXELS = 128;
const MARK_COLOR = '#ffd23f';

/**
 * A ring on the ground round one place, for a place far too small to see from space. Its
 * patch is wider in longitude by one over the cosine of the latitude, so the ring is round on
 * the ground. It is not lit: it is a mark, not part of the world.
 */
export function createPlaceMark(lonDegEast: number, latDegNorth: number): GroundPicture {
  const across = MARK_REACH_DEG / Math.cos(latDegNorth * DEG);
  const geometry = patchGeometry(
    {
      westDeg: lonDegEast - across,
      southDeg: latDegNorth - MARK_REACH_DEG,
      eastDeg: lonDegEast + across,
      northDeg: latDegNorth + MARK_REACH_DEG,
    },
    PICTURE_LIFT,
  );
  const canvas = document.createElement('canvas');
  canvas.width = MARK_PIXELS;
  canvas.height = MARK_PIXELS;
  const context = canvas.getContext('2d');
  if (context) {
    context.strokeStyle = MARK_COLOR;
    context.lineWidth = MARK_PIXELS * 0.08;
    context.beginPath();
    context.arc(MARK_PIXELS / 2, MARK_PIXELS / 2, MARK_PIXELS * 0.42, 0, 2 * Math.PI);
    context.stroke();
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  const mesh = new Mesh(geometry, material);
  return {
    mesh,
    show(now) {
      mesh.visible = now;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      map.dispose();
    },
  };
}

export function createGroundPicture(box: PictureBox, url: string): GroundPicture {
  // A wide picture needs more pieces, so that none sags under the ground between its corners.
  const spanDeg = Math.max(box.eastDeg - box.westDeg, box.northDeg - box.southDeg);
  const geometry = patchGeometry(
    box,
    PICTURE_LIFT,
    Math.max(SEGMENTS, Math.ceil(spanDeg / DEG_PER_SEGMENT)),
  );
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
