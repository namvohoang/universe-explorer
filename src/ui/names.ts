import type { CelestialObject } from '../data/types';
import { en } from './strings/en';

/** The name a kid reads: "The Sun" and "The Moon", otherwise the object's own name. */
export function displayName(object: CelestialObject): string {
  if (object.id === 'sun') return en.nameSun;
  if (object.id === 'moon') return en.nameMoon;
  return object.name;
}
