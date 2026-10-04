import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const PUBLIC_DIR = join(import.meta.dirname, 'public');

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

/**
 * Writes `sw.js`, a service worker that stores every file of the built app the first time it
 * is opened, so the app keeps working with no network (PLAN.md task 5.6). The cache is named
 * after the files' contents, so a new build replaces the old one.
 */
function offline(): Plugin {
  return {
    name: 'universe-explorer-offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const hash = createHash('sha256');
      const publicFiles = filesUnder(PUBLIC_DIR).map((path) => {
        hash.update(readFileSync(path));
        return relative(PUBLIC_DIR, path).split(sep).join('/');
      });
      const built = Object.keys(bundle);
      for (const name of built) hash.update(name);
      const files = ['./', ...built, ...publicFiles].map((file) =>
        file === './' ? file : `./${file}`,
      );
      const cache = `universe-explorer-${hash.digest('hex').slice(0, 16)}`;
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE = ${JSON.stringify(cache)};
const FILES = ${JSON.stringify(files)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// Everything the app needs is in the cache, so answer from it and only fall back to the network.
// Search strings (?go=saturn) and Vary headers are ignored: one stored copy answers every form of the request.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true, ignoreVary: true })
      .then((hit) => hit ?? fetch(event.request)),
  );
});
`,
      });
    },
  };
}

export default defineConfig({
  // Relative base so the static build works from any path (e.g. a Hugging Face Space).
  base: './',
  // Never inline assets as data: URIs; the page's CSP only allows fonts from its own origin.
  build: { assetsInlineLimit: 0 },
  plugins: [offline()],
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts', 'tools/**/*.test.ts'],
  },
});
