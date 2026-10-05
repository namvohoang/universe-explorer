import { recall } from '../storage';
import { en, type StringKey } from './en';
import { vi } from './vi';

export const LANGUAGES = ['en', 'vi'] as const;
export type Language = (typeof LANGUAGES)[number];
/** The note in the browser that remembers the language chosen. */
export const LANGUAGE_KEY = 'language';

/**
 * The language to show: one asked for in the address (`?lang=vi`), else the one chosen before
 * in this browser, else English. Outside a browser (tests, tools) it is always English.
 */
function chosenLanguage(): Language {
  const asked =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('lang');
  const wanted = asked ?? recall(LANGUAGE_KEY);
  return LANGUAGES.find((language) => language === wanted) ?? 'en';
}

export const language: Language = chosenLanguage();

/** Every user-facing string, in the language chosen when the app opened. */
export const words: Readonly<Record<StringKey, string>> = language === 'vi' ? vi : en;

/** The language's own way of writing numbers and dates. */
export const locale = language === 'vi' ? 'vi-VN' : 'en-GB';
