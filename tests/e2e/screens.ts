/** The screens the layout is checked on (PLAN.md Phase 8). */
export const SCREENS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet landscape', width: 1024, height: 768 },
  { name: 'tablet portrait', width: 820, height: 1180 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'phone landscape', width: 844, height: 390 },
] as const;

/** Places that stress the layout: a short card, a long one, and one in each other scene. */
export const PLACES = ['', 'saturn', 'earth', 'andromeda', 'space-shuttle'] as const;
