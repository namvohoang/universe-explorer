/** Every user-facing string lives here, never inline in components. */
export const en = {
  appTitle: 'Universe Explorer',
} as const;

export type StringKey = keyof typeof en;
