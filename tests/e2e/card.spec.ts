import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('Next and Previous step through the row of places', async ({ page }) => {
  await page.goto('/?speed=pause#venus');
  const name = page.locator('.card h2');
  await expect(page.getByRole('button', { name: 'Before: Mercury' })).toBeVisible();
  await page.getByRole('button', { name: 'Next: Earth' }).click();
  await expect(name).toHaveText('Earth');
  // At Earth the row is Earth and what goes round it, so Next is the Moon.
  await page.getByRole('button', { name: 'Next: The Moon' }).click();
  await expect(name).toHaveText('The Moon');
  await page.getByRole('button', { name: 'Before: Earth' }).click();
  await expect(name).toHaveText('Earth');
  await expect(page.locator('.card-actions .step:not(.next)')).toBeHidden();
});

test('a card shows two facts and the rest on request', async ({ page }) => {
  await page.goto('/?speed=pause#jupiter');
  const facts = page.locator('.facts li');
  await expect(facts).toHaveCount(3);
  await expect(facts.nth(1)).toBeVisible();
  await expect(facts.nth(2)).toBeHidden();
  await page.getByRole('button', { name: 'More facts' }).click();
  await expect(facts.nth(2)).toBeVisible();
  await expect(page.getByRole('button', { name: 'More facts' })).toBeHidden();
});

test('the line being read aloud is lit up', async ({ page }) => {
  await page.goto('/?speed=pause#mars');
  await page.getByRole('button', { name: 'Read it to me' }).click();
  await expect(page.locator('.card .reading')).toHaveCount(1);
  await page.getByRole('button', { name: 'Stop reading' }).click();
  await expect(page.locator('.card .reading')).toHaveCount(0);
});
