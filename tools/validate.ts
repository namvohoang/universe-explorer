/**
 * `npm run validate` — repository checks that are not unit tests of the code.
 * Checks the catalogue (sources, ids, sane values), the stories of the Watch screen, and media
 * files against CREDITS.md.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { catalogue } from '../src/data/catalogue';
import { stories } from '../src/data/stories';
import type { MediaRef } from '../src/data/types';
import { checkCatalogue } from './validate/catalogue';
import { MEDIA_DIR, checkCredits, checkMediaUses } from './validate/credits';
import { checkStories } from './validate/stories';

const ROOT = join(import.meta.dirname, '..');
const IGNORED_FILES = new Set(['.gitkeep', '.DS_Store']);

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(path);
    return IGNORED_FILES.has(entry.name) ? [] : [relative(ROOT, path).split(sep).join('/')];
  });
}

const mediaFiles = filesUnder(join(ROOT, MEDIA_DIR));
const credits = readFileSync(join(ROOT, 'CREDITS.md'), 'utf8');
const mediaUses = catalogue.flatMap((object) =>
  object.media.map((media) => ({
    objectId: object.id,
    file: media.file,
    kind: media.kind,
    ...(media.credit === undefined ? {} : { credit: media.credit }),
  })),
);
// A story's real photo is credited under the story's own id.
const storyMedia = (story: (typeof stories)[number]): MediaRef[] => [
  ...(story.fromEarth ?? []).map(({ media }) => media),
  // So is the 3D figure of somebody who steps out of a craft.
  ...(story.craft ?? []).flatMap((craft) => (craft.walker ? [craft.walker.media] : [])),
];
const storyMediaUses = stories.flatMap((story) =>
  storyMedia(story).map((media) => ({
    objectId: story.id,
    file: media.file,
    kind: media.kind,
    ...(media.credit === undefined ? {} : { credit: media.credit }),
  })),
);
const errors = [
  ...checkCatalogue(catalogue),
  ...checkStories(
    stories,
    catalogue.map((object) => object.id),
    new Set(
      catalogue
        .filter((object) => object.media.some((media) => media.role === 'model'))
        .map((object) => object.id),
    ),
  ),
  ...checkCredits(mediaFiles, credits),
  ...checkMediaUses([...mediaUses, ...storyMediaUses], credits),
];

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  console.error(`validate: ${String(errors.length)} problem(s)`);
  process.exit(1);
}
console.log(`validate: media and credits OK (${String(mediaFiles.length)} media file(s))`);
console.log(`validate: catalogue OK (${String(catalogue.length)} object(s))`);
console.log(`validate: stories OK (${String(stories.length)} story(ies))`);
