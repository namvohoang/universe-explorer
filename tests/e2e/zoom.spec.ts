import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

test('zooming in with the pointer on a body zooms in on that body', async ({ page }) => {
  await page.goto('/?speed=pause');
  const saturn = page.getByRole('button', { name: 'Go to Saturn' });
  await expect(saturn).toBeVisible();
  await saturn.hover();
  await page.mouse.wheel(0, -100);
  // Saturn is now what the camera is on: its card, its address, and the middle of the view.
  await expect(page.locator('.card h2')).toHaveText('Saturn');
  await expect(page).toHaveURL(/#saturn$/);
  const middle = (): Promise<number[]> =>
    saturn.evaluate((marker) => {
      const box = marker.getBoundingClientRect();
      return [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)];
    });
  await expect.poll(middle).toEqual([720, 450]);

  // It is a step closer, not a jump all the way: Saturn is still small, and the wheel goes on.
  const neptune = page.getByRole('button', { name: 'Go to Neptune' });
  const before = await neptune.evaluate((marker) => marker.style.transform);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => neptune.evaluate((marker) => marker.style.transform)).not.toBe(before);
  await expect.poll(middle).toEqual([720, 450]);
});

test('zooming out with the pointer on another body stays with the one in view', async ({
  page,
}) => {
  await page.goto('/?speed=pause#saturn');
  await expect(page.locator('.card h2')).toHaveText('Saturn');
  await page.getByRole('button', { name: 'Zoom out' }).click();
  await page.getByRole('button', { name: 'Zoom out' }).click();
  const other = page.locator('.marker:visible:not([aria-label="Go to Saturn"])').first();
  await other.hover();
  await page.mouse.wheel(0, 300);
  await expect(page.locator('.card h2')).toHaveText('Saturn');
});
