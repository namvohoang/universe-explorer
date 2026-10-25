import {
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import type { Vec3 } from '../sim/vec3';
import { FIELD_OF_VIEW_DEG } from './stage';

/**
 * The close look of a story told in real pictures of a small place: the picture itself, flat,
 * as the satellite took it, in a scene of its own. A place a few kilometres wide is far too
 * small to see on the globe, which stays beside it to show where on Earth it is.
 *
 * The picture keeps its real shape on the ground (`widthKm` by `heightKm`), and a bar under it
 * shows a round length on the same ground. A button puts the first picture, from before, in
 * its place, to compare.
 */
const BACKGROUND = '#05070f';
const BAR_COLOR = '#ffffff';
/** The picture is drawn this tall; everything else is measured against it. */
const PICTURE_HEIGHT = 1;
/** Room round the picture, as a share of its height, and how far below it the bar sits. */
const MARGIN = 0.2;
const BAR_BELOW = 0.06;
const BAR_THICKNESS = 0.012;
const LABEL_HEIGHT = 0.07;
const LABEL_PIXELS = 64;

export interface PictureSliceOptions {
  /** Where the app serves each picture from, in the story's order. */
  readonly urls: readonly string[];
  /** How much ground every picture shows. */
  readonly widthKm: number;
  readonly heightKm: number;
  /** The length the bar stands for, in km, and its words ("2 km"). */
  readonly barKm: number;
  readonly barLabel: string;
}

export interface PictureSlice {
  readonly scene: Scene;
  readonly target: Vec3;
  readonly distance: number;
  readonly direction: Vec3;
  /** Shows the picture of this index, or none. */
  set(index: number | null): void;
  flow(seconds: number): void;
  /** Puts the first picture in place of the one of the day, or back. */
  toggleView(): void;
  /** Whether the first picture is on show in place of the one of the day. */
  viewToggled(): boolean;
  dispose(): void;
}

/** The words under the bar, drawn on a canvas. */
function labelTexture(text: string): { texture: CanvasTexture; aspect: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const font = `600 ${String(LABEL_PIXELS * 0.7)}px system-ui, sans-serif`;
  if (context) context.font = font;
  const width = Math.ceil((context?.measureText(text).width ?? LABEL_PIXELS) + LABEL_PIXELS * 0.4);
  canvas.width = width;
  canvas.height = LABEL_PIXELS;
  if (context) {
    context.font = font;
    context.fillStyle = BAR_COLOR;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, LABEL_PIXELS / 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, aspect: width / LABEL_PIXELS };
}

export function createPictureSlice(options: PictureSliceOptions): PictureSlice {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const width = (PICTURE_HEIGHT * options.widthKm) / options.heightKm;
  const material = keep(new MeshBasicMaterial({ color: BAR_COLOR }));
  const picture = new Mesh(keep(new PlaneGeometry(width, PICTURE_HEIGHT)), material);
  picture.visible = false;
  scene.add(picture);

  const maps: (Texture | null)[] = options.urls.map(() => null);
  const loader = new TextureLoader();
  options.urls.forEach((url, index) => {
    const map = loader.load(url, () => {
      maps[index] = map;
      show();
    });
    map.colorSpace = SRGBColorSpace;
    keep(map);
  });

  // The scale bar, under the picture's left edge, and its words.
  const barWidth = (PICTURE_HEIGHT * options.barKm) / options.heightKm;
  const barY = -PICTURE_HEIGHT / 2 - BAR_BELOW;
  const bar = new Mesh(keep(new PlaneGeometry(barWidth, BAR_THICKNESS)), material.clone());
  keep(bar.material);
  bar.position.set(-width / 2 + barWidth / 2, barY, 0);
  scene.add(bar);
  const label = labelTexture(options.barLabel);
  keep(label.texture);
  const words = new Mesh(
    keep(new PlaneGeometry(LABEL_HEIGHT * label.aspect, LABEL_HEIGHT)),
    keep(new MeshBasicMaterial({ map: label.texture, transparent: true })),
  );
  words.position.set(-width / 2 + barWidth + (LABEL_HEIGHT * label.aspect) / 2, barY, 0);
  scene.add(words);

  let shown: number | null = null;
  let before = false;

  /** Puts the picture asked for on show, once it has come. */
  function show(): void {
    const index = before ? 0 : shown;
    const map = index === null ? null : (maps[index] ?? null);
    picture.visible = map !== null;
    if (map && material.map !== map) {
      material.map = map;
      material.needsUpdate = true;
    }
  }

  // Far enough back for the picture, its bar and some room to fit a tall pane.
  const tall = PICTURE_HEIGHT * (1 + MARGIN) + BAR_BELOW * 2;
  return {
    scene,
    target: { x: 0, y: -BAR_BELOW, z: 0 },
    distance: tall / (2 * Math.tan((FIELD_OF_VIEW_DEG * Math.PI) / 360)),
    direction: { x: 0, y: 0, z: 1 },

    set(index) {
      shown = index;
      show();
    },

    flow() {
      // A picture is still: nothing moves.
    },

    viewToggled: () => before,

    toggleView() {
      before = !before;
      show();
    },

    dispose() {
      for (const item of disposables) item.dispose();
    },
  };
}
