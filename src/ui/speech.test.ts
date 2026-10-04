import { describe, expect, it } from 'vitest';
import { catalogue } from '../data/catalogue';
import { bodyRadiusKm } from '../sim/layout';
import { cardModel } from './cardModel';
import { cleanForSpeech, pickLocalVoice, speechLines } from './speech';

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

  it('says names with digits the way people do', () => {
    expect(cleanForSpeech('TRAPPIST-1 is a star')).toBe('Trappist One is a star');
    expect(cleanForSpeech('The M87 Black Hole.')).toBe('The M eighty-seven Black Hole.');
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
      expect(speechLines(cardModel(id, catalogue)).join(' ')).not.toMatch(
        /°|·| km\b| cm\b|-\d|M87/,
      );
    }
  });
});

describe('pickLocalVoice', () => {
  const voice = (lang: string, localService: boolean, isDefault = false) => ({
    lang,
    localService,
    default: isDefault,
  });

  it('never picks a voice that speaks through a server', () => {
    expect(pickLocalVoice([voice('en-US', false, true), voice('en-GB', false)])).toBe(-1);
    expect(pickLocalVoice([voice('en-US', false, true), voice('en-GB', true)])).toBe(1);
  });

  it('picks an English voice, the default one if there is one', () => {
    expect(pickLocalVoice([voice('fr-FR', true, true), voice('en-AU', true)])).toBe(1);
    expect(pickLocalVoice([voice('en-AU', true), voice('en-US', true, true)])).toBe(1);
    expect(pickLocalVoice([])).toBe(-1);
  });
});
