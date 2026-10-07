import type { CelestialObject, RingSystem } from '../data/types';
import { drawPortraits, type Sitter } from '../scene/portrait';
import { distanceLine, sizeLineup } from '../sim/compare';
import { bodyRadiusKm } from '../sim/layout';
import { create } from './dom';
import { icon } from './icons';
import { fill } from './format';
import { displayName } from './names';
import { createSegmented } from './segmented';
import { locale, words } from './strings';

/** Drawn width of the largest body in the size line-up, and length of the distance line. */
const LARGEST_PIXELS = 180;
const LINE_PIXELS = 3000;
const NUMBER = new Intl.NumberFormat(locale, { maximumSignificantDigits: 2 });

export interface Compare {
  readonly element: HTMLElement;
  open(): void;
  close(): void;
}

/** A plain shaded disc: what a body is shown as where the browser cannot draw in 3D. */
function createDisc(widthPixels: number): HTMLElement {
  const disc = create('div', 'disc');
  disc.style.width = `${widthPixels.toFixed(1)}px`;
  disc.style.height = `${widthPixels.toFixed(1)}px`;
  return disc;
}

/**
 * Two pictures that show the real ratios the 3D view cannot: the planets side by side at
 * their true sizes, and along a line at their true distances from the Sun.
 */
export function createCompare(
  catalogue: readonly CelestialObject[],
  onClose: () => void = () => undefined,
): Compare {
  const planets = catalogue.filter((object) => object.kind === 'planet');
  const names = new Map(catalogue.map((object) => [object.id, displayName(object)]));
  const nameOf = (id: string): string => names.get(id) ?? id;

  const element = create('section', 'compare');
  element.setAttribute('aria-label', words.compare);
  element.hidden = true;

  const sizes = create('div', 'compare-sizes');
  const row = create('div', 'lineup');
  const ringsOf = new Map<string, RingSystem>();
  for (const object of catalogue) {
    if (object.kind === 'ring-system') ringsOf.set(object.parentId, object);
  }
  const sitters: Sitter[] = [];
  for (const item of sizeLineup(planets)) {
    const figure = create('figure', '');
    const widthPixels = Math.max(1, item.share * LARGEST_PIXELS);
    const object = planets.find((planet) => planet.id === item.id);
    const shape = object?.shape;
    if (object && shape?.type === 'spheroid') {
      // The caption beside it names the planet, so the picture itself stays out of the reading.
      const canvas = create('canvas', 'portrait');
      canvas.setAttribute('aria-hidden', 'true');
      sitters.push({ object, shape, rings: ringsOf.get(object.id) ?? null, canvas, widthPixels });
      figure.append(canvas);
    } else {
      figure.append(createDisc(widthPixels));
    }
    figure.append(create('figcaption', '', nameOf(item.id)));
    row.append(figure);
  }
  if (!drawPortraits(sitters)) {
    for (const sitter of sitters) sitter.canvas.replaceWith(createDisc(sitter.widthPixels));
  }
  const sun = catalogue.find((object) => object.kind === 'star');
  const largest = planets.reduce<CelestialObject | null>(
    (best, p) => ((bodyRadiusKm(p) ?? 0) > ((best && bodyRadiusKm(best)) ?? 0) ? p : best),
    null,
  );
  const sunNote = create('p', 'compare-note');
  if (sun && largest) {
    const times = (bodyRadiusKm(sun) ?? 0) / (bodyRadiusKm(largest) ?? 1);
    sunNote.textContent = fill(words.compareSunNote, {
      times: NUMBER.format(times),
      planet: nameOf(largest.id),
    });
  }
  sizes.append(create('p', 'compare-lead', words.compareSizesLead), row, sunNote);

  const distances = create('div', 'compare-distances');
  const scroller = create('div', 'line-scroller');
  const line = create('div', 'line');
  line.style.width = `${String(LINE_PIXELS)}px`;
  const sunMark = create('span', 'line-mark sun');
  sunMark.style.left = '0px';
  sunMark.append(create('span', 'line-name', sun ? nameOf(sun.id) : ''));
  line.append(sunMark);
  distanceLine(planets).forEach((item, index) => {
    const mark = create('span', 'line-mark');
    mark.style.left = `${(item.share * LINE_PIXELS).toFixed(1)}px`;
    // Alternate names above and below, so close neighbours near the Sun do not collide.
    mark.append(create('span', index % 2 === 0 ? 'line-name' : 'line-name above', nameOf(item.id)));
    line.append(mark);
  });
  scroller.append(line);
  scroller.tabIndex = 0;
  scroller.setAttribute('aria-label', words.compareDistancesLead);
  distances.append(
    create('p', 'compare-lead', words.compareDistancesLead),
    scroller,
    create('p', 'compare-note', words.compareDistancesNote),
  );
  distances.hidden = true;

  const tabs = createSegmented(
    words.compare,
    [
      { value: 'sizes', label: words.compareSizes },
      { value: 'distances', label: words.compareDistances },
    ],
    'sizes',
    (which) => {
      sizes.hidden = which !== 'sizes';
      distances.hidden = which !== 'distances';
    },
  );
  const close = create('button', 'x');
  close.append(icon('close'));
  close.type = 'button';
  close.setAttribute('aria-label', words.compareClose);
  const head = create('div', 'compare-head');
  head.append(tabs.element, close);
  element.append(head, sizes, distances);

  const api: Compare = {
    element,
    open() {
      element.hidden = false;
    },
    close() {
      if (element.hidden) return;
      element.hidden = true;
      onClose();
    },
  };
  close.addEventListener('click', () => {
    api.close();
  });
  return api;
}
