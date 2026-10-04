import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { cards } from '../data/content/cards';
import { formatDuration, objectStats, solarSystemStats } from './stats';

const statsOf = (id: string): Record<string, string> => {
  const object = catalogue.find((o) => o.id === id);
  if (!object) throw new Error(`no ${id}`);
  const card = cards.find((c) => c.id === id);
  return Object.fromEntries(objectStats(object, catalogue, card).map((s) => [s.label, s.value]));
};

describe('formatDuration', () => {
  it('uses hours for short spans, Earth days for longer ones, Earth years for the longest', () => {
    expect(formatDuration(9.925)).toBe('9.9 hours');
    expect(formatDuration(47)).toBe('47 hours');
    expect(formatDuration(48)).toBe('2 Earth days');
    expect(formatDuration(88 * 24)).toBe('88 Earth days');
    expect(formatDuration(3 * 365.25 * 24)).toBe('3 Earth years');
  });
});

describe('objectStats', () => {
  it('works out every planet stat from the catalogue', () => {
    // Each expectation is the catalogue value, rounded for a kid, not a number typed here.
    expect(statsOf('earth')).toEqual({
      'One spin': '24 hours',
      'One trip around the Sun': '365 Earth days',
      Moons: '1',
      Width: '12,760 km',
    });
    expect(statsOf('mercury')['One trip around the Sun']).toBe('88 Earth days');
    expect(statsOf('jupiter')['One spin']).toBe('9.9 hours');
    expect(statsOf('jupiter').Width).toBe('11 Earths wide');
    expect(statsOf('neptune')['One trip around the Sun']).toBe('165 Earth years');
  });

  it('agrees with what the card sentences say', () => {
    expect(statsOf('saturn').Moons).toBe('274');
    expect(statsOf('mars').Moons).toBe('2');
    expect(statsOf('venus').Moons).toBe('0');
  });

  it('describes the Sun and the Moon in their own terms', () => {
    const sun = statsOf('sun');
    expect(sun.Width).toBe('110 Earths wide');
    expect(sun.Surface).toBe('about 5,500 °C');
    expect(sun['Sunlight reaches Earth in']).toBe('about 8 minutes');
    const moon = statsOf('moon');
    expect(moon['One trip around Earth']).toBe('27.3 Earth days');
    expect(moon['From Earth']).toBe('384,400 km');
    expect(moon.Moons).toBeUndefined();
  });

  it('gives every drawn body a few stats', () => {
    for (const object of catalogue) {
      if (object.shape?.type !== 'spheroid') continue;
      const card = cards.find((c) => c.id === object.id);
      expect(objectStats(object, catalogue, card).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('solarSystemStats', () => {
  it('counts the planets in the catalogue', () => {
    expect(solarSystemStats(catalogue)[0]).toEqual({ label: 'Planets', value: '8' });
  });
});
