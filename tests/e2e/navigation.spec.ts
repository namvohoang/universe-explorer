import { test, expect } from '@playwright/test';
import { SCREENS } from './screens';

for (const [name, viewport] of Object.entries(SCREENS)) {
  test(`tabs are labelled at all widths (${name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?speed=pause');

    // Wait for tabs to render
    const tabs = page.locator('#main-tabs [role="tab"]');
    await expect(tabs).toHaveCount(5);

    // Every tab must have visible text
    for (let i = 0; i < 5; i++) {
      const tab = tabs.nth(i);
      const label = tab.locator('.tab-label');
      await expect(label).toBeVisible();

      const box = await label.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  test(`category options are labelled (${name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?speed=pause');

    // Wait for category tabs (in the place row) to render. In the main solar system, it's 3 tabs.
    const placeRowTabs = page.locator(
      '.place-row .tabs[aria-label="Kinds of places"]:not([hidden]) [role="tab"]',
    );
    await expect(placeRowTabs).toHaveCount(3);

    // Every category option must have visible text
    for (let i = 0; i < 3; i++) {
      const tab = placeRowTabs.nth(i);
      const label = tab.locator('.tab-label');
      await expect(label).toBeVisible();

      const box = await label.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }

      const tabBox = await tab.boundingBox();
      expect(tabBox).toBeTruthy();
      if (tabBox) {
        expect(tabBox.width).toBeGreaterThanOrEqual(44);
        expect(tabBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
}
