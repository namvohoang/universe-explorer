/**
 * Small notes kept in this browser only: nothing here is ever sent anywhere, and nothing says
 * who is using the app. A browser may refuse storage (private windows do); then the notes are
 * simply not kept, and the app works the same.
 */
const PREFIX = 'universe-explorer:';

export function recall(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function remember(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Not kept. See above.
  }
}

export function forget(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to remove. See above.
  }
}
