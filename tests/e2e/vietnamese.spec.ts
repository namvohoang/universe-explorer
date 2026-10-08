import { expect, test } from '@playwright/test';
import { SCREENS } from './screens';

test('Vietnamese shows the words in Vietnamese and offers no reading aloud', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?speed=pause&lang=vi#saturn');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('.brand h1')).toHaveText('Khám Phá Vũ Trụ');
  await expect(page.locator('.card h2')).toHaveText('Sao Thổ');
  await expect(page.locator('.card .eyebrow')).toHaveText('Hành tinh · thứ 6 tính từ Mặt Trời');
  await expect(page.getByRole('tab', { name: 'Vũ trụ xa' })).toBeVisible();
  // There are no Vietnamese recordings, and an English voice must not read Vietnamese.
  await expect(page.locator('.card-actions .primary')).toBeHidden();
  // The title is drawn in a font that has Vietnamese letters.
  const font = await page.locator('.brand h1').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain('Baloo 2');
  expect(
    await page.evaluate(() => document.fonts.check('800 24px "Baloo 2"', 'Khám Phá Vũ Trụ')),
  ).toBe(true);
});

test('the language is chosen in the settings and remembered', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?speed=pause#mars');
  await page.locator('.view-menu').click();
  await page.getByRole('button', { name: 'Tiếng Việt' }).click();
  await expect(page.locator('.card h2')).toHaveText('Sao Hỏa');
  await expect(page).toHaveURL(/#mars$/);
  await page.goto('/?speed=pause');
  await expect(page.locator('.brand h1')).toHaveText('Khám Phá Vũ Trụ');
  await page.locator('.view-menu').click();
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('.brand h1')).toHaveText('Universe Explorer');
  await expect(page.getByRole('button', { name: 'Read it to me' })).toBeVisible();
});

test('the language can be chosen away from the Solar System', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?speed=pause&go=andromeda');
  await expect(page.locator('.view-menu')).toBeHidden();
  await page.locator('.phone-menu').click();
  await page.getByRole('button', { name: 'Tiếng Việt' }).click();
  await expect(page.locator('.brand h1')).toHaveText('Khám Phá Vũ Trụ');
});

test('the names can be switched off in a story', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#watch/moon-phases');
  await page.locator('.phone-menu').click();
  const sheet = page.locator('.settings');
  await expect(sheet.getByRole('radio')).toHaveCount(0);
  await sheet.getByRole('switch').click();
  await expect(page.locator('#markers')).toHaveClass(/no-names/);
});

for (const screen of SCREENS) {
  test(`Vietnamese fits on ${screen.name}`, async ({ page }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await page.goto('/?speed=pause&lang=vi#earth');
    await expect(page.locator('.card')).toBeVisible();
    // Nothing is wider than the screen, and the chips stay on one line.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const chips = await page.locator('.chips').boundingBox();
    expect(chips?.height).toBeLessThan(70);
    for (const part of await page.locator('.top > *, .tools > *, #main-tabs .tabs').all()) {
      const box = await part.boundingBox();
      if (!box || !(await part.isVisible())) continue;
      expect(box.x, (await part.getAttribute('class')) ?? '').toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(screen.width + 0.5);
    }
    if (screen.width >= 1024) {
      const title = await page.locator('.brand h1').boundingBox();
      const tabs = await page.locator('.top .tabs').boundingBox();
      expect(tabs?.y).toBeLessThan((title?.y ?? 0) + (title?.height ?? 0));
    }
  });
}
