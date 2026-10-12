import { CanvasTexture, LinearFilter, Mesh, MeshBasicMaterial } from 'three';
import { patchGeometry } from './groundPicture';

/** The colour of the band of sea the wave has just crossed. */
const BAND_RGB: readonly [number, number, number] = [191, 234, 255];
/** How strongly the band is drawn at its leading edge. A drawing choice. */
const BAND_STRENGTH = 0.85;
/** The band fades out over the sea the wave crossed this many minutes ago. A drawing choice. */
const TRAIL_MINUTES = 45;
/** The band comes up to full strength over this many minutes behind its leading edge. A drawing choice. */
const LEADING_EDGE_MINUTES = 8;
/** The band is drawn afresh only when the story has moved on by this much. */
const REDRAW_MINUTES = 0.25;
/** How far above the ground it is laid, in radii of the world: clear of the map and of any picture. */
const LIFT = 0.004;
/** Pieces across and up the whole world: 2 degrees each, which sags far less than the lift. */
const WORLD_SEGMENTS = 180;
const WHOLE_WORLD = { westDeg: -180, southDeg: -90, eastDeg: 180, northDeg: 90 } as const;

/** How the picture of arrival times is laid out. */
export interface ArrivalMap {
  readonly url: string;
  readonly cellsAcross: number;
  readonly cellsUp: number;
  /** The picture holds this many units to a minute, in its red (high) and green (low) bytes. */
  readonly unitsPerMinute: number;
}

/**
 * The sea a tsunami's front has just crossed, as a pale band over a whole world, from a
 * picture that holds how many minutes the wave takes to reach each cell of the sea. To be
 * added to the world's turning frame. Nothing is drawn until the picture has come.
 */
export interface TsunamiFront {
  readonly mesh: Mesh;
  /** Draws the band for so many minutes after the tsunami began. */
  set(minutesAfter: number): void;
  dispose(): void;
}

export function createTsunamiFront(map: ArrivalMap): TsunamiFront {
  const canvas = document.createElement('canvas');
  canvas.width = map.cellsAcross;
  canvas.height = map.cellsUp;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  const geometry = patchGeometry(WHOLE_WORLD, LIFT, WORLD_SEGMENTS);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const mesh = new Mesh(geometry, material);
  mesh.visible = false;

  /** Minutes to each cell, row by row from the north; not a number for land and sea never reached. */
  let minutes: Float32Array | null = null;
  let drawn: ImageData | null = null;
  let drawnFor = NaN;
  let wanted = NaN;

  const draw = (minutesAfter: number): void => {
    if (!minutes || !drawn || !context) return;
    const pixels = drawn.data;
    for (let cell = 0; cell < minutes.length; cell++) {
      const since = minutesAfter - (minutes[cell] ?? NaN);
      // Not a number, not yet reached, or crossed too long ago: nothing. The leading edge
      // comes up over a few minutes, so that a cell reached a little later than the one beside
      // it (in the lee of an island, say) does not show as a hard notch in the front.
      const strength =
        since >= 0 && since < TRAIL_MINUTES
          ? Math.min(since / LEADING_EDGE_MINUTES, 1 - since / TRAIL_MINUTES)
          : 0;
      pixels[cell * 4 + 3] = Math.round(255 * BAND_STRENGTH * strength);
    }
    context.putImageData(drawn, 0, 0);
    texture.needsUpdate = true;
    drawnFor = minutesAfter;
    mesh.visible = true;
  };

  const picture = new Image();
  picture.addEventListener('load', () => {
    if (!context) return;
    context.drawImage(picture, 0, 0, map.cellsAcross, map.cellsUp);
    const read = context.getImageData(0, 0, map.cellsAcross, map.cellsUp).data;
    const times = new Float32Array(map.cellsAcross * map.cellsUp);
    for (let cell = 0; cell < times.length; cell++) {
      const reached = (read[cell * 4 + 2] ?? 0) > 127;
      const units = (read[cell * 4] ?? 0) * 256 + (read[cell * 4 + 1] ?? 0);
      times[cell] = reached ? units / map.unitsPerMinute : NaN;
    }
    minutes = times;
    drawn = context.createImageData(map.cellsAcross, map.cellsUp);
    for (let cell = 0; cell < times.length; cell++) {
      drawn.data[cell * 4] = BAND_RGB[0];
      drawn.data[cell * 4 + 1] = BAND_RGB[1];
      drawn.data[cell * 4 + 2] = BAND_RGB[2];
    }
    if (!Number.isNaN(wanted)) draw(wanted);
  });
  picture.src = map.url;

  return {
    mesh,
    set(minutesAfter) {
      wanted = minutesAfter;
      if (Math.abs(minutesAfter - drawnFor) >= REDRAW_MINUTES || Number.isNaN(drawnFor)) {
        draw(minutesAfter);
      }
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}
