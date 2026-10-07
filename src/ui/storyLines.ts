import type { Story } from '../data/types';
import { cleanForSpeech } from './speech';
import { en } from './strings/en';

/**
 * What is read out for a story: its name, then the sentence of each part in turn. Always the
 * English, as for the cards: the recordings and the device voice used are English.
 */
export function storyLines(story: Story): string[] {
  const text = (key: string): string => (en as Readonly<Record<string, string>>)[key] ?? '';
  return [
    `${text(story.titleKey)}.`,
    ...story.chapters.map((chapter) => text(chapter.text.key)),
  ].map(cleanForSpeech);
}

/** The key a story's recording is filed under, apart from any card's. */
export function storyNarrationId(story: Story): string {
  return `story-${story.id}`;
}

/**
 * The stretch of a recording that holds one line: from where the line starts to where the
 * next one does, or to the end (`null`) for the last line.
 */
export function lineSpan(
  starts: readonly number[],
  line: number,
): { readonly from: number; readonly to: number | null } {
  return { from: starts[line] ?? 0, to: starts[line + 1] ?? null };
}
