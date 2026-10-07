import type { PaneBox } from '../scene/stage';
import { create } from './dom';
import type { MarkerPlace } from './markers';

/** A thing smaller than this many pixels across gets a ring so it can be found. */
const RING_BELOW_PIXELS = 14;
/** Rough size of a name pill, for telling whether two would overlap. */
const NAME_HEIGHT_PIXELS = 26;
const NAME_PIXELS_PER_LETTER = 8;
const NAME_PADDING_PIXELS = 22;

export interface SideTags {
  /**
   * Frames the two looks and says what each one is; `null` takes the frames and the names
   * away, for when there is one look only.
   */
  frame(looks: readonly { box: PaneBox; label: string }[] | null): void;
  /** The things to name in the second look. */
  name(things: readonly { id: string; name: string }[]): void;
  /** Call every frame with where each thing is in the second look and how big it is drawn. */
  update(place: (id: string) => MarkerPlace): void;
}

/**
 * What is drawn over two looks shown side by side: a frame round each with a few words on
 * what it is, and in the second look a name under each thing, with a ring where it is too
 * small to see. The names there only say what a thing is; they are not buttons.
 */
export function createSideTags(layer: HTMLElement): SideTags {
  const frames: HTMLElement[] = [];
  let tags: { id: string; name: string; tag: HTMLElement; pill: HTMLElement }[] = [];
  return {
    frame(looks) {
      for (const frame of frames.splice(0)) frame.remove();
      for (const { tag } of tags) tag.hidden = looks === null;
      for (const { box, label } of looks ?? []) {
        const frame = create('div', 'pane');
        frame.style.left = `${String(box.x)}px`;
        frame.style.top = `${String(box.y)}px`;
        frame.style.width = `${String(box.width)}px`;
        frame.style.height = `${String(box.height)}px`;
        frame.append(create('span', 'pane-label', label));
        frames.push(frame);
      }
      // Under the names, in the order the looks are told in.
      layer.prepend(...frames);
    },
    name(things) {
      for (const { tag } of tags) tag.remove();
      tags = things.map(({ id, name }) => {
        const tag = create('div', 'side-tag');
        const pill = create('span', 'marker-name', name);
        tag.hidden = true;
        tag.append(pill);
        layer.append(tag);
        return { id, name, tag, pill };
      });
    },
    update(place) {
      // A name that would cover one already placed is left out, as in the first look.
      const placed: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const { id, name, tag, pill } of tags) {
        const { point, radiusPixels } = place(id);
        tag.hidden = !point.visible;
        if (!point.visible) continue;
        tag.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
        const ringed = radiusPixels * 2 < RING_BELOW_PIXELS;
        tag.classList.toggle('ringed', ringed);
        const drop = Math.round(Math.max(radiusPixels, ringed ? 8 : 0) + 6);
        pill.style.top = `${String(22 + drop)}px`;
        const halfWidth = (name.length * NAME_PIXELS_PER_LETTER + NAME_PADDING_PIXELS) / 2;
        const box = {
          left: point.x - halfWidth,
          right: point.x + halfWidth,
          top: point.y + drop,
          bottom: point.y + drop + NAME_HEIGHT_PIXELS,
        };
        const clear = !placed.some(
          (other) =>
            box.left < other.right &&
            other.left < box.right &&
            box.top < other.bottom &&
            other.top < box.bottom,
        );
        if (clear) placed.push(box);
        pill.hidden = !clear;
      }
    },
  };
}
