import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1024, height: 768 } });

test('the first visit shows a hint that goes at the first touch and does not come back', async ({
  page,
}) => {
  await page.goto('/?speed=pause');
  const hint = page.locator('#first-hint');
  await expect(hint).toHaveText('Tap a planet to fly there');
  await expect(page.locator('.marker.pointed')).toHaveAttribute('aria-label', 'Go to Earth');
  await page.mouse.click(600, 300);
  await expect(hint).toBeHidden();
  await expect(page.locator('.marker.pointed')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.card')).toBeVisible();
  await expect(hint).toBeHidden();
});

test('every marker can be tapped on a spot at least 44 px across', async ({ page }) => {
  await page.goto('/?speed=pause');
  await expect(page.locator('.marker:visible').first()).toBeVisible();
  const markers = await page.locator('.marker:visible').all();
  expect(markers.length).toBeGreaterThan(5);
  for (const marker of markers) {
    const box = await marker.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
