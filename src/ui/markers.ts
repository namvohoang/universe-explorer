import type { ScreenPoint } from '../scene/stage';
import { create } from './dom';

/** A body smaller than this many pixels across gets a ring so it can be found and tapped. */
const RING_BELOW_PIXELS = 14;
/** Rough size of a name pill, for telling whether two would overlap. */
const NAME_HEIGHT_PIXELS = 26;
const NAME_PIXELS_PER_LETTER = 8;
const NAME_PADDING_PIXELS = 22;

interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

const overlaps = (a: Box, b: Box): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

export interface MarkerTarget {
  readonly id: string;
  /** The name shown under the body. */
  readonly name: string;
  /** Text read out for the marker, e.g. "Go to Saturn". */
  readonly label: string;
}

export interface MarkerPlace {
  readonly point: ScreenPoint;
  readonly radiusPixels: number;
}

export interface Markers {
  /** Call every frame with where each body is on screen and how big it is drawn. */
  update(place: (id: string) => MarkerPlace): void;
  /** Shows or hides the names; rings over tiny bodies stay either way. */
  setNames(shown: boolean): void;
}

/**
 * For every body, a tappable spot in a layer above the canvas: a ring when the body is too tiny
 * to see, and its name underneath. Bodies are never enlarged to be findable; the ring says
 * "something is here" and takes the tap.
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
    button.hidden = true;
    const name = create('span', 'marker-name', target.name);
    button.append(name);
    button.addEventListener('click', () => {
      onPick(target.id);
    });
    layer.append(button);
    return { target, button, name, shown: false, ringed: false, named: true, drop: -1 };
  });

  return {
    update(place) {
      // Names are placed in the order of the targets; one that would cover a name already
      // placed is left out, so the crowd near the Sun stays readable.
      const placed: Box[] = [];
      for (const marker of markers) {
        const { point, radiusPixels } = place(marker.target.id);
        if (point.visible !== marker.shown) {
          marker.button.hidden = !point.visible;
          marker.shown = point.visible;
        }
        if (!point.visible) continue;
        marker.button.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;

        const ringed = radiusPixels * 2 < RING_BELOW_PIXELS;
        if (ringed !== marker.ringed) {
          marker.button.classList.toggle('ringed', ringed);
          marker.ringed = ringed;
        }
        // The name sits just under the body, or just under the ring.
        const drop = Math.round(Math.max(radiusPixels, ringed ? 8 : 0) + 6);
        if (drop !== marker.drop) {
          marker.name.style.top = `${String(22 + drop)}px`;
          marker.drop = drop;
        }
        const halfWidth =
          (marker.target.name.length * NAME_PIXELS_PER_LETTER + NAME_PADDING_PIXELS) / 2;
        const box: Box = {
          left: point.x - halfWidth,
          right: point.x + halfWidth,
          top: point.y + drop,
          bottom: point.y + drop + NAME_HEIGHT_PIXELS,
        };
        const named = !placed.some((other) => overlaps(box, other));
        if (named) placed.push(box);
        if (named !== marker.named) {
          marker.name.hidden = !named;
          marker.named = named;
        }
      }
    },
    setNames(shown) {
      layer.classList.toggle('no-names', !shown);
    },
  };
}
