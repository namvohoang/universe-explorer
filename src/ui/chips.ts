import { create } from './dom';

export interface Chip {
  /** A body id, or `null` for the whole view. */
  readonly id: string | null;
  readonly label: string;
}

export interface Chips {
  readonly element: HTMLElement;
  /** Replaces the chips on offer and marks the one for where the camera is now. */
  show(chips: readonly Chip[], current: string | null): void;
}

/** A row of buttons, one per place to go, as in the prototype's tray. */
export function createChips(groupLabel: string, onPick: (id: string | null) => void): Chips {
  const element = create('div', 'chips');
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', groupLabel);
  let shown = '';
  return {
    element,
    show(chips, current) {
      // Rebuild only when the set of places changes, so focus is not lost on every pick.
      const signature = chips.map((chip) => chip.id ?? '').join('|');
      if (signature !== shown) {
        element.replaceChildren(
          ...chips.map((chip) => {
            const button = create('button', '', chip.label);
            button.type = 'button';
            button.dataset.id = chip.id ?? '';
            button.addEventListener('click', () => {
              onPick(chip.id);
            });
            return button;
          }),
        );
        shown = signature;
      }
      for (const button of element.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.id === (current ?? '')));
      }
    },
  };
}
