import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { bodyRadiusKm } from '../sim/layout';
import { cardModel } from './cardModel';
import { cleanForSpeech, speechLines } from './speech';

describe('cleanForSpeech', () => {
  it('says minus signs, degrees and units as words', () => {
    expect(cleanForSpeech('nights can drop to -180 °C.')).toBe(
      'nights can drop to minus 180 degrees Celsius.',
    );
    expect(cleanForSpeech('more than 2,000 km an hour')).toBe('more than 2,000 kilometres an hour');
    expect(cleanForSpeech('about an inch (2.5 cm) every year')).toBe(
      'about an inch (2.5 centimetres) every year',
    );
  });

  it('leaves hyphens inside words alone', () => {
    expect(cleanForSpeech('second-biggest, blue-green')).toBe('second-biggest, blue-green');
  });
});

describe('speechLines', () => {
  it('reads the name, the hello and the facts, and nothing else', () => {
    const model = cardModel('mercury', catalogue);
    const lines = speechLines(model);
    expect(lines).toHaveLength(2 + model.facts.length);
    expect(lines[0]).toBe('Mercury.');
    expect(lines[1]).toBe(model.hello);
    expect(lines.join(' ')).toContain('minus 180 degrees Celsius');
  });

  it('leaves no symbol a voice would trip on, for any card', () => {
    const ids = [null, ...catalogue.filter((o) => bodyRadiusKm(o) !== null).map((o) => o.id)];
    for (const id of ids) {
      expect(speechLines(cardModel(id, catalogue)).join(' ')).not.toMatch(/°|·| km\b| cm\b|-\d/);
    }
  });
});
