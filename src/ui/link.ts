/** What a link into the app asks for: a place to open and how things are drawn. */
export interface Link {
  /** The id after the `#` (or in an old `?go=` link), not yet checked against the catalogue. */
  readonly place: string | null;
  /** The `?scale=` value, not yet checked against the scale modes. */
  readonly scale: string | null;
}

/**
 * Reads a link: `?scale=easy#saturn`. A scene in front of the id (`#deep/andromeda`) is allowed
 * and ignored, since the id alone says where it is. Old links used `?go=saturn`.
 */
export function parseLink(search: string, hash: string): Link {
  const query = new URLSearchParams(search);
  const fromHash = decodeURIComponent(hash.replace(/^#/, '')).split('/').pop() ?? '';
  const place = fromHash !== '' ? fromHash : query.get('go');
  return { place: place === '' ? null : place, scale: query.get('scale') };
}

/**
 * The query and hash for a place and a scale mode, keeping whatever else the link carried
 * (a date, a speed). The whole view has no hash.
 */
export function formatLink(search: string, place: string | null, scale: string): string {
  const query = new URLSearchParams(search);
  query.delete('go');
  query.set('scale', scale);
  return `?${query.toString()}${place === null ? '' : `#${encodeURIComponent(place)}`}`;
}
