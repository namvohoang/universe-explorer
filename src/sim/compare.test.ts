import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { distanceLine, sizeLineup } from './compare';
import { semiMajorAxisKm } from './elements';
import { bodyRadiusKm } from './layout';

const planets = catalogue.filter((o) => o.kind === 'planet');
const byId = (id: string) => {
  const object = catalogue.find((o) => o.id === id);
  if (!object) throw new Error(`no ${id}`);
  return object;
};

describe('sizeLineup', () => {
  const lineup = sizeLineup(planets);

  it('keeps the order given and makes the largest the yardstick', () => {
    expect(lineup.map((item) => item.id)).toEqual(planets.map((p) => p.id));
    expect(Math.max(...lineup.map((item) => item.share))).toBe(1);
    expect(lineup.find((item) => item.share === 1)?.id).toBe('jupiter');
  });

  it('keeps every size ratio of the catalogue', () => {
    for (const a of lineup) {
      for (const b of lineup) {
        const real = (bodyRadiusKm(byId(a.id)) ?? NaN) / (bodyRadiusKm(byId(b.id)) ?? NaN);
        expect(a.share / b.share).toBeCloseTo(real, 9);
      }
    }
  });

  it('leaves out things with no size, like belts', () => {
    expect(sizeLineup(catalogue.filter((o) => o.kind === 'belt'))).toEqual([]);
  });
});

describe('distanceLine', () => {
  const line = distanceLine(planets);

  it('runs from the nearest planet to the farthest', () => {
    expect(line[0]?.id).toBe('mercury');
    expect(line.at(-1)?.id).toBe('neptune');
    expect(line.at(-1)?.share).toBe(1);
  });

  it('keeps every distance ratio of the catalogue', () => {
    for (const a of line) {
      for (const b of line) {
        const [oa, ob] = [byId(a.id).orbit, byId(b.id).orbit];
        if (!oa || !ob) throw new Error('planets have orbits');
        expect(a.share / b.share).toBeCloseTo(semiMajorAxisKm(oa) / semiMajorAxisKm(ob), 9);
      }
    }
  });

  it('shows why sizes cannot share the line: Jupiter would be far under one pixel', () => {
    const jupiterWidthKm = 2 * (bodyRadiusKm(byId('jupiter')) ?? NaN);
    const neptune = line.at(-1);
    if (!neptune) throw new Error('no Neptune');
    const pixelsForLine = 3000;
    expect((jupiterWidthKm / neptune.km) * pixelsForLine).toBeLessThan(1);
  });
});
