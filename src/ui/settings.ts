import { create } from './dom';
import { icon } from './icons';

export interface Settings {
  /** The panel itself: a small menu on a wide screen, a sheet on a phone. */
  readonly element: HTMLElement;
  /** Adds a titled group of controls. Returns it, so it can be shown only where it applies. */
  addSection(title: string | null, ...controls: HTMLElement[]): HTMLElement;
  /** Makes a button open and close the panel. */
  openWith(button: HTMLButtonElement): void;
  close(): void;
  isOpen(): boolean;
}

/**
 * The settings panel. While open it keeps the Tab key inside itself, and it closes with its
 * close button, the Escape key (see main.ts) or a tap outside it.
 */
export function createSettings(title: string, closeLabel: string): Settings {
  const element = create('section', 'settings');
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', title);
  element.hidden = true;
  const close = create('button', 'x');
  close.type = 'button';
  close.setAttribute('aria-label', closeLabel);
  close.title = closeLabel;
  close.append(icon('close'));
  const head = create('div', 'settings-head');
  head.append(create('h2', '', title), close);
  element.append(head);

  const openers: HTMLButtonElement[] = [];
  let openedBy: HTMLButtonElement | null = null;
  const setOpen = (open: boolean, by: HTMLButtonElement | null): void => {
    element.hidden = !open;
    for (const button of openers) button.setAttribute('aria-expanded', String(open));
    if (open) {
      openedBy = by;
      close.focus();
    } else {
      openedBy?.focus();
      openedBy = null;
    }
  };
  close.addEventListener('click', () => {
    setOpen(false, null);
  });
  document.addEventListener('pointerdown', (event) => {
    if (element.hidden || !(event.target instanceof Node)) return;
    if (element.contains(event.target) || openers.some((b) => b.contains(event.target as Node))) {
      return;
    }
    element.hidden = true;
    for (const button of openers) button.setAttribute('aria-expanded', 'false');
    openedBy = null;
  });
  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const stops = [...element.querySelectorAll<HTMLElement>('button, a[href], select')].filter(
      (stop) => stop.offsetParent !== null && stop.tabIndex >= 0,
    );
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return {
    element,
    addSection(sectionTitle, ...controls) {
      const section = create('div', 'settings-section');
      if (sectionTitle !== null) section.append(create('h3', '', sectionTitle));
      section.append(...controls);
      element.append(section);
      return section;
    },
    openWith(button) {
      openers.push(button);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        setOpen(element.hasAttribute('hidden'), button);
      });
    },
    close() {
      if (!element.hidden) setOpen(false, null);
    },
    isOpen: () => !element.hidden,
  };
}

export interface ChoiceOption<T extends string> {
  readonly value: T;
  readonly title: string;
  /** One line saying what the choice does. */
  readonly text: string;
  readonly picture: SVGSVGElement;
}

export interface Choice<T extends string> {
  readonly element: HTMLElement;
  show(value: T): void;
}

/** A few big option cards of which exactly one is chosen. */
export function createChoice<T extends string>(
  groupLabel: string,
  options: readonly ChoiceOption<T>[],
  initial: T,
  onChange: (value: T) => void,
): Choice<T> {
  const element = create('div', 'choice');
  element.setAttribute('role', 'radiogroup');
  element.setAttribute('aria-label', groupLabel);
  const cards = options.map((option) => {
    const button = create('button', '');
    button.type = 'button';
    button.setAttribute('role', 'radio');
    const words = create('span', 'choice-words');
    words.append(create('strong', '', option.title), create('span', '', option.text));
    button.append(option.picture, words);
    button.addEventListener('click', () => {
      show(option.value);
      onChange(option.value);
    });
    element.append(button);
    return { value: option.value, button };
  });
  function show(value: T): void {
    for (const { value: own, button } of cards) {
      button.setAttribute('aria-checked', String(own === value));
    }
  }
  show(initial);
  return { element, show };
}

/** An on/off switch with its label beside it. */
export function createSwitch(
  label: string,
  initial: boolean,
  onChange: (on: boolean) => void,
): HTMLButtonElement {
  const button = create('button', 'switch');
  button.type = 'button';
  button.setAttribute('role', 'switch');
  button.setAttribute('aria-checked', String(initial));
  button.append(create('span', '', label), create('span', 'switch-track'));
  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-checked') !== 'true';
    button.setAttribute('aria-checked', String(on));
    onChange(on);
  });
  return button;
}
