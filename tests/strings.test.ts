import { describe, expect, it } from 'vitest';
import { SCALE_MODES, createScale } from '../src/sim/scale';
import { en } from '../src/ui/strings/en';

describe('strings', () => {
  it('has the on-screen scale sentence for every scale mode', () => {
    for (const mode of SCALE_MODES) {
      expect(en[createScale(mode).labelKey]).toMatch(/\S/);
    }
  });
});
