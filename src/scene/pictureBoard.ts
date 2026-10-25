import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';

/**
 * Real pictures of a small place from space, flat, as the satellite took them: for a 3D
 * close-up whose button swaps its drawing for the real picture of the moment. The picture
 * keeps its real shape on the ground (`widthKm` by `heightKm`), and a bar under it shows a
 * round length on the same ground. One unit is the picture's height; the board is centred on
 * the picture and faces +z.
 */
const BAR_COLOR = '#ffffff';
const BAR_BELOW = 0.06;
const BAR_THICKNESS = 0.012;
const LABEL_HEIGHT = 0.07;
const LABEL_PIXELS = 64;

export interface PictureBoardOptions {
  /** Where the app serves each picture from, in the story's order. */
  readonly urls: readonly string[];
  /** How much ground every picture shows. */
  readonly widthKm: number;
  readonly heightKm: number;
  /**
   * The length the bar stands for, in km, and its words ("2 km"); `null` for no bar, for a
   * picture so wide that no one length holds across it (the whole world).
   */
  readonly bar: { readonly km: number; readonly label: string } | null;
}

export interface PictureBoard {
  readonly group: Group;
  /** How tall the board is with its bar, in units of the picture's height. */
  readonly height: number;
  /** Shows the picture of this index, or none. */
  set(index: number | null): void;
  dispose(): void;
}

/** Words drawn on a canvas, laid on a plane `height` tall, faced +z. */
export function createLabel(
  text: string,
  height: number,
  color = BAR_COLOR,
): { readonly mesh: Mesh; dispose(): void } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const font = `600 ${String(LABEL_PIXELS * 0.7)}px system-ui, sans-serif`;
  if (context) context.font = font;
  const width = Math.ceil((context?.measureText(text).width ?? LABEL_PIXELS) + LABEL_PIXELS * 0.4);
  canvas.width = width;
  canvas.height = LABEL_PIXELS;
  if (context) {
    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, LABEL_PIXELS / 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const geometry = new PlaneGeometry((height * width) / LABEL_PIXELS, height);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  return {
    mesh: new Mesh(geometry, material),
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

export function createPictureBoard(options: PictureBoardOptions): PictureBoard {
  const group = new Group();
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const width = options.widthKm / options.heightKm;
  const material = keep(new MeshBasicMaterial({ color: BAR_COLOR }));
  const picture = new Mesh(keep(new PlaneGeometry(width, 1)), material);
  picture.visible = false;
  group.add(picture);

  const maps: (Texture | null)[] = options.urls.map(() => null);
  const loader = new TextureLoader();
  let shown: number | null = null;
  /** Puts the picture asked for on show, once it has come. */
  const show = (): void => {
    const map = shown === null ? null : (maps[shown] ?? null);
    picture.visible = map !== null;
    if (map && material.map !== map) {
      material.map = map;
      material.needsUpdate = true;
    }
  };
  options.urls.forEach((url, index) => {
    const map = loader.load(url, () => {
      maps[index] = map;
      show();
    });
    map.colorSpace = SRGBColorSpace;
    keep(map);
  });

  // The scale bar, under the picture's left edge, and its words after it.
  if (options.bar) {
    const barWidth = options.bar.km / options.heightKm;
    const barY = -0.5 - BAR_BELOW;
    const bar = new Mesh(
      keep(new PlaneGeometry(barWidth, BAR_THICKNESS)),
      keep(new MeshBasicMaterial({ color: BAR_COLOR })),
    );
    bar.position.set(-width / 2 + barWidth / 2, barY, 0);
    group.add(bar);
    const label = keep(createLabel(options.bar.label, LABEL_HEIGHT));
    const labelWidth = (label.mesh.geometry as PlaneGeometry).parameters.width;
    label.mesh.position.set(-width / 2 + barWidth + labelWidth / 2, barY, 0);
    group.add(label.mesh);
  }

  return {
    group,
    height: 1 + 2 * BAR_BELOW,
    set(index) {
      shown = index;
      show();
    },
    dispose() {
      for (const item of disposables) item.dispose();
    },
  };
}
