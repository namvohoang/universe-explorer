import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the static build works from any path (e.g. a Hugging Face Space).
  base: './',
  // Never inline assets as data: URIs; the page's CSP only allows fonts from its own origin.
  build: { assetsInlineLimit: 0 },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
