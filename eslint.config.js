import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Layering (PLAN.md §4): ui → scene → sim → data. A layer never imports from one above it.
const layer = (name) => ({
  group: [`**/${name}`, `**/${name}/**`],
  message: `Layering: this folder must not import from ${name}/ (PLAN.md §4).`,
});
const three = {
  group: ['three', 'three/**'],
  message: 'No rendering library outside src/scene and src/ui.',
};

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'docs/prototype/'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    files: ['src/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [three, layer('sim'), layer('scene'), layer('ui')] },
      ],
    },
  },
  {
    // src/sim is pure: no rendering, no DOM, and time is always an argument.
    files: ['src/sim/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [three, layer('scene'), layer('ui')] }],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'performance',
        'localStorage',
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Date',
          property: 'now',
          message: 'Time is an argument in src/sim, never read from the clock.',
        },
        { object: 'Math', property: 'random', message: 'src/sim is deterministic.' },
      ],
    },
  },
  {
    files: ['src/scene/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [layer('ui')] }] },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
);
