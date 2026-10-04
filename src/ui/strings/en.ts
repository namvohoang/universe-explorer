/** Every user-facing string lives here, never inline in components. */
export const en = {
  appTitle: 'Universe Explorer',
  scaleLabelTrue: 'Real sizes and real distances.',
  scaleLabelTrueSizes:
    'Planets are the right size next to each other. They are really much farther apart.',
  scaleLabelEasy: 'Drawn bigger and closer so you can see everything.',
} as const;

export type StringKey = keyof typeof en;
