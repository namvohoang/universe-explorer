/**
 * Checks the stories of the Watch screen beyond what the types can: sources resolve, chapters
 * run forwards in time, and everything a story draws is in the catalogue. Pure: takes the records.
 */
import type {
  ChasePath,
  GroundPath,
  SampledPath,
  StagedPath,
  Story,
  StoryCraft,
} from '../../src/data/types';
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
    if (
      chapter.slowStart &&
      !(chapter.slowStart.storySeconds > 0 && chapter.slowStart.overSeconds > 0)
    ) {
      errors.push(`${at} chapter "${chapter.id}" opens slowly over no time at all`);
    }
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
    if (chapter.standAtId !== undefined && !story.actorIds.includes(chapter.standAtId)) {
      errors.push(
        `${at} chapter "${chapter.id}" stands at "${chapter.standAtId}", not one of its actors`,
      );
    }
    if (chapter.standOn !== undefined) {
      const [lonDegEast, latDeg] = chapter.standOn.value;
      if (chapter.standAtId === undefined) {
        errors.push(`${at} chapter "${chapter.id}" names a place to stand on, but no body`);
      }
      if (!(Math.abs(lonDegEast) <= 180) || !(Math.abs(latDeg) <= 90)) {
        errors.push(`${at} chapter "${chapter.id}" stands on a place that is not on a globe`);
      }
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

/** A craft that chases another needs that other one, on a sampled path, and a note that the chase is drawn. */
function chaseErrors(
  story: Story,
  name: string,
  path: ChasePath,
  known: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const at = `story ${story.id}: path of "${name}"`;
  if (!known.has(path.centreId)) {
    errors.push(`${at} is measured from "${path.centreId}", not in the catalogue`);
  }
  const ahead = (story.craft ?? []).find((craft) => craft.id === path.followsId);
  if (!ahead || !('samples' in ahead.path)) {
    errors.push(`${at} follows "${path.followsId}", not a craft of the story with a sampled path`);
  }
  const start = story.chapters[0]?.atJd.value ?? Infinity;
  if (!(path.joinsAtJd.value > start && path.joinsAtJd.value <= story.endJd.value)) {
    errors.push(`${at} joins the other craft outside the story`);
  }
  if (story.noteKey === undefined) {
    errors.push(`${at} is a drawing, but the story has no note to say so`);
  }
  return errors;
}

/** A craft drawn as a 3D model needs that model, and what it sheds must come off in order. */
function modelErrors(story: Story, craft: StoryCraft, modelIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const at = `story ${story.id}: craft "${craft.id}"`;
  if (craft.modelOfId !== undefined && !modelIds.has(craft.modelOfId)) {
    errors.push(`${at} is drawn as "${craft.modelOfId}", which has no 3D model in the catalogue`);
  }
  if (craft.fromGround === true && !('points' in craft.path && !('heading' in craft.path))) {
    errors.push(`${at} stands on the ground but has no staged path that starts there`);
  }
  if (craft.sheds && craft.modelOfId === undefined) {
    errors.push(`${at} sheds parts but is not drawn as a 3D model`);
  }
  if ((craft.burns || craft.uprightUntilJd) && craft.modelOfId === undefined) {
    errors.push(`${at} has engine burns or a lean but is not drawn as a 3D model`);
  }
  let burntUntilJd = -Infinity;
  for (const burn of craft.burns ?? []) {
    if (!(burn.fromJd.value >= burntUntilJd && burn.untilJd.value > burn.fromJd.value)) {
      errors.push(`${at} has engine burns that overlap or run backwards`);
    }
    burntUntilJd = burn.untilJd.value;
  }
  if (craft.tower === true && craft.fromGround !== true) {
    errors.push(`${at} has a launch tower but does not start on the ground`);
  }
  if (craft.tower === true && story.noteKey === undefined) {
    errors.push(`${at} is drawn with a tower, but the story has no note to say it is a drawing`);
  }
  // A flame is a drawing, and the screen must say so.
  if (craft.burns && story.noteKey === undefined) {
    errors.push(`${at} is drawn with a flame, but the story has no note to say it is a drawing`);
  }
  let previousJd = story.chapters[0]?.atJd.value ?? -Infinity;
  let previousShare = 0;
  for (const shed of craft.sheds ?? []) {
    if (!(shed.atJd.value >= previousJd && shed.atJd.value <= story.endJd.value)) {
      errors.push(`${at} sheds a part out of order or outside the story`);
    }
    if (!(shed.belowShare.value > previousShare && shed.belowShare.value < 1)) {
      errors.push(`${at} sheds a part that is not further up it than the one before`);
    }
    previousJd = shed.atJd.value;
    previousShare = shed.belowShare.value;
  }
  return errors;
}

export function checkStories(
  stories: readonly Story[],
  catalogueIds: readonly string[],
  /** Ids of the catalogue objects that have a 3D model. */
  modelIds: ReadonlySet<string> = new Set(),
): string[] {
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
    if (
      story.path !== 'staged' &&
      craft.some((one) => 'points' in one.path || 'followsId' in one.path)
    ) {
      errors.push(`story ${story.id}: flies a craft on a drawn path but does not say it is staged`);
    }
    if (story.dustAlongId !== undefined) {
      if (!known.has(story.dustAlongId)) {
        errors.push(
          `story ${story.id}: strews dust along "${story.dustAlongId}", not in the catalogue`,
        );
      }
      // Where the dust lies is a drawing, and the screen must say so.
      if (story.noteKey === undefined) {
        errors.push(`story ${story.id}: draws dust but has no note to say it is a drawing`);
      }
    }
    if (story.skyTrack) {
      for (const id of [story.skyTrack.ofId, story.skyTrack.fromId]) {
        if (!story.actorIds.includes(id)) {
          errors.push(`story ${story.id}: draws a sky track with "${id}", not one of its actors`);
        }
      }
    }
    if (story.aurora) {
      if (!story.actorIds.includes(story.aurora.onId)) {
        errors.push(
          `story ${story.id}: draws an aurora on "${story.aurora.onId}", not one of its actors`,
        );
      }
      const [nearest, farthest] = story.aurora.fromPoleDeg.value;
      if (!(nearest > 0 && farthest > nearest && farthest < 90)) {
        errors.push(`story ${story.id}: the aurora’s band is not between its pole and its equator`);
      }
      if (story.noteKey === undefined) {
        errors.push(`story ${story.id}: draws an aurora but has no note to say it is a drawing`);
      }
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
      if ('followsId' in one.path) {
        errors.push(...chaseErrors(story, one.id, one.path, known));
        continue;
      }
      if (!ID.test(one.id))
        errors.push(`story ${story.id}: craft id "${one.id}" is not kebab-case`);
      if (known.has(one.id)) {
        errors.push(`story ${story.id}: craft "${one.id}" has the id of a catalogue object`);
      }
      errors.push(...pathErrors(story, one.id, one.path, known));
      errors.push(...modelErrors(story, one, modelIds));
    }
    if (story.air) {
      if (!story.actorIds.includes(story.air.ofId)) {
        errors.push(
          `story ${story.id}: draws the air of "${story.air.ofId}", not one of its actors`,
        );
      }
      if (story.noteKey === undefined) {
        errors.push(`story ${story.id}: draws a blue sky but has no note to say it is a drawing`);
      }
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
