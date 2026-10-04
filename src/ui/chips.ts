import { create } from './dom';

export interface Chip {
  /** A body id, or `null` for the whole view. */
  readonly id: string | null;
  readonly label: string;
}

export interface Chips {
  readonly element: HTMLElement;
  /** Marks the chip for where the camera is now. */
  show(id: string | null): void;
}

/** A row of buttons, one per place to go, as in the prototype's tray. */
export function createChips(
  groupLabel: string,
  chips: readonly Chip[],
  onPick: (id: string | null) => void,
): Chips {
  const element = create('div', 'chips');
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', groupLabel);
  const buttons = chips.map((chip) => {
    const button = create('button', '', chip.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      onPick(chip.id);
    });
    element.append(button);
    return { id: chip.id, button };
  });
  return {
    element,
    show(id) {
      for (const { id: own, button } of buttons) {
        button.setAttribute('aria-pressed', String(own === id));
      }
    },
  };
}
