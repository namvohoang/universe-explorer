import { describe, expect, it } from 'vitest';
import { formatLink, parseLink } from './link';

describe('parseLink', () => {
  it('reads the place from the hash and the scale from the query', () => {
    expect(parseLink('?scale=true-sizes', '#saturn')).toEqual({
      place: 'saturn',
      scale: 'true-sizes',
    });
    expect(parseLink('', '')).toEqual({ place: null, scale: null });
    expect(parseLink('', '#')).toEqual({ place: null, scale: null });
  });

  it('ignores a scene written in front of the place', () => {
    expect(parseLink('', '#deep/andromeda').place).toBe('andromeda');
  });

  it('still understands an old ?go= link, but the hash wins', () => {
    expect(parseLink('?go=mars', '').place).toBe('mars');
    expect(parseLink('?go=mars', '#venus').place).toBe('venus');
  });
});

describe('formatLink', () => {
  it('writes the scale in the query and the place in the hash', () => {
    expect(formatLink('', 'saturn', 'easy')).toBe('?scale=easy#saturn');
    expect(formatLink('', null, 'true')).toBe('?scale=true');
  });

  it('keeps a date and a speed, and drops an old ?go=', () => {
    expect(formatLink('?go=mars&speed=pause&scale=true', 'm87-black-hole', 'easy')).toBe(
      '?speed=pause&scale=easy#m87-black-hole',
    );
  });

  it('round-trips', () => {
    const link = formatLink('?date=1986-02-09', 'halley', 'true-sizes');
    const [search = '', hash = ''] = link.split('#');
    expect(parseLink(search, `#${hash}`)).toEqual({ place: 'halley', scale: 'true-sizes' });
  });
});
