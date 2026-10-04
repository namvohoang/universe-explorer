import type { ScreenPoint } from '../scene/stage';
import { create } from './dom';

/** A body smaller than this many pixels across gets a marker so it can be found and tapped. */
const MARKER_BELOW_PIXELS = 14;

export interface MarkerTarget {
  readonly id: string;
  /** Text read out for the marker, e.g. "Go to Saturn". */
  readonly label: string;
}

export interface Markers {
  /** Call every frame with where each body is on screen and how big it is drawn. */
  update(place: (id: string) => { point: ScreenPoint; radiusPixels: number }): void;
}

/**
 * A small ring over every body too tiny to see, placed in a layer above the canvas. Bodies do
 * not get bigger to be findable; the marker says "something is here" and takes the tap.
 */
export function createMarkers(
  layer: HTMLElement,
  targets: readonly MarkerTarget[],
  onPick: (id: string) => void,
): Markers {
  const markers = targets.map((target) => {
    const button = create('button', 'marker');
    button.type = 'button';
    button.setAttribute('aria-label', target.label);
    button.title = target.label;
    button.hidden = true;
    button.addEventListener('click', () => {
      onPick(target.id);
    });
    layer.append(button);
    return { id: target.id, button, shown: false };
  });

  return {
    update(place) {
      for (const marker of markers) {
        const { point, radiusPixels } = place(marker.id);
        const show = point.visible && radiusPixels * 2 < MARKER_BELOW_PIXELS;
        if (show) {
          marker.button.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
        }
        if (show !== marker.shown) {
          marker.button.hidden = !show;
          marker.shown = show;
        }
      }
    },
  };
}
