/**
 * Checks the stories of the Watch screen beyond what the types can: sources resolve, chapters
 * run forwards in time, and everything a story draws is in the catalogue. Pure: takes the records.
 */
import type { GroundPath, SampledPath, StagedPath, Story } from '../../src/data/types';
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
    if (chapter.untilJd && !(chapter.untilJd.value > chapter.atJd.value)) {
      errors.push(`${at} chapter "${chapter.id}" stops before it starts`);
    }
    // The next chapter must start no sooner than this one stops.
    previousJd = Math.max(chapter.atJd.value, (chapter.untilJd?.value ?? -Infinity) - 1e-9);
    const craftIds = (story.craft ?? []).map((craft) => craft.id);
    if (![...story.actorIds, ...craftIds].includes(chapter.lookAtId)) {
      errors.push(
        `${at} chapter "${chapter.id}" looks at "${chapter.lookAtId}", not one of its actors or craft`,
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
  const lastStop = story.chapters[story.chapters.length - 1]?.untilJd;
  if (lastStop && Math.abs(lastStop.value - story.endJd.value) > 1e-9) {
    errors.push(`${at} ends at another time than its last chapter stops`);
  }
  return errors;
}

/** A path must run forwards in time, and a story must not run past either end of it. */
function pathErrors(
  story: Story,
  name: string,
  path: SampledPath | StagedPath | GroundPath,
  known: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const at = `story ${story.id}: path of "${name}"`;
  const samples = 'samples' in path ? path.samples.value : path.points.value;
  if (!known.has(path.centreId)) {
    errors.push(`${at} is measured from "${path.centreId}", not in the catalogue`);
  }
  if (samples.length < 2) return [...errors, `${at} has fewer than two samples`];
  for (const [index, sample] of samples.entries()) {
    const before = samples[index - 1];
    if (before && !(sample[0] > before[0])) {
      errors.push(`${at} does not run forwards in time at sample ${String(index)}`);
      break;
    }
  }
  const first = samples[0]?.[0] ?? Infinity;
  const last = samples[samples.length - 1]?.[0] ?? -Infinity;
  const start = story.chapters[0]?.atJd.value ?? first;
  if (start < first || story.endJd.value > last) {
    errors.push(`${at} does not cover the whole story`);
  }
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
    const craft = story.craft ?? [];
    if (story.path === 'tracked' && craft.length === 0) {
      errors.push(`story ${story.id}: says its path is tracked but flies no tracked craft`);
    }
    // A path drawn between a few known places must never be passed off as the path flown.
    if (story.path !== 'staged' && craft.some((one) => 'points' in one.path)) {
      errors.push(`story ${story.id}: flies a craft on a drawn path but does not say it is staged`);
    }
    for (const shadow of story.shadows ?? []) {
      for (const id of [shadow.casterId, shadow.onId]) {
        if (!story.actorIds.includes(id)) {
          errors.push(`story ${story.id}: draws a shadow with "${id}", not one of its actors`);
        }
      }
    }
    for (const id of Object.keys(story.turned ?? {})) {
      if (!story.actorIds.includes(id)) {
        errors.push(`story ${story.id}: turns "${id}", not one of its actors`);
      }
    }
    for (const one of craft) {
      if (!ID.test(one.id))
        errors.push(`story ${story.id}: craft id "${one.id}" is not kebab-case`);
      if (known.has(one.id)) {
        errors.push(`story ${story.id}: craft "${one.id}" has the id of a catalogue object`);
      }
      errors.push(...pathErrors(story, one.id, one.path, known));
    }
    for (const [id, path] of Object.entries(story.tracked ?? {})) {
      if (!story.actorIds.includes(id)) {
        errors.push(`story ${story.id}: tracks "${id}", not one of its actors`);
      }
      errors.push(...pathErrors(story, id, path, known));
    }
    const quoted = story.chapters.map((chapter) => chapter.text.sourceId);
    errors.push(...sourceErrors(story, quoted), ...chapterErrors(story));
  }
  return errors;
}
