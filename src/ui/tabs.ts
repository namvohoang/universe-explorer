import { create } from './dom';
import { icon, type IconName } from './icons';

export interface TabOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon: IconName;
}

export interface Tabs<T extends string> {
  readonly element: HTMLElement;
  /** Shows a tab as chosen without calling `onChange`. */
  show(value: T): void;
  /** Puts a short note after a tab's label, such as how many of its places were seen. */
  setNote(value: T, note: string): void;
}

/** A row of tabs, each an icon and a label. Arrow keys move along the row. */
export function createTabs<T extends string>(
  groupLabel: string,
  options: readonly TabOption<T>[],
  initial: T,
  onChange: (value: T) => void,
): Tabs<T> {
  const element = create('div', 'tabs');
  element.setAttribute('role', 'tablist');
  element.setAttribute('aria-label', groupLabel);

  const tabs = options.map((option) => {
    const button = create('button', '');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.dataset.value = option.value;
    button.title = option.label;
    const note = create('span', 'tab-note');
    const label = create('span', 'tab-label', option.label);
    button.append(icon(option.icon), label, note);
    button.addEventListener('click', () => {
      show(option.value);
      onChange(option.value);
    });
    element.append(button);
    return { value: option.value, button, note };
  });

  function show(value: T): void {
    for (const { value: own, button } of tabs) {
      const chosen = own === value;
      button.setAttribute('aria-selected', String(chosen));
      // One stop for the Tab key; the arrows move between the tabs.
      button.tabIndex = chosen ? 0 : -1;
    }
  }
  show(initial);

  element.addEventListener('keydown', (event) => {
    // Down and up as well: on a phone on its side the main tabs are a rail, one over the other.
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    const at = tabs.findIndex(({ button }) => button === document.activeElement);
    const next = tabs[(at + step + tabs.length) % tabs.length];
    if (at < 0 || !next) return;
    event.preventDefault();
    next.button.focus();
    next.button.click();
  });

  return {
    element,
    show,
    setNote(value, note) {
      const tab = tabs.find((candidate) => candidate.value === value);
      if (tab) tab.note.textContent = note;
    },
  };
}
