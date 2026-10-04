/**
 * Where the app serves a file kept under `public/` from. Outside the built app (in a script
 * run by Node) there is no site, so the path is given relative to the page.
 */
export function mediaUrl(file: string): string {
  const base = (import.meta.env as ImportMetaEnv | undefined)?.BASE_URL ?? './';
  return base + file.replace(/^public\//, '');
}
