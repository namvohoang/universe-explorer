/**
 * `npm run validate` — repository checks that are not unit tests of the code.
 * Today: media files and CREDITS.md. The catalogue checks join in PLAN.md task 1.2.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { MEDIA_DIR, checkCredits } from './validate/credits';

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
const errors = checkCredits(mediaFiles, readFileSync(join(ROOT, 'CREDITS.md'), 'utf8'));

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`);
  console.error(`validate: ${String(errors.length)} problem(s)`);
  process.exit(1);
}
console.log(`validate: media and credits OK (${String(mediaFiles.length)} media file(s))`);
console.log('validate: catalogue SKIPPED — no catalogue yet (PLAN.md task 1.2)');
