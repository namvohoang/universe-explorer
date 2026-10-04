import type { MediaKind } from '../../data/types';
import { en } from './en';

/**
 * The sentence shown to the kid for a picture that is not a plain photo, or `null` for a
 * photo, which needs none.
 */
export function mediaKindLabel(kind: MediaKind): string | null {
  switch (kind) {
    case 'photo':
      return null;
    case 'composite':
      return en.mediaKindComposite;
    case 'false-colour':
      return en.mediaKindFalseColour;
    case 'artist-concept':
      return en.mediaKindArtistConcept;
    case 'agency-model':
      return en.mediaKindAgencyModel;
    case 'simulation':
      return en.mediaKindSimulation;
    case 'diagram':
      return en.mediaKindDiagram;
    default:
      return kind satisfies never;
  }
}
