import type { CelestialObject } from '../data/types';
import { distanceLine, sizeLineup } from '../sim/compare';
import { bodyRadiusKm } from '../sim/layout';
import { create } from './dom';
import { fill } from './format';
import { displayName } from './names';
import { createSegmented } from './segmented';
import { en } from './strings/en';

/** Drawn width of the largest body in the size line-up, and length of the distance line. */
const LARGEST_PIXELS = 180;
const LINE_PIXELS = 3000;
const NUMBER = new Intl.NumberFormat('en-GB', { maximumSignificantDigits: 2 });

export interface Compare {
  readonly element: HTMLElement;
  open(): void;
  close(): void;
}

/**
 * Two flat pictures that show the real ratios the 3D view cannot: the planets side by side at
 * their true sizes, and along a line at their true distances from the Sun.
 */
export function createCompare(catalogue: readonly CelestialObject[]): Compare {
  const planets = catalogue.filter((object) => object.kind === 'planet');
  const names = new Map(catalogue.map((object) => [object.id, displayName(object)]));
  const nameOf = (id: string): string => names.get(id) ?? id;

  const element = create('section', 'compare');
  element.setAttribute('aria-label', en.compare);
  element.hidden = true;

  const sizes = create('div', 'compare-sizes');
  const row = create('div', 'lineup');
  for (const item of sizeLineup(planets)) {
    const figure = create('figure', '');
    const disc = create('div', 'disc');
    const width = Math.max(1, item.share * LARGEST_PIXELS);
    disc.style.width = `${width.toFixed(1)}px`;
    disc.style.height = `${width.toFixed(1)}px`;
    figure.append(disc, create('figcaption', '', nameOf(item.id)));
    row.append(figure);
  }
  const sun = catalogue.find((object) => object.kind === 'star');
  const largest = planets.reduce<CelestialObject | null>(
    (best, p) => ((bodyRadiusKm(p) ?? 0) > ((best && bodyRadiusKm(best)) ?? 0) ? p : best),
    null,
  );
  const sunNote = create('p', 'compare-note');
  if (sun && largest) {
    const times = (bodyRadiusKm(sun) ?? 0) / (bodyRadiusKm(largest) ?? 1);
    sunNote.textContent = fill(en.compareSunNote, {
      times: NUMBER.format(times),
      planet: nameOf(largest.id),
    });
  }
  sizes.append(create('p', 'compare-lead', en.compareSizesLead), row, sunNote);

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
  scroller.setAttribute('aria-label', en.compareDistancesLead);
  distances.append(
    create('p', 'compare-lead', en.compareDistancesLead),
    scroller,
    create('p', 'compare-note', en.compareDistancesNote),
  );
  distances.hidden = true;

  const tabs = createSegmented(
    en.compare,
    [
      { value: 'sizes', label: en.compareSizes },
      { value: 'distances', label: en.compareDistances },
    ],
    'sizes',
    (which) => {
      sizes.hidden = which !== 'sizes';
      distances.hidden = which !== 'distances';
    },
  );
  const close = create('button', 'x', '×');
  close.type = 'button';
  close.setAttribute('aria-label', en.compareClose);
  const head = create('div', 'compare-head');
  head.append(tabs.element, close);
  element.append(head, sizes, distances);

  const api: Compare = {
    element,
    open() {
      element.hidden = false;
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
