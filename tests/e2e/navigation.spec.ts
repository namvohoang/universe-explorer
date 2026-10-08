import { test, expect, type Page } from '@playwright/test';
import { SCREENS } from './screens';

/** One address in each of the four scenes that have a view of their own. */
const SCENES = [
  ['Solar System', ''],
  ['Deep Space', '&go=andromeda'],
  ['Spaceships', '&go=space-shuttle'],
  ['Watch', '#watch/moon-phases'],
] as const;

/** Vietnamese runs longer, and is checked where the words are longest. */
const LANGUAGES = [
  { code: 'en', settings: 'Settings', skip: [] },
  { code: 'vi', settings: 'Cài đặt', skip: ['Spaceships'] },
] as const;

/** Sizes between and beyond the five screens, where a layout changes or runs out of room. */
const TIGHT = [
  { name: 'a narrow phone', width: 320, height: 568 },
  { name: 'just wider than a phone', width: 701, height: 900 },
  { name: 'a small tablet', width: 768, height: 1024 },
  { name: 'a small phone on its side', width: 667, height: 375 },
  { name: 'a phone on its side', width: 740, height: 360 },
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

      // One load of each scene serves every check: a load is the slow part where 3D is drawn in
      // software.
      test('every tab has its word, and the one settings button stays put', async ({ page }) => {
        test.setTimeout(90_000);
        const places: string[] = [];
        for (const [scene, place] of SCENES) {
          if ((language.skip as readonly string[]).includes(scene)) continue;
          await open(page, language.code, place);
          expect(await hiddenWords(page, '#main-tabs [role="tab"]'), scene).toEqual([]);

          // Every group of places shows its word and is big enough to tap. The spaceships are
          // one group, so they have no switch.
          const groups = page.locator('.place-row .tabs [role="tab"]:visible');
          if (scene === 'Spaceships') await expect(groups).toHaveCount(0);
          else expect(await groups.count(), scene).toBeGreaterThan(1);
          expect(await hiddenWords(page, '.place-row .tabs [role="tab"]'), scene).toEqual([]);
          for (const group of await groups.all()) {
            const box = await group.boundingBox();
            expect(box?.width, scene).toBeGreaterThanOrEqual(44);
            expect(box?.height, scene).toBeGreaterThanOrEqual(44);
          }
          // With the longest count there can be beside it, a group still fits its own button
          // and its row.
          const spilt = await groups.evaluateAll(
            (tabs) =>
              tabs.filter((tab) => {
                const note = tab.querySelector('.tab-note');
                const row = tab.closest('.tabs');
                if (!note || !row) return true;
                note.textContent = '12/13';
                const within = row.getBoundingClientRect();
                const own = tab.getBoundingClientRect();
                const spills = [...tab.querySelectorAll('.tab-note, .tab-label, .icon')].some(
                  (part) => {
                    const box = part.getBoundingClientRect();
                    return (
                      box.width > 0 &&
                      (box.left < own.left - 0.5 ||
                        box.right > own.right + 0.5 ||
                        box.right > within.right + 0.5)
                    );
                  },
                );
                return spills || own.right > within.right + 0.5;
              }).length,
          );
          expect(spilt, scene).toBe(0);

          // The groups do not crowd out what they hold: the chip of the place or story in view
          // is whole on the screen. On a phone on its side the row is kept to one line, and
          // there the chip at least starts in sight, with room for its name to begin.
          const chosen = page.locator('.chips:visible button[aria-current="true"]');
          if ((await chosen.count()) > 0) {
            const chip = await chosen.first().boundingBox();
            const row = await page.locator('.chips:visible').first().boundingBox();
            if (!chip || !row) throw new Error('not on the page');
            const end = Math.min(row.x + row.width, screen.width);
            expect(chip.x, scene).toBeGreaterThanOrEqual(row.x - 4);
            if (screen.height > 500)
              expect(chip.x + chip.width, scene).toBeLessThanOrEqual(end + 0.5);
            else expect(end - chip.x, scene).toBeGreaterThanOrEqual(Math.min(chip.width, 120));
          }

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

for (const screen of TIGHT) {
  for (const language of LANGUAGES) {
    test(`the bars keep clear of each other on ${screen.name}, ${language.code}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
      // The longest sentence about scale, and the hint of a first visit, are both on show.
      await open(page, language.code, '&scale=true-sizes');
      await expect(page.locator('#first-hint')).toBeVisible();
      await expect(page.locator('#scale-label')).toBeVisible();
      expect(await hiddenWords(page, '.tabs [role="tab"]')).toEqual([]);

      const parts = page.locator(
        [
          '.brand h1',
          '#scale-label',
          '.view-menu',
          '.settings-button',
          '.top .clock',
          '#main-tabs',
          '.card',
          '.place-row',
          '#view-controls',
          '#first-hint',
        ].join(', '),
      );
      const lying = await parts.evaluateAll((all) => {
        const shown = all.filter((part) => part.getClientRects().length > 0);
        const found: string[] = [];
        const name = (part: Element): string => part.id || part.className;
        for (const [i, a] of shown.entries()) {
          const one = a.getBoundingClientRect();
          if (one.left < -0.5 || one.right > window.innerWidth + 0.5) found.push(name(a));
          for (const b of shown.slice(i + 1)) {
            if (a.contains(b) || b.contains(a)) continue;
            const other = b.getBoundingClientRect();
            if (
              one.left < other.right - 0.5 &&
              other.left < one.right - 0.5 &&
              one.top < other.bottom - 0.5 &&
              other.top < one.bottom - 0.5
            ) {
              found.push(`${name(a)} on ${name(b)}`);
            }
          }
        }
        return found;
      });
      expect(lying).toEqual([]);

      // Something is left of the height for the view itself.
      const free = await page.evaluate(() => {
        const top = document.querySelector('.top')?.getBoundingClientRect().bottom ?? 0;
        const tray = document.querySelector('#tray')?.getBoundingClientRect().top ?? 0;
        return (tray - top) / window.innerHeight;
      });
      expect(free).toBeGreaterThanOrEqual(0.25);
    });
  }
}
