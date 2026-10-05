import type { MediaKind } from '../../data/types';
import { words } from './index';

/**
 * The sentence shown to the kid for a picture that is not a plain photo, or `null` for a
 * photo, which needs none.
 */
export function mediaKindLabel(kind: MediaKind): string | null {
  switch (kind) {
    case 'photo':
      return null;
    case 'composite':
      return words.mediaKindComposite;
    case 'false-colour':
      return words.mediaKindFalseColour;
    case 'artist-concept':
      return words.mediaKindArtistConcept;
    case 'agency-model':
      return words.mediaKindAgencyModel;
    case 'simulation':
      return words.mediaKindSimulation;
    case 'diagram':
      return words.mediaKindDiagram;
    default:
      return kind satisfies never;
  }
}
