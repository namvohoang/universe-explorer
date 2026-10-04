import { CanvasTexture, Sprite, SpriteMaterial } from 'three';

const FONT = "700 44px 'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif";
const PADDING = 18;
const HEIGHT = 72;

/** A name that floats beside something in a 3D model and always faces the viewer. */
export function createLabel(text: string, height: number): Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let width = 256;
  if (context) {
    context.font = FONT;
    width = Math.ceil(context.measureText(text).width) + PADDING * 2;
    canvas.width = width;
    canvas.height = HEIGHT;
    context.font = FONT;
    context.fillStyle = 'rgba(6, 9, 20, 0.6)';
    context.beginPath();
    context.roundRect(0, 0, width, HEIGHT, HEIGHT / 2);
    context.fill();
    context.fillStyle = '#f4eedc';
    context.textBaseline = 'middle';
    context.fillText(text, PADDING, HEIGHT / 2 + 2);
  }
  const sprite = new Sprite(
    new SpriteMaterial({ map: new CanvasTexture(canvas), depthWrite: false, transparent: true }),
  );
  sprite.scale.set((height * width) / HEIGHT, height, 1);
  return sprite;
}

export function disposeLabel(label: Sprite): void {
  label.material.map?.dispose();
  label.material.dispose();
}
