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
  frame(
    looks:
      | readonly {
          box: PaneBox;
          label: string;
          /**
           * Real pictures kept small in a corner of the frame, each with what it shows; a tap
           * makes one fill the frame, and another puts it back.
           */
          pictures?: readonly {
            src: string;
            alt: string;
            caption: string;
            bigger: string;
            smaller: string;
          }[];
        }[]
      | null,
  ): void;
  /**
   * Dips the first look to dark and back, for a look that moves to another place at once.
   * It is darkest `DIP_DARK_MS` after the call: the moment to move.
   */
  dip(): void;
  /** The things to name in the second look. */
  name(things: readonly { id: string; name: string; above?: boolean; numbered?: boolean }[]): void;
  /** Call every frame with where each thing is in the second look and how big it is drawn. */
  update(place: (id: string) => MarkerPlace): void;
}

/**
 * What is drawn over two looks shown side by side: a frame round each with a few words on
 * what it is, and in the second look a name under each thing, with a ring where it is too
 * small to see. The names there only say what a thing is; they are not buttons.
 */
/** How long after a dip starts the look is dark, in milliseconds; a third of the way through it. */
export const DIP_DARK_MS = 300;

export function createSideTags(layer: HTMLElement): SideTags {
  const frames: HTMLElement[] = [];
  /** Which picture has been made big; -1 for none. */
  let bigPicture = -1;
  let tags: { id: string; name: string; above: boolean; tag: HTMLElement; pill: HTMLElement }[] =
    [];
  return {
    frame(looks) {
      for (const frame of frames.splice(0)) frame.remove();
      for (const { tag } of tags) tag.hidden = looks === null;
      for (const { box, label, pictures } of looks ?? []) {
        const frame = create('div', 'pane');
        frame.style.left = `${String(box.x)}px`;
        frame.style.top = `${String(box.y)}px`;
        frame.style.width = `${String(box.width)}px`;
        frame.style.height = `${String(box.height)}px`;
        frame.append(create('span', 'pane-label', label));
        if (pictures && pictures.length > 0) {
          const row = create('div', 'pane-insets');
          const insets = pictures.map((picture, index) => {
            const inset = create('button', 'pane-inset');
            inset.type = 'button';
            const image = create('img', 'pane-photo');
            image.src = picture.src;
            image.alt = picture.alt;
            inset.append(image, create('span', 'pane-caption', picture.caption));
            inset.addEventListener('click', () => {
              show(bigPicture === index ? -1 : index);
            });
            row.append(inset);
            return { inset, picture };
          });
          // One picture at a time is big; the one made big stays big when the frames are
          // laid out again.
          const show = (big: number): void => {
            bigPicture = big;
            for (const [index, { inset, picture }] of insets.entries()) {
              const on = index === big;
              inset.classList.toggle('big', on);
              inset.setAttribute('aria-label', on ? picture.smaller : picture.bigger);
              inset.setAttribute('aria-pressed', String(on));
            }
          };
          show(bigPicture < insets.length ? bigPicture : -1);
          frame.append(row);
        }
        frames.push(frame);
      }
      // Under the names, in the order the looks are told in.
      layer.prepend(...frames);
    },
    name(things) {
      for (const { tag } of tags) tag.remove();
      tags = things.map(({ id, name, above = false, numbered = false }) => {
        // A name above its spot is the viewer's: it is told apart from the bodies' names. A
        // numbered moment is a small disc with its number.
        const tag = create(
          'div',
          numbered ? 'side-tag side-mark' : above ? 'side-tag side-you' : 'side-tag',
        );
        const pill = create('span', 'marker-name', name);
        tag.hidden = true;
        tag.append(pill);
        layer.append(tag);
        return { id, name, above: above || numbered, tag, pill };
      });
    },
    dip() {
      const first = frames[0];
      if (!first) return;
      first.classList.remove('dipped');
      // Read back, so that a dip asked for during another starts again from the top.
      first.getBoundingClientRect();
      first.classList.add('dipped');
    },
    update(place) {
      // A name that would cover one already placed is left out, as in the first look.
      const placed: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const { id, name, above, tag, pill } of tags) {
        const { point, radiusPixels } = place(id);
        tag.hidden = !point.visible;
        if (!point.visible) continue;
        tag.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
        if (above) continue;
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
