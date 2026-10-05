import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { FIRST_VIEW } from './tools/firstView.ts';

const PUBLIC_DIR = join(import.meta.dirname, 'public');

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const FIRST = new Set(FIRST_VIEW);

/**
 * Writes `sw.js`, the service worker that lets the app work with no network (PLAN.md tasks 5.6
 * and 8.12). On the first visit it stores only what the first view needs: the page, its code,
 * fonts and icons, and the pictures of the Sun and the planets. Everything else is stored when
 * it is first used, and the page asks for the rest to be fetched quietly once it has settled.
 * The cache is named after the files' contents, so a new build replaces the old one.
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
      const isMedia = (file: string): boolean => /^(media|voice)\//.test(file);
      const address = (file: string): string => (file === './' ? file : `./${file}`);
      const shell = [
        './',
        ...built,
        ...publicFiles.filter((file) => !isMedia(file) || FIRST.has(file)),
      ].map(address);
      const rest = publicFiles.filter((file) => isMedia(file) && !FIRST.has(file)).map(address);
      const cache = `universe-explorer-${hash.digest('hex').slice(0, 16)}`;
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE = ${JSON.stringify(cache)};
const SHELL = ${JSON.stringify(shell)};
const REST = ${JSON.stringify(rest)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
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

// Search strings (?scale=easy) and Vary headers are ignored: one stored copy answers every form of the request.
const stored = (request) => caches.match(request, { ignoreSearch: true, ignoreVary: true });

// Answer from the cache. What is not there yet comes from the network and is kept for next time.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    stored(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((response) => {
        // Only a whole file is worth keeping: a player may ask for just a part of a recording.
        if (response.status === 200 && !event.request.headers.has('range')) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(url.pathname, copy)));
        }
        return response;
      });
    }),
  );
});

// The page says "fill" once it has settled: fetch what is still missing, one file at a time,
// then tell every open page that the app now works with no network.
self.addEventListener('message', (event) => {
  if (event.data !== 'fill') return;
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const file of REST) {
        if (await cache.match(file)) continue;
        const response = await fetch(file);
        if (response.status === 200) await cache.put(file, response);
      }
      for (const client of await self.clients.matchAll()) client.postMessage('filled');
    }),
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
  build: {
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // The 3D library and the catalogue change far less often than the app's own code, so
        // each gets a file of its own that a returning visitor already has.
        codeSplitting: {
          groups: [
            { name: 'three-core', test: /node_modules[\\/]three[\\/]build[\\/]three\.core/ },
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'catalogue', test: /src[\\/]data[\\/]/ },
            { name: 'words', test: /src[\\/]ui[\\/]strings[\\/]/ },
          ],
        },
      },
    },
  },
  plugins: [offline()],
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts', 'tools/**/*.test.ts'],
  },
});
