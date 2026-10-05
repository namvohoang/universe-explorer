import { defineConfig } from '@playwright/test';

const PORT = 4183;

/** Layout checks in a real browser, against the built app (`npm run build` first). */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    // A fresh build must be what is tested, not a copy an earlier service worker kept.
    serviceWorkers: 'block',
    // Nothing slides or swoops, so a measurement is never taken halfway through a move.
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: {
      // Draw 3D in software, so the checks run on a machine with no graphics card.
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    },
  },
  webServer: {
    command: `npx vite preview --port ${String(PORT)} --strictPort`,
    port: PORT,
    reuseExistingServer: false,
  },
});
