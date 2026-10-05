/**
 * The space passport: which places have been opened. It is kept as a list of place ids in
 * this browser only (see storage.ts) and holds nothing about who is using the app.
 */

/** Reads a saved list, keeping only ids that are still places. Anything unreadable is empty. */
export function parseVisited(saved: string | null, known: ReadonlySet<string>): Set<string> {
  if (saved === null) return new Set();
  try {
    const list: unknown = JSON.parse(saved);
    if (!Array.isArray(list)) return new Set();
    return new Set(list.filter((id): id is string => typeof id === 'string' && known.has(id)));
  } catch {
    return new Set();
  }
}

export function formatVisited(visited: ReadonlySet<string>): string {
  return JSON.stringify([...visited].sort());
}
