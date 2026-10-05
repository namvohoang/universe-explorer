import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('the address follows the place and the back button goes up one level', async ({ page }) => {
  await page.goto('/?speed=pause#titan');
  const name = page.locator('.card h2');
  await expect(name).toHaveText('Titan');
  await page.goBack();
  await expect(name).toHaveText('Saturn');
  await expect(page).toHaveURL(/#saturn$/);
  await page.goBack();
  await expect(name).toHaveText('Our Solar System');
  await expect(page).not.toHaveURL(/#/);
  await page.goForward();
  await expect(name).toHaveText('Saturn');
});

test('picking places keeps one step of history above the whole view', async ({ page }) => {
  await page.goto('/?speed=pause');
  const name = page.locator('.card h2');
  await page.locator('.chips button', { hasText: 'Mars' }).click();
  await expect(page).toHaveURL(/scale=easy#mars$/);
  await page.locator('.row-back').click();
  await page.locator('.chips button', { hasText: 'Venus' }).click();
  await expect(page).toHaveURL(/#venus$/);
  await page.goBack();
  await expect(name).toHaveText('Our Solar System');
  // The on-screen way out of a place leaves nothing behind to step back through.
  await page.locator('.chips button', { hasText: 'Venus' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(name).toHaveText('Our Solar System');
  await expect(page).not.toHaveURL(/#/);
});

test('an old link and an unknown place both open', async ({ page }) => {
  await page.goto('/?go=andromeda');
  await expect(page.locator('.card h2')).toHaveText('The Andromeda Galaxy');
  await expect(page).toHaveURL(/#andromeda$/);
  await page.goto('/?scale=true-sizes#no-such-place');
  await expect(page.locator('.card h2')).toHaveText('Our Solar System');
  await expect(page.locator('.view-menu')).toHaveText('True sizes');
});
