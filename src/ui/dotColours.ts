import type { CelestialObject } from '../data/types';
import { groupOf, starShelfOf, type Group, type StarShelf } from './places';

/**
 * The colour of the dot beside a place's name. These are drawing choices to help tell the
 * chips apart, not measurements, and the name is always there too.
 */
const BODY_DOTS: Readonly<Record<string, string>> = {
  sun: '#ffc53d',
  mercury: '#b9b2a8',
  venus: '#e8c58a',
  earth: '#5fa8ff',
  mars: '#e0704a',
  jupiter: '#d9a777',
  saturn: '#e8d19a',
  uranus: '#9fe3ea',
  neptune: '#6b86ff',
};

const GROUP_DOTS: Readonly<Record<Group, string>> = {
  planets: '#cfd3dc',
  'dwarf-planets': '#d6c1ad',
  'space-rocks': '#a59d92',
  stars: '#ffd9a0',
  'star-pictures': '#bcd0ff',
  galaxies: '#c9a8ff',
  'space-wonders': '#ff9bd0',
  spaceships: '#6fd3ff',
};

/** A star's dot is the colour it is sorted under. */
const SHELF_DOTS: Readonly<Record<StarShelf, string>> = {
  red: '#ff8266',
  orange: '#ffb066',
  yellow: '#ffe08a',
  white: '#ffffff',
  'blue-white': '#a9c8ff',
  leftover: '#cfd3dc',
};

const MOON_DOT = '#cfd3dc';
const SPACECRAFT_DOT = '#6fd3ff';

export function dotColour(object: CelestialObject): string {
  const own = BODY_DOTS[object.id];
  if (own !== undefined) return own;
  const shelf = starShelfOf(object);
  if (shelf !== null) return SHELF_DOTS[shelf];
  const group = groupOf(object);
  if (group !== null) return GROUP_DOTS[group];
  return object.kind === 'spacecraft' ? SPACECRAFT_DOT : MOON_DOT;
}
