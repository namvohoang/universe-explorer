import type { CardModel } from './cardModel';

/** A little slower than normal talking, as in the prototype. */
const SPEAKING_RATE = 0.92;

/** Rewrites symbols a voice would stumble over into words. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/-(\d)/g, 'minus $1')
    .replace(/\s?°C/g, ' degrees Celsius')
    .replace(/\s?km\b/g, ' kilometres')
    .replace(/\s?cm\b/g, ' centimetres')
    .replace(/·/g, ',');
}

/** What is read out for a card: its name, its hello and its facts. */
export function speechLines(model: CardModel): string[] {
  return [`${model.name}.`, model.hello, ...model.facts].map(cleanForSpeech);
}

/** Something that can read text aloud. */
export interface Speaker {
  /** Reads the lines one after another; `onDone` runs when it finishes or is stopped. */
  speak(lines: readonly string[], onDone: () => void): void;
  stop(): void;
}

/** The browser's built-in voice, or `null` where the browser has none. */
export function createBrowserSpeaker(): Speaker | null {
  if (!('speechSynthesis' in window)) return null;
  const synth = window.speechSynthesis;
  let done: (() => void) | null = null;
  const finish = (): void => {
    const callback = done;
    done = null;
    callback?.();
  };
  return {
    speak(lines, onDone) {
      synth.cancel();
      done = onDone;
      const utterance = new SpeechSynthesisUtterance(lines.join(' '));
      utterance.rate = SPEAKING_RATE;
      utterance.lang = 'en';
      utterance.onend = finish;
      utterance.onerror = finish;
      synth.speak(utterance);
    },
    stop() {
      synth.cancel();
      finish();
    },
  };
}
