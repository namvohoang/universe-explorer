import type { CardModel } from './cardModel';

/** A little slower than normal talking, as in the prototype. */
const SPEAKING_RATE = 0.92;

/** Rewrites symbols and names a voice would stumble over into words. */
export function cleanForSpeech(text: string): string {
  return (
    text
      // Names with digits, said the way people say them.
      .replace(/TRAPPIST-1/g, 'Trappist One')
      .replace(/\bM87\b/g, 'M eighty-seven')
      // A black hole's name ends in a star that is said aloud: "A star".
      .replace(/\bA\*/g, 'A star')
      .replace(/\bBH1\b/g, 'B H one')
      // A minus sign is one that starts a number, not a hyphen inside a word.
      .replace(/(^|[\s(])-(\d)/g, '$1minus $2')
      .replace(/\s?°C/g, ' degrees Celsius')
      .replace(/\s?km\b/g, ' kilometres')
      .replace(/\s?cm\b/g, ' centimetres')
      .replace(/·/g, ',')
  );
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

/**
 * The voice to read with: an English one stored on the device. Some browsers also offer voices
 * that send the text to a server to be spoken; those are never used, because nothing the app
 * shows may leave the device.
 */
export function pickLocalVoice(
  voices: readonly Pick<SpeechSynthesisVoice, 'lang' | 'localService' | 'default'>[],
): number {
  const usable = voices
    .map((voice, index) => ({ voice, index }))
    .filter(({ voice }) => voice.localService && voice.lang.toLowerCase().startsWith('en'));
  const preferred = usable.find(({ voice }) => voice.default) ?? usable[0];
  return preferred ? preferred.index : -1;
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
      const voices = synth.getVoices();
      const voice = voices[pickLocalVoice(voices)];
      // No voice on the device: stay silent rather than use one that speaks through a server.
      if (!voice) {
        finish();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(lines.join(' '));
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = SPEAKING_RATE;
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
