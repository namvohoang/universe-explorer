import type { CelestialObject } from '../data/types';
import { en } from './strings/en';

const STRINGS: Readonly<Record<string, string>> = en;

/**
 * The name a kid reads: "The Sun", "Halley's Comet", "The Orion Nebula". An object with an
 * everyday name has it in the strings under `name` + its id in CamelCase; otherwise its own
 * name is used.
 */
export function displayName(object: CelestialObject): string {
  const key = `name${object.id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}`;
  return STRINGS[key] ?? object.name;
}
