/** Finds an element the page is known to contain, or fails loudly. */
export function mustFind(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Page is missing ${selector}`);
  return element;
}

/** Creates an element with a class and optional text. */
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
