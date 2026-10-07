/**
 * Checks the stories of the Watch screen beyond what the types can: sources resolve, chapters
 * run forwards in time, and everything a story draws is in the catalogue. Pure: takes the records.
 */
import type { Story } from '../../src/data/types';
import { sourceErrors } from './catalogue';

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function chapterErrors(story: Story): string[] {
  const errors: string[] = [];
  const at = `story ${story.id}:`;
  const sourceIds = new Set(story.sources.map((source) => source.id));
  const seen = new Set<string>();
  if (story.chapters.length === 0) errors.push(`${at} has no chapters`);
  let previousJd = -Infinity;
  for (const chapter of story.chapters) {
    if (!ID.test(chapter.id)) errors.push(`${at} chapter id "${chapter.id}" is not kebab-case`);
    if (seen.has(chapter.id)) errors.push(`${at} chapter "${chapter.id}" is listed twice`);
    seen.add(chapter.id);
    if (!(chapter.atJd.value > previousJd)) {
      errors.push(`${at} chapter "${chapter.id}" does not start after the one before it`);
    }
    previousJd = chapter.atJd.value;
    if (!story.actorIds.includes(chapter.lookAtId)) {
      errors.push(
        `${at} chapter "${chapter.id}" looks at "${chapter.lookAtId}", not one of its actors`,
      );
    }
    if (chapter.viewFromId !== undefined && !story.actorIds.includes(chapter.viewFromId)) {
      errors.push(
        `${at} chapter "${chapter.id}" is seen from "${chapter.viewFromId}", not one of its actors`,
      );
    }
    if (!sourceIds.has(chapter.text.sourceId)) {
      errors.push(
        `${at} chapter "${chapter.id}" text cites "${chapter.text.sourceId}", not one of its sources`,
      );
    }
    if (chapter.text.quote.trim() === '') {
      errors.push(`${at} chapter "${chapter.id}" text has no quote from its source`);
    }
  }
  if (!(story.endJd.value > previousJd)) errors.push(`${at} ends before its last chapter starts`);
  return errors;
}

export function checkStories(stories: readonly Story[], catalogueIds: readonly string[]): string[] {
  const errors: string[] = [];
  const known = new Set(catalogueIds);
  const ids = new Set<string>();
  for (const story of stories) {
    if (!ID.test(story.id)) errors.push(`story ${story.id}: id is not kebab-case`);
    if (ids.has(story.id)) errors.push(`story ${story.id}: id is used twice`);
    ids.add(story.id);
    if (story.actorIds.length === 0) errors.push(`story ${story.id}: draws nothing`);
    for (const actor of story.actorIds) {
      if (!known.has(actor))
        errors.push(`story ${story.id}: actor "${actor}" is not in the catalogue`);
    }
    const quoted = story.chapters.map((chapter) => chapter.text.sourceId);
    errors.push(...sourceErrors(story, quoted), ...chapterErrors(story));
  }
  return errors;
}
