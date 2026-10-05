import { expect, test } from '@playwright/test';

test('nothing the page asks for is missing, and nothing comes from another site', async ({
  page,
  baseURL,
}) => {
  const missing: string[] = [];
  const foreign: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) missing.push(`${String(response.status())} ${response.url()}`);
  });
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith(baseURL ?? '') && !/^(data|blob):/.test(url)) foreign.push(url);
  });
  await page.goto('/?speed=pause#saturn');
  await expect(page.locator('.card')).toBeVisible();
  for (const file of ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
    expect((await page.request.get(`/${file}`)).status(), file).toBe(200);
  }
  await page.waitForLoadState('networkidle');
  expect(missing).toEqual([]);
  expect(foreign).toEqual([]);
});

test('the web manifest lets the app be installed full screen', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const response = await page.request.get(new URL(href ?? '', page.url()).href);
  expect(response.status()).toBe(200);
  const manifest = (await response.json()) as {
    display: string;
    start_url: string;
    scope: string;
    background_color: string;
    theme_color: string;
    icons: { src: string; sizes: string }[];
  };
  expect(manifest.display).toBe('standalone');
  // Relative, so it is right under whatever path the site is served from.
  expect(manifest.start_url).toBe('./');
  expect(manifest.scope).toBe('./');
  expect(manifest.background_color).toBe('#060914');
  expect(manifest.theme_color).toBe('#060914');
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512']),
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#060914');
});
