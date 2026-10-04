import { create } from './dom';

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export interface Segmented<T extends string> {
  readonly element: HTMLElement;
  /** Shows a value as chosen without calling `onChange`. */
  show(value: T): void;
}

/** A row of buttons of which exactly one is pressed, like the prototype's speed control. */
export function createSegmented<T extends string>(
  groupLabel: string,
  options: readonly SegmentedOption<T>[],
  initial: T,
  onChange: (value: T) => void,
): Segmented<T> {
  const element = create('div', 'seg');
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', groupLabel);

  const buttons = options.map((option) => {
    const button = create('button', '', option.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      show(option.value);
      onChange(option.value);
    });
    element.append(button);
    return { value: option.value, button };
  });

  function show(value: T): void {
    for (const { value: own, button } of buttons) {
      button.setAttribute('aria-pressed', String(own === value));
    }
  }
  show(initial);

  return { element, show };
}
