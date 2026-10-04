/** What a picture actually is. Anything that is not a plain photo is labelled for the kid. */
export const MEDIA_KINDS = [
  'photo',
  'composite',
  'false-colour',
  'artist-concept',
  /** Taken from an agency's 3D model whose page does not say how it was made. */
  'agency-model',
  'simulation',
  'diagram',
] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_ROLES = ['surface-map', 'ring-map', 'picture', 'model'] as const;
export type MediaRole = (typeof MEDIA_ROLES)[number];

/** An image or texture shown for an object. Its credit and licence live in CREDITS.md. */
export interface MediaRef {
  readonly file: `public/media/${string}`;
  readonly kind: MediaKind;
  readonly role: MediaRole;
  /** Key of the alt text in the UI strings. All user-facing text lives there, not here. */
  readonly altKey: string;
  /** The credit line, exactly as in CREDITS.md, for a picture shown with its credit on screen. */
  readonly credit?: string;
  /** Set when part of a surface map is blank or blurred because nobody has photographed it. */
  readonly unseen?: true;
}
