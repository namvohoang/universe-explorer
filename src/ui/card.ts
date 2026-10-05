import type { CardModel } from './cardModel';
import { create } from './dom';
import { icon } from './icons';
import { speechLines, type Speaker } from './speech';
import { en } from './strings/en';

export interface Card {
  readonly element: HTMLElement;
  /** `narration` is the address of a recording of this card being read, if there is one. */
  show(model: CardModel, narration: string | null): void;
  hide(): void;
}

/** The screens on which the card is a sheet at the bottom that peeks and opens. */
const SHEET = window.matchMedia('(max-width: 700px)');

/** The info card: who this is, a few numbers, a few facts, and what the globe really is. */
export function createCard(onClose: () => void, speaker: Speaker | null): Card {
  const element = create('aside', 'card');
  element.setAttribute('aria-live', 'polite');
  element.hidden = true;

  const eyebrow = create('p', 'eyebrow');
  const name = create('h2', '');
  const titles = create('div', '');
  titles.append(eyebrow, name);
  const close = create('button', 'x');
  close.append(icon('close'));
  close.type = 'button';
  close.setAttribute('aria-label', en.closeCard);
  close.addEventListener('click', onClose);
  const head = create('div', 'card-head');
  head.append(titles, close);

  // On a phone the card is a sheet at the bottom. Closed, it peeks: just the name, a way to
  // open it and a button to hear it. (Shown by the stylesheet only on a small screen.)
  const peek = create('button', 'card-peek');
  peek.type = 'button';
  const peekName = create('strong', '');
  peek.append(create('span', 'handle'), create('span', 'peek-hint', en.peekHint), peekName);
  const peekRead = create('button', 'peek-read round');
  peekRead.type = 'button';
  const speakerIcon = icon('speaker');
  const stopIcon = icon('stop');
  stopIcon.style.display = 'none';
  peekRead.append(speakerIcon, stopIcon);

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
  // The words scroll; the buttons below them stay put, so they are always in reach.
  const body = create('div', 'card-body');
  body.append(hello, stats, factsTitle, facts, conceptTitle, concept, globe);
  element.append(peek, peekRead, head, body, actions);

  const setOpen = (open: boolean): void => {
    element.classList.toggle('open', open);
    peek.setAttribute('aria-expanded', String(open));
  };
  setOpen(false);
  peek.addEventListener('click', () => {
    setOpen(true);
    close.focus();
  });
  // A swipe down on the top of the open sheet closes it, and a swipe up on the peek opens it.
  const SWIPE_PIXELS = 30;
  const grips: readonly HTMLElement[] = [head, peek];
  for (const grip of grips) {
    let from: number | null = null;
    grip.addEventListener('pointerdown', (event) => {
      from = event.clientY;
    });
    grip.addEventListener('pointerup', (event) => {
      if (from === null) return;
      const moved = event.clientY - from;
      from = null;
      if (grip === head && moved > SWIPE_PIXELS) setOpen(false);
      if (grip === peek && moved < -SWIPE_PIXELS) setOpen(true);
    });
  }

  let shown: CardModel | null = null;
  let recording: string | null = null;
  let reading = false;
  const player = new Audio();
  const setReading = (now: boolean): void => {
    reading = now;
    read.textContent = now ? en.stopReading : en.readToMe;
    const label = now ? en.stopReading : en.readToMe;
    peekRead.setAttribute('aria-label', label);
    peekRead.title = label;
    speakerIcon.style.display = now ? 'none' : '';
    stopIcon.style.display = now ? '' : 'none';
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
  setReading(false);
  const toggleReading = (): void => {
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
  };
  read.addEventListener('click', toggleReading);
  peekRead.addEventListener('click', toggleReading);

  return {
    element,
    show(model, narration) {
      stopReading();
      shown = model;
      recording = narration;
      read.hidden = narration === null && speaker === null;
      actions.hidden = read.hidden;
      peekRead.hidden = read.hidden;
      peekName.textContent = model.name;
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
      body.scrollTop = 0;
    },
    hide() {
      stopReading();
      // A sheet goes back to its peek; a card on a wide screen goes away until the next place.
      setOpen(false);
      if (!SHEET.matches) element.hidden = true;
    },
  };
}
