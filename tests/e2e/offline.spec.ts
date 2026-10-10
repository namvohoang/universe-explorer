import { expect, test } from '@playwright/test';

// These checks are about the service worker, which the other checks keep out of the way.
test.use({ serviceWorkers: 'allow', viewport: { width: 1024, height: 768 } });

interface Worker {
  shell: string[];
  rest: string[];
}

async function readWorker(text: string): Promise<Worker> {
  const list = (name: string): string[] => {
    const found = new RegExp(`const ${name} = (\\[.*?\\]);`).exec(text);
    return JSON.parse(found?.[1] ?? '[]') as string[];
  };
  return Promise.resolve({ shell: list('SHELL'), rest: list('REST') });
}

test('the first visit stores the first view and leaves the rest for later', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (/^\/(media|voice)\//.test(path)) asked.push(`.${path}`);
  });
  await page.goto('/?speed=pause');
  await expect(page.locator('.card')).toBeVisible();
  await page.waitForLoadState('networkidle');
  const worker = await readWorker(await (await page.request.get('/sw.js')).text());
  // Far more is left for later than is fetched up front.
  expect(worker.rest.length).toBeGreaterThan(worker.shell.length);
  expect(worker.shell).toContain('./');
  expect(worker.shell.some((file) => file.endsWith('.js'))).toBe(true);
  // Every picture the first view drew was in the first batch.
  expect(asked.length).toBeGreaterThan(5);
});

test('after a look at each scene the app works with no network', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.goto('/?speed=pause');
  await expect(page.locator('.card')).toBeVisible();
  await page.getByRole('tab', { name: 'Deep Space' }).click();
  await expect(page.locator('.card h2')).toHaveText('Proxima Centauri');
  await page.getByRole('tab', { name: 'Spaceships' }).click();
  await expect(page.locator('.card h2')).not.toHaveText('Proxima Centauri');
  await page.getByRole('tab', { name: 'Compare' }).click();
  // Compare's code is fetched and its planets drawn the first time it is opened: about 4 s on
  // a slow processor, as long as the usual 5 s wait, so it is given the time it takes.
  await expect(page.locator('.compare')).toBeVisible({ timeout: 20_000 });
  // The rest is fetched quietly once the page has settled.
  await expect(page.locator('html')).toHaveAttribute('data-offline', 'ready', { timeout: 90_000 });

  await context.setOffline(true);
  await page.goto('/?speed=pause#titan');
  await expect(page.locator('.card h2')).toHaveText('Titan');
  // A place never opened before, with its picture and its recording.
  await page.goto('/?speed=pause#whirlpool');
  await expect(page.locator('.card h2')).toHaveText('The Whirlpool Galaxy');
  await expect
    .poll(() =>
      page.locator('#picture-image').evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const heard = await page.evaluate(async () => {
    const response = await fetch('./voice/whirlpool.mp3');
    return response.ok;
  });
  expect(heard).toBe(true);
  // Opened for the first time on this page, now from the device's own store.
  await page.getByRole('tab', { name: 'Compare' }).click();
  await expect(page.locator('.compare')).toBeVisible({ timeout: 20_000 });
});
