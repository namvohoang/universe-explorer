import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the static build works from any path (e.g. a Hugging Face Space).
  base: './',
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
