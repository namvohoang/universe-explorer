import type { CardModel } from './cardModel';
import { create } from './dom';
import { speechLines, type Speaker } from './speech';
import { en } from './strings/en';

export interface Card {
  readonly element: HTMLElement;
  /** `narration` is the address of a recording of this card being read, if there is one. */
  show(model: CardModel, narration: string | null): void;
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
  const conceptTitle = create('h3', '');
  const concept = create('p', 'concept');
  const globe = create('p', 'globe-note');
  // "Read it to me", for kids who are still learning to read. A card with a recording plays
  // it; one without falls back to a voice on the device, and with neither the button is hidden.
  const read = create('button', 'primary', en.readToMe);
  read.type = 'button';
  const actions = create('div', 'card-actions');
  actions.append(read);
  element.append(head, hello, stats, factsTitle, facts, conceptTitle, concept, globe, actions);

  let shown: CardModel | null = null;
  let recording: string | null = null;
  let reading = false;
  const player = new Audio();
  const setReading = (now: boolean): void => {
    reading = now;
    read.textContent = now ? en.stopReading : en.readToMe;
  };
  const stopReading = (): void => {
    if (!reading) return;
    player.pause();
    speaker?.stop();
    setReading(false);
  };
  const speak = (model: CardModel): void => {
    if (!speaker) {
      setReading(false);
      return;
    }
    speaker.speak(speechLines(model), () => {
      setReading(false);
    });
  };
  player.addEventListener('ended', () => {
    setReading(false);
  });
  read.addEventListener('click', () => {
    if (!shown) return;
    if (reading) {
      stopReading();
      return;
    }
    setReading(true);
    if (recording === null) {
      speak(shown);
      return;
    }
    const model = shown;
    player.src = recording;
    player.currentTime = 0;
    // If the recording cannot play (not downloaded yet and offline, say), use the device voice.
    player.play().catch(() => {
      speak(model);
    });
  });

  return {
    element,
    show(model, narration) {
      stopReading();
      shown = model;
      recording = narration;
      read.hidden = narration === null && speaker === null;
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
      conceptTitle.hidden = model.concept === null;
      concept.hidden = model.concept === null;
      conceptTitle.textContent = model.concept?.title ?? '';
      concept.textContent = model.concept?.text ?? '';
      globe.hidden = model.note === null;
      globe.textContent = model.note ?? '';
      element.hidden = false;
      element.scrollTop = 0;
    },
    hide() {
      stopReading();
      element.hidden = true;
    },
  };
}
