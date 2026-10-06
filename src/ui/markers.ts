import type { ScreenPoint } from '../scene/stage';
import { create } from './dom';

/** A body smaller than this many pixels across gets a ring so it can be found and tapped. */
const RING_BELOW_PIXELS = 14;
/** Half the width of a marker's tap spot, which the stylesheet makes 44 pixels across. */
const TAP_RADIUS_PIXELS = 22;
/** A moon's marker is hidden while it sits this close to its planet on screen. */
const CROWDED_PIXELS = 26;
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
  /** For a moon, its planet: the marker hides while the two are too close to tell apart. */
  readonly parentId: string | null;
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
  /** Draws a pulsing ring round one body to say "tap here", or round none. */
  point(id: string | null): void;
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
  onWheel: (id: string, event: WheelEvent) => void,
): Markers {
  const markers = targets.map((target) => {
    const button = create('button', 'marker');
    button.type = 'button';
    button.setAttribute('aria-label', target.label);
    button.hidden = true;
    const name = create('span', 'marker-name', target.name);
    button.append(name);
    layer.append(button);
    return { target, button, name, shown: false, ringed: false, named: true, drop: -1, x: 0, y: 0 };
  });

  // Where bodies crowd together their tap spots overlap, and the one on top is not always the
  // one pointed at. The body meant is the one whose middle is nearest the pointer.
  const nearest = (id: string, event: MouseEvent): string => {
    let best = id;
    let bestDistance = Infinity;
    for (const marker of markers) {
      if (!marker.shown) continue;
      const distance = Math.hypot(marker.x - event.clientX, marker.y - event.clientY);
      if (distance <= TAP_RADIUS_PIXELS && distance < bestDistance) {
        best = marker.target.id;
        bestDistance = distance;
      }
    }
    return best;
  };
  for (const marker of markers) {
    const { id } = marker.target;
    marker.button.addEventListener('click', (event) => {
      // A press of Enter or Space has no pointer: it means the marker that has the focus.
      onPick(event.detail === 0 ? id : nearest(id, event));
    });
    // The marker lies on top of its body, so the wheel over a body lands here, not on the canvas.
    marker.button.addEventListener(
      'wheel',
      (event) => {
        onWheel(nearest(id, event), event);
      },
      { passive: false },
    );
  }

  return {
    update(place) {
      // Names are placed in the order of the targets; one that would cover a name already
      // placed is left out, so the crowd near the Sun stays readable.
      const placed: Box[] = [];
      for (const marker of markers) {
        const { point, radiusPixels } = place(marker.target.id);
        let visible = point.visible;
        if (visible && marker.target.parentId !== null) {
          const parent = place(marker.target.parentId).point;
          visible = Math.hypot(parent.x - point.x, parent.y - point.y) > CROWDED_PIXELS;
        }
        if (visible !== marker.shown) {
          marker.button.hidden = !visible;
          marker.shown = visible;
        }
        if (!visible) continue;
        marker.button.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
        marker.x = point.x;
        marker.y = point.y;

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
    point(id) {
      for (const marker of markers) {
        marker.button.classList.toggle('pointed', marker.target.id === id);
      }
    },
  };
}
