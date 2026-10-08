import { test, expect, type Page } from '@playwright/test';
import { SCREENS } from './screens';

/** One address in each of the four scenes that have a view of their own. */
const SCENES = [
  ['Solar System', ''],
  ['Deep Space', '&go=andromeda'],
  ['Spaceships', '&go=space-shuttle'],
  ['Watch', '#watch/moon-phases'],
] as const;

const LANGUAGES = [
  { code: 'en', settings: 'Settings' },
  { code: 'vi', settings: 'Cài đặt' },
] as const;

async function open(page: Page, language: string, place: string): Promise<void> {
  await page.goto(`/?speed=pause&lang=${language}${place}`);
  await expect(page.locator('#main-tabs [role="tab"]')).toHaveCount(5);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * The tabs on show whose word cannot be read in full: there is none, it is cut short, or it lies
 * outside its row or the screen. A word scrolled out of its row counts as hidden, though
 * Playwright calls it visible.
 */
async function hiddenWords(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluateAll((tabs) =>
    tabs
      .filter((tab) => tab.getClientRects().length > 0)
      .filter((tab) => {
        const label = tab.querySelector('.tab-label');
        const row = tab.closest('.tabs');
        if (!label || !row || label.textContent.trim() === '') return true;
        const word = label.getBoundingClientRect();
        const within = row.getBoundingClientRect();
        return (
          word.width === 0 ||
          word.height === 0 ||
          label.scrollWidth > label.clientWidth + 1 ||
          word.left < Math.max(0, within.left) - 0.5 ||
          word.right > Math.min(window.innerWidth, within.right) + 0.5 ||
          word.top < within.top - 0.5 ||
          word.bottom > Math.min(window.innerHeight, within.bottom) + 0.5
        );
      })
      .map((tab) => tab.getAttribute('title') ?? ''),
  );
}

for (const screen of SCREENS) {
  for (const language of LANGUAGES) {
    test.describe(`${screen.name}, ${language.code}`, () => {
      test.use({ viewport: { width: screen.width, height: screen.height } });

      test('every main tab shows its word', async ({ page }) => {
        for (const [scene, place] of SCENES) {
          await open(page, language.code, place);
          expect(await hiddenWords(page, '#main-tabs [role="tab"]'), scene).toEqual([]);
        }
      });

      test('every group of places shows its word and is big enough to tap', async ({ page }) => {
        for (const [scene, place] of SCENES) {
          await open(page, language.code, place);
          const groups = page.locator('.place-row .tabs [role="tab"]:visible');
          // The spaceships are one group, so they have no switch.
          if (scene === 'Spaceships') {
            await expect(groups).toHaveCount(0);
            continue;
          }
          expect(await groups.count(), scene).toBeGreaterThan(1);
          expect(await hiddenWords(page, '.place-row .tabs [role="tab"]'), scene).toEqual([]);
          for (const group of await groups.all()) {
            const box = await group.boundingBox();
            expect(box?.width, scene).toBeGreaterThanOrEqual(44);
            expect(box?.height, scene).toBeGreaterThanOrEqual(44);
          }
        }
      });

      test('one settings button, in the same place in every scene', async ({ page }) => {
        const places: string[] = [];
        for (const [scene, place] of SCENES) {
          await open(page, language.code, place);
          const button = page.getByRole('button', { name: language.settings, exact: true });
          await expect(button, scene).toHaveCount(1);
          const box = await button.boundingBox();
          if (!box) throw new Error('not on the page');
          expect(box.width, scene).toBeGreaterThanOrEqual(44);
          expect(box.height, scene).toBeGreaterThanOrEqual(44);
          expect(box.x + box.width, scene).toBeLessThanOrEqual(screen.width);
          // It is the last thing in the top bar: nothing there is further right.
          for (const part of await page.locator('.top > *:visible').all()) {
            if ((await part.getAttribute('id')) === 'main-tabs') continue;
            const other = await part.boundingBox();
            if (other) expect(other.x + other.width, scene).toBeLessThanOrEqual(box.x + box.width);
          }
          // Wider than a phone it carries its word, and the word is inside the button.
          const word = button.locator('.wide-label');
          if (screen.width > 700) {
            await expect(word, scene).toHaveText(language.settings);
            const inside = await word.boundingBox();
            if (!inside) throw new Error('not on the page');
            expect(inside.x, scene).toBeGreaterThanOrEqual(box.x);
            expect(inside.x + inside.width, scene).toBeLessThanOrEqual(box.x + box.width);
            expect(inside.y, scene).toBeGreaterThanOrEqual(box.y);
            expect(inside.y + inside.height, scene).toBeLessThanOrEqual(box.y + box.height);
          }
          places.push(JSON.stringify(box));
          await button.click();
          await expect(page.locator('.settings')).toBeVisible();
        }
        expect(new Set(places).size, places.join(' ')).toBe(1);
      });
    });
  }

  test(`what is to scale is said on screen on ${screen.name}`, async ({ page }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    await open(page, 'en', '');
    const label = page.locator('#scale-label');
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Drawn bigger and closer so you can see everything.');
    const box = await label.boundingBox();
    if (!box) throw new Error('not on the page');
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(screen.width);
    expect(box.y).toBeGreaterThanOrEqual(0);

    // The pill that names the view opens the same settings, at the choice of scale.
    const pill = page.locator('.view-menu');
    await expect(pill).toContainText('Easy view');
    await pill.click();
    const settings = page.locator('.settings');
    await expect(settings).toBeVisible();
    await settings.getByRole('radio', { name: /^Real/ }).click();
    await expect(label).toHaveText('Real sizes and real distances.');
    await expect(pill).toContainText('Real');

    // A story changes the scale to suit itself, and still says so where it can be seen.
    await open(page, 'en', '#watch/moon-phases');
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Real sizes and real distances.');
  });
}
