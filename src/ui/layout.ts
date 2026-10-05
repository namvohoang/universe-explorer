/** How much of the screen the top bar and the bottom tray take, in CSS pixels from each edge. */
export interface Insets {
  readonly top: number;
  readonly bottom: number;
}

/** The space taken at the top and the bottom, given where the bar ends and the tray begins. */
export function insetsFor(topBarBottom: number, trayTop: number, viewportHeight: number): Insets {
  return {
    top: Math.max(0, Math.round(topBarBottom)),
    bottom: Math.max(0, Math.round(viewportHeight - trayTop)),
  };
}

/**
 * Keeps `--top-h` and `--bottom-h` on the page equal to the room the top bar and the tray take,
 * so the card and the controls are placed between them whatever size the bars turn out to be.
 */
export function watchLayout(topBar: HTMLElement, tray: HTMLElement): void {
  const root = document.documentElement;
  const measure = (): void => {
    const insets = insetsFor(
      topBar.getBoundingClientRect().bottom,
      tray.getBoundingClientRect().top,
      window.innerHeight,
    );
    root.style.setProperty('--top-h', `${String(insets.top)}px`);
    root.style.setProperty('--bottom-h', `${String(insets.bottom)}px`);
  };
  const observer = new ResizeObserver(measure);
  observer.observe(topBar);
  observer.observe(tray);
  window.addEventListener('resize', measure);
  measure();
}
