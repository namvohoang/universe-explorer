import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

test('the wheel zooms with the pointer on a body, not only beside it', async ({ page }) => {
  await page.goto('/?speed=pause');
  const saturn = page.getByRole('button', { name: 'Go to Saturn' });
  const neptune = page.getByRole('button', { name: 'Go to Neptune' });
  await expect(saturn).toBeVisible();
  const before = await neptune.evaluate((marker) => marker.style.transform);
  await saturn.hover();
  await page.mouse.wheel(0, -400);
  await expect.poll(() => neptune.evaluate((marker) => marker.style.transform)).not.toBe(before);
  // Zooming is not picking: the card stays on the whole view.
  await expect(page.locator('.card h2')).toHaveText('Our Solar System');
});
