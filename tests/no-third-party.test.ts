import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Kids first (PLAN.md §3): the app must not load anything from another origin.
const ROOT = join(import.meta.dirname, '..');
const SHIPPED_EXTENSIONS = ['.ts', '.css', '.html', '.json'];
const URL_PATTERN = /(?:https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s"'`)]*/gi;
// Citations: where catalogue values were read from. Shown as text, never fetched by the app.
const CITATION_FILES = [join(ROOT, 'src/data/catalogue/sources.ts')];
// XML namespaces are identifiers, not requests.
const ALLOWED = [/^http:\/\/www\.w3\.org\//];

function shippedFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return shippedFiles(path);
    const shipped = SHIPPED_EXTENSIONS.some((ext) => entry.name.endsWith(ext));
    const checked = shipped && !entry.name.endsWith('.test.ts') && !CITATION_FILES.includes(path);
    return checked ? [path] : [];
  });
}

function externalUrls(text: string): string[] {
  return (text.match(URL_PATTERN) ?? []).filter((url) => !ALLOWED.some((ok) => ok.test(url)));
}

describe('no third-party requests', () => {
  const files = [join(ROOT, 'index.html'), ...shippedFiles(join(ROOT, 'src'))];

  it('finds shipped files to check', () => {
    expect(files.length).toBeGreaterThan(1);
  });

  it.each(files)('%s references no external origin', (file) => {
    expect(externalUrls(readFileSync(file, 'utf8'))).toEqual([]);
  });

  it('detects an external URL when there is one', () => {
    expect(externalUrls('<link href="https://fonts.example.com/css">')).toHaveLength(1);
    expect(externalUrls('src="//cdn.example.com/x.js"')).toHaveLength(1);
    expect(externalUrls('<svg xmlns="http://www.w3.org/2000/svg">')).toEqual([]);
  });
});
