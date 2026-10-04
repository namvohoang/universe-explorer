import { describe, expect, it } from 'vitest';
import { catalogue } from '../src/data/catalogue';
import { MEDIA_KINDS } from '../src/data/types';
import { SCALE_MODES, createScale } from '../src/sim/scale';
import { en } from '../src/ui/strings/en';
import { mediaKindLabel } from '../src/ui/strings/media';

describe('strings', () => {
  it('has the on-screen scale sentence for every scale mode', () => {
    for (const mode of SCALE_MODES) {
      expect(en[createScale(mode).labelKey]).toMatch(/\S/);
    }
  });

  it('has alt text for every picture in the catalogue', () => {
    const strings: Record<string, string> = en;
    for (const object of catalogue) {
      for (const media of object.media) {
        expect(strings[media.altKey], `${object.id}: ${media.altKey}`).toMatch(/\S/);
      }
    }
  });

  it('labels every kind of picture that is not a plain photo', () => {
    for (const kind of MEDIA_KINDS) {
      if (kind === 'photo') expect(mediaKindLabel(kind)).toBeNull();
      else expect(mediaKindLabel(kind)).toMatch(/\S/);
    }
  });
});
