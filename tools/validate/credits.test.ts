import { describe, expect, it } from 'vitest';
import { checkCredits, checkMediaUses, parseMediaCredits } from './credits';

const HEADER = `## Images, textures and shape models

| File | Object | Kind | Credit | Licence | Source | Retrieved | Changes |
|---|---|---|---|---|---|---|---|
`;

const row = (overrides: Partial<Record<string, string>> = {}): string => {
  const cells = {
    File: '`public/media/earth.webp`',
    Object: 'earth',
    Kind: 'photo',
    Credit: 'NASA',
    Licence: 'Public domain',
    Source: 'https://images.nasa.gov/details/example',
    Retrieved: '2026-10-04',
    Changes: 'Resized',
    ...overrides,
  };
  return `| ${Object.values(cells).join(' | ')} |\n`;
};

const FILE = 'public/media/earth.webp';

describe('parseMediaCredits', () => {
  it('reads rows and strips code formatting from cells', () => {
    const { rows, errors } = parseMediaCredits(HEADER + row());
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.File).toBe(FILE);
  });

  it('accepts an empty table', () => {
    expect(parseMediaCredits(HEADER + '\n*None yet.*\n')).toEqual({ rows: [], errors: [] });
  });

  it('stops at the next section', () => {
    const other = '\n## Fonts\n\n| Font | Used for |\n|---|---|\n| Some Font | Titles |\n';
    expect(parseMediaCredits(HEADER + row() + other).rows).toHaveLength(1);
  });

  it('reports a missing section and wrong columns', () => {
    expect(parseMediaCredits('# Credits\n').errors).toHaveLength(1);
    const wrong = '## Images, textures and shape models\n\n| File | Credit |\n|---|---|\n';
    expect(parseMediaCredits(wrong).errors).toHaveLength(1);
  });
});

describe('checkCredits', () => {
  it('passes when every file has a complete row', () => {
    expect(checkCredits([FILE], HEADER + row())).toEqual([]);
  });

  it('passes with no media and no rows', () => {
    expect(checkCredits([], HEADER)).toEqual([]);
  });

  it('flags a file with no row', () => {
    expect(checkCredits([FILE, 'public/media/mars.webp'], HEADER + row())).toEqual([
      'public/media/mars.webp: no row in CREDITS.md',
    ]);
  });

  it('flags a row with no file', () => {
    expect(checkCredits([], HEADER + row())).toEqual([`CREDITS.md row "${FILE}": no such file`]);
  });

  it('flags a duplicate row', () => {
    expect(checkCredits([FILE], HEADER + row() + row())).toHaveLength(1);
  });

  it.each([
    ['empty credit', { Credit: '' }],
    ['unknown kind', { Kind: 'drawing' }],
    ['untrusted source', { Source: 'https://wallpapers.example.com/earth' }],
    ['look-alike host', { Source: 'https://notnasa.gov.example.com/earth' }],
    ['plain http source', { Source: 'http://images.nasa.gov/details/example' }],
    ['source that is not a URL', { Source: 'NASA website' }],
    ['malformed date', { Retrieved: '4 Oct 2026' }],
    ['impossible date', { Retrieved: '2026-02-30' }],
  ])('flags %s', (_name, overrides) => {
    expect(checkCredits([FILE], HEADER + row(overrides))).toHaveLength(1);
  });

  it('flags a file outside public/media', () => {
    const errors = checkCredits([], HEADER + row({ File: '`src/earth.webp`' }));
    expect(errors).toEqual(['CREDITS.md row "src/earth.webp": File must be under public/media/']);
  });

  it.each([
    'https://science.nasa.gov/image-detail/x',
    'https://esahubble.org/images/heic0000a/',
    'https://www.eso.org/public/images/eso0000a/',
    'https://astrogeology.usgs.gov/search/map/x',
  ])('accepts trusted source %s', (Source) => {
    expect(checkCredits([FILE], HEADER + row({ Source }))).toEqual([]);
  });
});

describe('checkMediaUses', () => {
  const use = { objectId: 'earth', file: FILE, kind: 'photo' };

  it('passes when the catalogue and the credits agree', () => {
    expect(checkMediaUses([use], HEADER + row())).toEqual([]);
  });

  it('flags a file the catalogue uses but nobody credited', () => {
    expect(checkMediaUses([use], HEADER)).toHaveLength(1);
  });

  it('flags a kind that differs from the credit', () => {
    expect(checkMediaUses([{ ...use, kind: 'artist-concept' }], HEADER + row())).toHaveLength(1);
  });

  it('flags a file credited as showing another object', () => {
    expect(checkMediaUses([{ ...use, objectId: 'mars' }], HEADER + row())).toHaveLength(1);
  });
});
