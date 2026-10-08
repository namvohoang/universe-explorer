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
  // Measured in one go: the markers move with the bodies, and some hide as they cross.
  const sizes = await page.locator('.marker:visible').evaluateAll((markers) =>
    markers.map((marker) => {
      const box = marker.getBoundingClientRect();
      // The marker is moved by a transform, which leaves float noise in the last decimals.
      return Math.round(Math.min(box.width, box.height) * 100) / 100;
    }),
  );
  expect(sizes.length).toBeGreaterThan(5);
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(44);
});

test('the places opened are ticked off, counted, and can be cleared', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?speed=pause#venus');
  await page.getByRole('button', { name: 'Next: Earth' }).click();
  await page.locator('.row-back').click();
  const planets = page.getByRole('tab', { name: /^Planets/ });
  await expect(planets).toContainText('2/9');
  await expect(page.locator('.chips button.visited')).toHaveCount(2);
  // It is still there after closing and opening the app.
  await page.goto('/?speed=pause');
  await expect(planets).toContainText('2/9');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'For grown-ups' }).click();
  await page.getByRole('button', { name: 'Clear progress' }).click();
  await expect(page.getByText('Progress cleared.')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(planets).not.toContainText('/9');
  await expect(page.locator('.chips button.visited')).toHaveCount(0);
});
