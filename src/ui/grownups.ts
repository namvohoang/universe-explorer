import { cards } from '../data/content/cards';
import { concepts } from '../data/content/concepts';
import type { CelestialObject, Source } from '../data/types';
import type { DateLimits } from '../sim/time';
import { create } from './dom';
import { fill, yearOf } from './format';
import { displayName } from './names';
import { words } from './strings';
import { mediaKindLabel } from './strings/media';

export interface GrownUps {
  readonly element: HTMLElement;
  open(): void;
  close(): void;
}

/** Every page anything in the app was read from, once each, in a stable order. */
export function allSources(catalogue: readonly CelestialObject[]): Source[] {
  const byId = new Map<string, Source>();
  const add = (source: Source): void => {
    if (!byId.has(source.id)) byId.set(source.id, source);
  };
  for (const object of catalogue) object.sources.forEach(add);
  for (const card of cards) card.sources.forEach(add);
  for (const concept of concepts) add(concept.source);
  return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** Every picture and map in the app with who made it and what kind of picture it is. */
export function allPictureCredits(
  catalogue: readonly CelestialObject[],
): { name: string; credit: string; kind: string | null }[] {
  return catalogue.flatMap((object) =>
    object.media.map((media) => ({
      name: displayName(object),
      credit: media.credit ?? '',
      kind: mediaKindLabel(media.kind),
    })),
  );
}

function section(title: string, ...children: HTMLElement[]): HTMLElement {
  const element = create('section', '');
  element.append(create('h3', '', title), ...children);
  return element;
}

/**
 * The page for parents and teachers: what the app does with data (nothing), how far to trust
 * it, and where every picture and number comes from. Links off the site live only here.
 */
export function createGrownUps(
  catalogue: readonly CelestialObject[],
  limits: DateLimits | null,
  onClearProgress: () => void = () => undefined,
): GrownUps {
  const element = create('section', 'grownups');
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', words.grownUps);
  element.hidden = true;

  const close = create('button', '', words.grownUpsClose);
  close.type = 'button';
  const head = create('div', 'grownups-head');
  head.append(create('h2', '', words.grownUps), close);

  const accuracy2 = limits
    ? fill(words.grownUpsAccuracy2, { from: yearOf(limits.minJd), to: yearOf(limits.maxJd) })
    : words.grownUpsAccuracy2;

  const pictures = create('ul', '');
  for (const picture of allPictureCredits(catalogue)) {
    const line = [picture.credit, picture.kind].filter(Boolean).join(' — ');
    pictures.append(create('li', '', `${picture.name}: ${line}`));
  }

  const sources = create('ul', '');
  for (const source of allSources(catalogue)) {
    const item = create('li', '');
    const link = create('a', '', source.title);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    item.append(link);
    sources.append(item);
  }

  const clear = create('button', '', words.grownUpsClear);
  clear.type = 'button';
  const cleared = create('p', 'notice');
  cleared.setAttribute('role', 'status');
  clear.addEventListener('click', () => {
    onClearProgress();
    cleared.textContent = words.grownUpsCleared;
  });

  element.append(
    head,
    section(
      words.grownUpsPrivacyTitle,
      create('p', '', words.grownUpsPrivacy1),
      create('p', '', words.grownUpsPrivacy2),
      create('p', '', words.grownUpsPrivacy3),
    ),
    section(words.grownUpsKeptTitle, create('p', '', words.grownUpsKept), clear, cleared),
    section(
      words.grownUpsAccuracyTitle,
      create('p', '', words.grownUpsAccuracy1),
      create('p', '', accuracy2),
      create('p', '', words.grownUpsAccuracy3),
    ),
    section(words.grownUpsPicturesTitle, pictures),
    section(words.grownUpsSourcesTitle, create('p', 'notice', words.grownUpsLinksNotice), sources),
  );

  const api: GrownUps = {
    element,
    open() {
      cleared.textContent = '';
      element.hidden = false;
      close.focus();
    },
    close() {
      element.hidden = true;
    },
  };
  close.addEventListener('click', () => {
    api.close();
  });
  return api;
}
