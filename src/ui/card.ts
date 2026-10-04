import type { CardModel } from './cardModel';
import { create } from './dom';
import { en } from './strings/en';

export interface Card {
  readonly element: HTMLElement;
  show(model: CardModel): void;
  hide(): void;
}

/** The info card: who this is, a few numbers, a few facts, and what the globe really is. */
export function createCard(onClose: () => void): Card {
  const element = create('aside', 'card');
  element.setAttribute('aria-live', 'polite');
  element.hidden = true;

  const eyebrow = create('p', 'eyebrow');
  const name = create('h2', '');
  const titles = create('div', '');
  titles.append(eyebrow, name);
  const close = create('button', 'x', '×');
  close.type = 'button';
  close.setAttribute('aria-label', en.closeCard);
  close.addEventListener('click', onClose);
  const head = create('div', 'card-head');
  head.append(titles, close);

  const hello = create('p', 'hello');
  const stats = create('dl', 'stats');
  const factsTitle = create('h3', '', en.coolFacts);
  const facts = create('ul', 'facts');
  const globe = create('p', 'globe-note');
  element.append(head, hello, stats, factsTitle, facts, globe);

  return {
    element,
    show(model) {
      eyebrow.textContent = model.eyebrow;
      name.textContent = model.name;
      hello.textContent = model.hello;
      stats.replaceChildren(
        ...model.stats.map((stat) => {
          const row = create('div', '');
          row.append(create('dt', '', stat.label), create('dd', '', stat.value));
          return row;
        }),
      );
      facts.replaceChildren(...model.facts.map((fact) => create('li', '', fact)));
      globe.hidden = model.globeNote === null;
      globe.textContent = model.globeNote === null ? '' : `${en.aboutTheGlobe}: ${model.globeNote}`;
      element.hidden = false;
      element.scrollTop = 0;
    },
    hide() {
      element.hidden = true;
    },
  };
}
