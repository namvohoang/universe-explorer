/**
 * The pictures the very first view draws, which the service worker stores on the first visit:
 * the maps and models of the Sun and the planets, and the reading of the card the app opens on.
 * Paths are from the site root. Kept as a plain list so the build can read it without loading
 * the catalogue; `firstView.test.ts` fails if it no longer matches the catalogue.
 */
export const FIRST_VIEW: readonly string[] = [
  'media/maps/earth.webp',
  'media/maps/jupiter.webp',
  'media/maps/mars.webp',
  'media/maps/mercury.webp',
  'media/maps/neptune.webp',
  'media/maps/saturn.webp',
  'media/maps/uranus.webp',
  'media/maps/venus.webp',
  'media/models/sun.glb',
  'voice/solar-system.mp3',
];
