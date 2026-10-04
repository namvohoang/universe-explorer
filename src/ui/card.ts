import type { CardModel } from './cardModel';
import { create } from './dom';
import { speechLines, type Speaker } from './speech';
import { en } from './strings/en';

export interface Card {
  readonly element: HTMLElement;
  show(model: CardModel): void;
  hide(): void;
}

/** The info card: who this is, a few numbers, a few facts, and what the globe really is. */
export function createCard(onClose: () => void, speaker: Speaker | null): Card {
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
  // "Read it to me", for kids who are still learning to read. Hidden where there is no voice.
  const read = create('button', 'primary', en.readToMe);
  read.type = 'button';
  read.hidden = speaker === null;
  const actions = create('div', 'card-actions');
  actions.append(read);
  element.append(head, hello, stats, factsTitle, facts, globe, actions);

  let shown: CardModel | null = null;
  let reading = false;
  const setReading = (now: boolean): void => {
    reading = now;
    read.textContent = now ? en.stopReading : en.readToMe;
  };
  const stopReading = (): void => {
    if (reading) speaker?.stop();
  };
  read.addEventListener('click', () => {
    if (!speaker || !shown) return;
    if (reading) {
      speaker.stop();
      return;
    }
    setReading(true);
    speaker.speak(speechLines(shown), () => {
      setReading(false);
    });
  });

  return {
    element,
    show(model) {
      stopReading();
      shown = model;
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
      factsTitle.hidden = model.facts.length === 0;
      globe.hidden = model.globeNote === null;
      globe.textContent = model.globeNote === null ? '' : `${en.aboutTheGlobe}: ${model.globeNote}`;
      element.hidden = false;
      element.scrollTop = 0;
    },
    hide() {
      stopReading();
      element.hidden = true;
    },
  };
}
