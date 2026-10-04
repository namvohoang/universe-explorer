/**
 * Checks that every media file is credited in CREDITS.md and every credit row is complete
 * (.claude/rules/media.md). Pure: callers supply the file list and the Markdown text.
 */
import { MEDIA_KINDS } from '../../src/data/types/media';

export const MEDIA_DIR = 'public/media/';
export const MEDIA_SECTION = 'Images, textures and shape models';

/** Trusted sources, as listed in .claude/rules/media.md. A host matches if it equals or ends with one. */
export const TRUSTED_HOSTS = [
  'nasa.gov',
  'hubblesite.org',
  'webbtelescope.org',
  'stsci.edu',
  'esahubble.org',
  'esawebb.org',
  'esa.int',
  'eso.org',
  'noirlab.edu',
  'usgs.gov',
  // Approved by the owner on 2026-10-04: a museum's scans, mission operators, other agencies.
  'si.edu',
  'jhuapl.edu',
  'jaxa.jp',
  'roscosmos.ru',
] as const;

const COLUMNS = [
  'File',
  'Object',
  'Kind',
  'Credit',
  'Licence',
  'Source',
  'Retrieved',
  'Changes',
] as const;
type Column = (typeof COLUMNS)[number];

export type CreditRow = Record<Column, string>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim().replace(/^`(.*)`$/, '$1'));
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

/** Returns the lines of the section with the given `## ` heading, or null if it is missing. */
function sectionLines(markdown: string, heading: string): string[] | null {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  return end === -1 ? rest : rest.slice(0, end);
}

export interface ParsedCredits {
  rows: CreditRow[];
  errors: string[];
}

export function parseMediaCredits(markdown: string): ParsedCredits {
  const section = sectionLines(markdown, MEDIA_SECTION);
  if (!section) return { rows: [], errors: [`CREDITS.md has no "## ${MEDIA_SECTION}" section`] };

  const table = section.filter((line) => line.trim().startsWith('|')).map(splitRow);
  const [header, ...body] = table;
  if (!header) return { rows: [], errors: [`"${MEDIA_SECTION}" has no table`] };
  if (header.join('|') !== COLUMNS.join('|')) {
    return { rows: [], errors: [`"${MEDIA_SECTION}" columns must be: ${COLUMNS.join(', ')}`] };
  }

  const rows: CreditRow[] = [];
  const errors: string[] = [];
  for (const cells of body.filter((cells) => !isSeparator(cells))) {
    if (cells.length !== COLUMNS.length) {
      errors.push(
        `Row "${cells[0] ?? ''}" has ${String(cells.length)} cells, expected ${String(COLUMNS.length)}`,
      );
      continue;
    }
    rows.push(
      Object.fromEntries(COLUMNS.map((column, i) => [column, cells[i] ?? ''])) as CreditRow,
    );
  }
  return { rows, errors };
}

function isTrustedSource(source: string): boolean {
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return TRUSTED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function isRealDate(text: string): boolean {
  if (!ISO_DATE.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

function rowErrors(row: CreditRow): string[] {
  const errors: string[] = [];
  const where = `CREDITS.md row "${row.File}"`;
  for (const column of COLUMNS) {
    if (row[column] === '') errors.push(`${where}: ${column} is empty`);
  }
  if (row.File !== '' && !row.File.startsWith(MEDIA_DIR)) {
    errors.push(`${where}: File must be under ${MEDIA_DIR}`);
  }
  if (row.Kind !== '' && !(MEDIA_KINDS as readonly string[]).includes(row.Kind)) {
    errors.push(`${where}: Kind "${row.Kind}" is not one of ${MEDIA_KINDS.join(', ')}`);
  }
  if (row.Source !== '' && !isTrustedSource(row.Source)) {
    errors.push(
      `${where}: Source must be an https page on a trusted site (.claude/rules/media.md)`,
    );
  }
  if (row.Retrieved !== '' && !isRealDate(row.Retrieved)) {
    errors.push(`${where}: Retrieved must be a date as YYYY-MM-DD`);
  }
  return errors;
}

/**
 * @param mediaFiles repo-relative paths of every file under public/media/
 * @param creditsMarkdown the text of CREDITS.md
 */
export function checkCredits(mediaFiles: readonly string[], creditsMarkdown: string): string[] {
  const { rows, errors } = parseMediaCredits(creditsMarkdown);
  const credited = new Set(rows.map((row) => row.File));
  const present = new Set(mediaFiles);

  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.File)) errors.push(`CREDITS.md row "${row.File}": listed more than once`);
    seen.add(row.File);
    errors.push(...rowErrors(row));
    if (row.File.startsWith(MEDIA_DIR) && !present.has(row.File)) {
      errors.push(`CREDITS.md row "${row.File}": no such file`);
    }
  }
  for (const file of mediaFiles) {
    if (!credited.has(file)) errors.push(`${file}: no row in CREDITS.md`);
  }
  return errors;
}

/** What the catalogue says about one media file. */
export interface MediaUse {
  readonly objectId: string;
  readonly file: string;
  readonly kind: string;
  /** The credit shown on screen with the picture, if any; it must match CREDITS.md exactly. */
  readonly credit?: string;
}

/**
 * Checks the catalogue's media against CREDITS.md: every file an object uses is credited, and
 * the credit agrees on which object it shows and what kind of picture it is.
 */
export function checkMediaUses(uses: readonly MediaUse[], creditsMarkdown: string): string[] {
  const rows = new Map(parseMediaCredits(creditsMarkdown).rows.map((row) => [row.File, row]));
  const errors: string[] = [];
  for (const use of uses) {
    const row = rows.get(use.file);
    if (!row) {
      errors.push(`${use.objectId}: uses ${use.file}, which has no row in CREDITS.md`);
      continue;
    }
    if (row.Kind !== use.kind) {
      errors.push(
        `${use.objectId}: ${use.file} is "${use.kind}" here but "${row.Kind}" in CREDITS.md`,
      );
    }
    if (use.credit !== undefined && row.Credit !== use.credit) {
      errors.push(`${use.objectId}: the credit shown for ${use.file} differs from CREDITS.md`);
    }
    if (row.Object !== use.objectId) {
      errors.push(`${use.objectId}: ${use.file} is credited as showing "${row.Object}"`);
    }
  }
  return errors;
}
