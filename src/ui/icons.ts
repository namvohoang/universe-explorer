const SVG = 'http://www.w3.org/2000/svg';

/** A circle written as a path, so every icon is made of paths alone. */
const circle = (cx: number, cy: number, r: number): string =>
  `M${String(cx - r)} ${String(cy)}a${String(r)} ${String(r)} 0 1 0 ${String(2 * r)} 0a${String(r)} ${String(r)} 0 1 0 ${String(-2 * r)} 0`;

/** Line drawings on a 24 by 24 grid, in the colour of the text around them. */
const ICONS = {
  sun: [
    circle(12, 12, 4),
    'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  ],
  sparkle: ['M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z'],
  rocket: [
    'M12 2c3 2.5 4.5 6 4.5 10v5h-9v-5C7.5 8 9 4.5 12 2z',
    'M7.5 13l-3 3v3l3-2M16.5 13l3 3v3l-3-2M10 20v2M14 20v2',
    circle(12, 9, 1.5),
  ],
  compare: [circle(6.5, 15.5, 3), circle(15.5, 10, 6)],
  info: [circle(12, 12, 9), 'M12 11v6M12 7.5v.5'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-right': ['M9 6l6 6-6 6'],
  play: ['M8 5l11 7-11 7z'],
  watch: [circle(12, 12, 9), 'M10 8.5l5.5 3.5-5.5 3.5z'],
  moon: ['M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z'],
  eye: ['M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z', circle(12, 12, 2.5)],
  again: ['M4 12a8 8 0 102.6-5.9', 'M4 4v4.5h4.5'],
  pause: ['M8 5v14M16 5v14'],
  snow: ['M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7', 'M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5'],
  fit: [circle(12, 12, 3), 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'],
  ruler: ['M3 17L17 3l4 4L7 21z', 'M7 13l2 2M10 10l2 2M13 7l2 2'],
  turn: ['M20 12a8 8 0 11-2.6-5.9', 'M20 4v4.5h-4.5'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  back: ['M19 12H5M11 6l-6 6 6 6'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  close: ['M6 6l12 12M18 6L6 18'],
  speaker: ['M4 10v4h3l5 4V6l-5 4z', 'M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11'],
  stop: ['M7 7h10v10H7z'],
  hand: [
    'M9 12V5.5a1.5 1.5 0 013 0V11M12 10.5V9a1.5 1.5 0 013 0v2M15 11.5v-1a1.5 1.5 0 013 0V15c0 3.5-2.5 6-6 6h-.5c-2 0-3.5-1-4.5-2.5L4.5 15c-.7-1.2.8-2.5 1.9-1.6L9 15.5',
  ],
  planet: [
    circle(12, 12, 5),
    'M6.5 14.5C3.5 16.5 2.5 18 3.5 19c1.5 1.5 7-1 12-5.5s6-8 4.5-9.5c-.8-.8-2.3-.4-4.5 1',
  ],
  dwarf: [circle(12, 12, 3), circle(12, 12, 9)],
  rock: ['M5 13l3-7 7-2 4 6-2 8-8 1z', 'M10 10v.5M14 14v.5'],
  pattern: [
    'M5 17l5-8 5 4 4-8',
    circle(5, 17, 1),
    circle(10, 9, 1),
    circle(15, 13, 1),
    circle(19, 5, 1),
  ],
  galaxy: [
    circle(12, 12, 2),
    'M12 5c5 0 8 4 7 8M12 19c-5 0-8-4-7-8M5 9c1-4 6-6 9-4M19 15c-1 4-6 6-9 4',
  ],
  wonder: [
    circle(12, 12, 3.5),
    'M2.5 12c0-2.5 4.3-4.5 9.5-4.5s9.5 2 9.5 4.5-4.3 4.5-9.5 4.5S2.5 14.5 2.5 12z',
  ],
} as const;

export type IconName = keyof typeof ICONS;

/** An icon to sit beside (never instead of) a label; it is hidden from screen readers. */
export function icon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of ICONS[name]) {
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

/** A tiny picture of filled discs (x, y, radius) on a 56 by 24 strip. */
export function discs(spots: readonly (readonly [number, number, number])[]): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 56 24');
  svg.setAttribute('class', 'discs');
  svg.setAttribute('aria-hidden', 'true');
  for (const [cx, cy, r] of spots) {
    const disc = document.createElementNS(SVG, 'circle');
    disc.setAttribute('cx', String(cx));
    disc.setAttribute('cy', String(cy));
    disc.setAttribute('r', String(r));
    svg.append(disc);
  }
  return svg;
}
